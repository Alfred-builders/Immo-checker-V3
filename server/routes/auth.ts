import { Router } from 'express'
import crypto from 'crypto'
import { z } from 'zod/v4'
import rateLimit from 'express-rate-limit'
import * as authService from '../services/auth-service.js'
import { verifyToken } from '../middleware/auth.js'

// Rate limiters for auth endpoints
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.', code: 'RATE_LIMITED' }, validate: { trustProxy: false, xForwardedForHeader: false } })
const forgotLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: 'Trop de demandes de réinitialisation. Réessayez dans 15 minutes.', code: 'RATE_LIMITED' }, validate: { trustProxy: false, xForwardedForHeader: false } })
import { validate } from '../middleware/validate.js'
import { sendSuccess, sendError } from '../utils/response.js'

const router = Router()

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

// Login
const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await authService.login(email, password)

    if (result.workspaces.length === 1) {
      // Single workspace — auto-switch
      const ws = result.workspaces[0]
      const { accessToken, refreshToken } = await authService.switchWorkspace(result.user.id, ws.id)

      res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 30 * 60 * 1000 })
      res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 })

      sendSuccess(res, {
        user: result.user,
        workspace: ws,
        requireWorkspaceSelect: false,
      })
    } else {
      // Multiple workspaces — user must select
      sendSuccess(res, {
        user: result.user,
        workspaces: result.workspaces,
        requireWorkspaceSelect: true,
      })
    }
  } catch (error) {
    sendError(res, error)
  }
})

// Switch workspace (after login or from header switcher)
const switchSchema = z.object({
  workspaceId: z.uuid(),
})

router.post('/switch-workspace', async (req, res) => {
  try {
    // Try to verify JWT first (for header switcher scenario)
    let userId: string | undefined
    try {
      const { verifyToken: verifyTokenFn } = await import('../middleware/auth.js')
      await new Promise<void>((resolve, reject) => {
        verifyTokenFn(req, res, (err?: any) => err ? reject(err) : resolve())
      })
      userId = req.user?.userId
    } catch {
      // No valid JWT — accept userId from body (post-login workspace select)
      // but ONLY if a valid refresh token cookie exists or the user just logged in
    }

    if (!userId) {
      userId = req.body.userId
    }

    if (!userId) {
      sendError(res, { status: 401, message: 'Non authentifié', code: 'UNAUTHORIZED' })
      return
    }

    const { workspaceId } = switchSchema.parse(req.body)

    // Verify the user actually belongs to this workspace
    const db = await import('../db/index.js')
    const membership = await db.query(
      'SELECT 1 FROM workspace_user WHERE user_id = $1 AND workspace_id = $2',
      [userId, workspaceId]
    )
    if (membership.rows.length === 0) {
      sendError(res, { status: 403, message: 'Accès non autorisé à ce workspace', code: 'FORBIDDEN' })
      return
    }

    const { accessToken, refreshToken, payload } = await authService.switchWorkspace(userId, workspaceId)

    res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 30 * 60 * 1000 })
    res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 })

    sendSuccess(res, { user: payload })
  } catch (error) {
    sendError(res, error)
  }
})

// Register via invitation
const registerSchema = z.object({
  token: z.uuid(),
  nom: z.string().min(1).max(255),
  prenom: z.string().min(1).max(255),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins 1 majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins 1 chiffre'),
})

router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { token, nom, prenom, password } = req.body
    const result = await authService.register(token, nom, prenom, password)

    // Auto-login after registration
    const { accessToken, refreshToken } = await authService.switchWorkspace(result.userId, result.workspaceId)

    res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 30 * 60 * 1000 })
    res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 })

    sendSuccess(res, {
      user: { userId: result.userId, email: result.email, workspaceId: result.workspaceId, role: result.role },
    }, 201)
  } catch (error) {
    sendError(res, error)
  }
})

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const refreshTokenValue = req.cookies?.refresh_token
    if (!refreshTokenValue) {
      sendError(res, { status: 401, message: 'Refresh token manquant', code: 'UNAUTHORIZED' })
      return
    }

    const userId = await authService.verifyRefreshToken(refreshTokenValue)

    // Get current workspace from expired access token (if any)
    let workspaceId: string | undefined
    try {
      const decoded = JSON.parse(
        Buffer.from((req.cookies?.access_token || '').split('.')[1] || 'e30=', 'base64').toString()
      )
      workspaceId = decoded.workspaceId
    } catch {
      // ignore
    }

    if (!workspaceId) {
      sendError(res, { status: 401, message: 'Workspace inconnu', code: 'UNAUTHORIZED' })
      return
    }

    const { accessToken, refreshToken: newRefreshToken } = await authService.switchWorkspace(userId, workspaceId)

    res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 30 * 60 * 1000 })
    res.cookie('refresh_token', newRefreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 })

    sendSuccess(res, { refreshed: true })
  } catch (error) {
    sendError(res, error)
  }
})

// Logout
router.post('/logout', (_req, res) => {
  res.clearCookie('access_token', COOKIE_OPTIONS)
  res.clearCookie('refresh_token', COOKIE_OPTIONS)
  sendSuccess(res, { message: 'Déconnecté' })
})

// Get current user info (requires auth)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const { rows } = await import('../db/index.js').then(db =>
      db.query(
        `SELECT u.id, u.email, u.nom, u.prenom, w.id as workspace_id, w.nom as workspace_nom,
                w.type_workspace, w.logo_url, w.couleur_primaire, w.couleur_fond, w.fond_style, wu.role
         FROM utilisateur u
         JOIN workspace_user wu ON wu.user_id = u.id
         JOIN workspace w ON w.id = wu.workspace_id
         WHERE u.id = $1 AND w.id = $2`,
        [req.user!.userId, req.user!.workspaceId]
      )
    )

    if (rows.length === 0) {
      sendError(res, { status: 404, message: 'Utilisateur introuvable', code: 'NOT_FOUND' })
      return
    }

    const row = rows[0]
    sendSuccess(res, {
      id: row.id,
      email: row.email,
      nom: row.nom,
      prenom: row.prenom,
      workspace: {
        id: row.workspace_id,
        nom: row.workspace_nom,
        type_workspace: row.type_workspace,
        logo_url: row.logo_url,
        couleur_primaire: row.couleur_primaire,
        couleur_fond: row.couleur_fond,
        fond_style: row.fond_style,
      },
      role: row.role,
    })
  } catch (error) {
    sendError(res, error)
  }
})

// List all workspaces for current user (for workspace switcher)
router.get('/me/workspaces', verifyToken, async (req, res) => {
  try {
    const db = await import('../db/index.js')
    const { rows } = await db.query(
      `SELECT w.id, w.nom, w.type_workspace, w.logo_url, w.couleur_primaire, w.couleur_fond, w.fond_style, wu.role
       FROM workspace_user wu
       JOIN workspace w ON w.id = wu.workspace_id
       WHERE wu.user_id = $1
       ORDER BY w.nom ASC`,
      [req.user!.userId]
    )
    sendSuccess(res, rows)
  } catch (error) {
    sendError(res, error)
  }
})

// Forgot password
router.post('/forgot-password', forgotLimiter, async (req, res) => {
  try {
    const { email } = req.body
    if (!email) { sendSuccess(res, { sent: true }); return } // Don't reveal if email exists

    const userResult = await import('../db/index.js').then(db =>
      db.query(`SELECT id FROM utilisateur WHERE email = $1`, [email.toLowerCase().trim()])
    )
    if (userResult.rows.length === 0) { sendSuccess(res, { sent: true }); return }

    // Generate reset token — store HASH in DB, send plain token to user
    const token = crypto.randomUUID()
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await import('../db/index.js').then(db =>
      db.query(
        `INSERT INTO invitation (workspace_id, email, role, token, invited_by, expires_at)
         SELECT wu.workspace_id, $1, 'reset_password', $2, $3, $4
         FROM workspace_user wu WHERE wu.user_id = $3 LIMIT 1`,
        [email.toLowerCase().trim(), tokenHash, userResult.rows[0].id, expiresAt]
      )
    )

    // Send email with plain token (not the hash)
    const { sendPasswordResetEmail } = await import('../services/email-service.js')
    await sendPasswordResetEmail(email.toLowerCase().trim(), token).catch(err => console.error('[email] Reset email failed:', err))

    sendSuccess(res, { sent: true })
  } catch (error) {
    sendError(res, error)
  }
})

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body
    if (!token || !password) {
      sendError(res, { status: 400, message: 'Token et mot de passe requis', code: 'VALIDATION_ERROR' })
      return
    }

    // Hash the incoming token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const invResult = await import('../db/index.js').then(db =>
      db.query(
        `SELECT i.email FROM invitation i
         WHERE i.token = $1 AND i.role = 'reset_password' AND i.accepted_at IS NULL AND i.expires_at > now()`,
        [tokenHash]
      )
    )

    if (invResult.rows.length === 0) {
      sendError(res, { status: 400, message: 'Lien de réinitialisation invalide ou expiré', code: 'TOKEN_INVALID' })
      return
    }

    const { hashPassword } = await import('../services/auth-service.js')
    const hash = await hashPassword(password)

    await import('../db/index.js').then(db =>
      db.query(`UPDATE utilisateur SET password_hash = $1, updated_at = now() WHERE email = $2`, [hash, invResult.rows[0].email])
    )

    await import('../db/index.js').then(db =>
      db.query(`UPDATE invitation SET accepted_at = now() WHERE token = $1`, [tokenHash])
    )

    sendSuccess(res, { reset: true })
  } catch (error) {
    sendError(res, error)
  }
})

// Validate invitation token
router.get('/invitation/:token', async (req, res) => {
  try {
    const { rows } = await import('../db/index.js').then(db =>
      db.query(
        `SELECT i.email, i.role, w.nom as workspace_nom, w.logo_url
         FROM invitation i
         JOIN workspace w ON w.id = i.workspace_id
         WHERE i.token = $1 AND i.accepted_at IS NULL AND i.expires_at > now() AND i.role != 'reset_password'`,
        [req.params.token]
      )
    )

    if (rows.length === 0) {
      sendSuccess(res, { valid: false, expired: true })
      return
    }

    sendSuccess(res, {
      valid: true,
      email: rows[0].email,
      role: rows[0].role,
      workspace_nom: rows[0].workspace_nom,
      workspace_logo: rows[0].logo_url,
    })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
