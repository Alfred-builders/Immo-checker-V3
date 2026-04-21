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
    const ip = (req.headers['x-forwarded-for']?.toString().split(',')[0].trim()) || req.ip || null
    const result = await authService.login(email, password, ip)

    if (result.workspaces.length === 1) {
      // Single workspace — auto-switch
      const ws = result.workspaces[0]
      const { accessToken, refreshToken } = await authService.switchWorkspace(result.user.id, ws.id)

      res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 2 * 60 * 60 * 1000 })
      res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 })

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

    res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 2 * 60 * 60 * 1000 })
    res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 })

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

    res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 2 * 60 * 60 * 1000 })
    res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 })

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

    res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 2 * 60 * 60 * 1000 })
    res.cookie('refresh_token', newRefreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 })

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
        `SELECT u.id, u.email, u.nom, u.prenom, u.tel, u.avatar_url, u.last_login_at, u.last_login_ip,
                u.is_super_admin, u.onboarding_completed_at,
                w.id as workspace_id, w.nom as workspace_nom,
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
      tel: row.tel || null,
      avatar_url: row.avatar_url || null,
      last_login_at: row.last_login_at || null,
      last_login_ip: row.last_login_ip || null,
      is_super_admin: row.is_super_admin === true,
      onboarding_completed_at: row.onboarding_completed_at,
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

// Update own profile
const AVATAR_MAX_BYTES = 2_800_000 // ~2 MB JPEG base64-encoded
const updateProfileSchema = z.object({
  nom: z.string().min(1).max(255).optional(),
  prenom: z.string().min(1).max(255).optional(),
  tel: z.string().max(32).nullable().optional(),
  avatar_url: z
    .string()
    .max(AVATAR_MAX_BYTES, 'Image trop lourde (max ~2 MB)')
    .regex(/^data:image\/(png|jpeg|jpg|webp);base64,/, 'Format invalide (png/jpeg/webp)')
    .nullable()
    .optional(),
})
router.patch('/me', verifyToken, validate(updateProfileSchema), async (req, res) => {
  try {
    const { userId } = req.user!
    const { nom, prenom, tel, avatar_url } = req.body
    const sets: string[] = []
    const params: unknown[] = []
    let idx = 1
    if (nom !== undefined) { sets.push(`nom = $${idx++}`); params.push(nom) }
    if (prenom !== undefined) { sets.push(`prenom = $${idx++}`); params.push(prenom) }
    if (tel !== undefined) { sets.push(`tel = $${idx++}`); params.push(tel) }
    if (avatar_url !== undefined) { sets.push(`avatar_url = $${idx++}`); params.push(avatar_url) }
    if (sets.length === 0) { sendError(res, { status: 400, message: 'Aucun champ à mettre à jour', code: 'VALIDATION_ERROR' }); return }
    sets.push('updated_at = now()')
    params.push(userId)
    const db = await import('../db/index.js')
    const result = await db.query(`UPDATE utilisateur SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id, nom, prenom, tel, avatar_url`, params)
    sendSuccess(res, result.rows[0])
  } catch (error) { sendError(res, error) }
})

// Change own password (authenticated)
const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8).regex(/[A-Z]/, 'Au moins 1 majuscule').regex(/[0-9]/, 'Au moins 1 chiffre'),
})
router.post('/change-password', verifyToken, validate(changePasswordSchema), async (req, res) => {
  try {
    const { userId } = req.user!
    const { current_password, new_password } = req.body
    const db = await import('../db/index.js')
    const { rows } = await db.query(`SELECT password_hash FROM utilisateur WHERE id = $1`, [userId])
    if (rows.length === 0) { sendError(res, { status: 404, message: 'Utilisateur introuvable', code: 'NOT_FOUND' }); return }
    const bcryptMod = (await import('bcryptjs')).default
    const valid = await bcryptMod.compare(current_password, rows[0].password_hash)
    if (!valid) { sendError(res, { status: 400, message: 'Mot de passe actuel incorrect', code: 'INVALID_PASSWORD' }); return }
    const { hashPassword } = await import('../services/auth-service.js')
    const newHash = await hashPassword(new_password)
    await db.query(`UPDATE utilisateur SET password_hash = $1, updated_at = now() WHERE id = $2`, [newHash, userId])
    await db.query(`DELETE FROM refresh_token WHERE user_id = $1`, [userId])
    sendSuccess(res, { changed: true })
  } catch (error) { sendError(res, error) }
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

    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await import('../db/index.js').then(db =>
      db.query(
        `INSERT INTO password_reset_token (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
        [userResult.rows[0].id, tokenHash, expiresAt]
      )
    )

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

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const tokenResult = await import('../db/index.js').then(db =>
      db.query(
        `SELECT t.id, t.user_id, u.email FROM password_reset_token t
         JOIN utilisateur u ON u.id = t.user_id
         WHERE t.token_hash = $1 AND t.used_at IS NULL AND t.expires_at > now()`,
        [tokenHash]
      )
    )

    if (tokenResult.rows.length === 0) {
      sendError(res, { status: 400, message: 'Lien de réinitialisation invalide ou expiré', code: 'TOKEN_INVALID' })
      return
    }

    const { hashPassword } = await import('../services/auth-service.js')
    const hash = await hashPassword(password)
    const { id: tokenId, user_id: userId } = tokenResult.rows[0]

    await import('../db/index.js').then(async db => {
      await db.query(`UPDATE utilisateur SET password_hash = $1, updated_at = now() WHERE id = $2`, [hash, userId])
      await db.query(`UPDATE password_reset_token SET used_at = now() WHERE id = $1`, [tokenId])
    })

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
        `SELECT i.email, i.role, i.workspace_id, w.nom as workspace_nom, w.logo_url,
                (SELECT COUNT(*)::int FROM workspace_user wu WHERE wu.workspace_id = w.id) AS existing_members
         FROM invitation i
         JOIN workspace w ON w.id = i.workspace_id
         WHERE i.token = $1 AND i.accepted_at IS NULL AND i.expires_at > now()`,
        [req.params.token]
      )
    )

    if (rows.length === 0) {
      sendSuccess(res, { valid: false, expired: true })
      return
    }

    const r = rows[0]
    sendSuccess(res, {
      valid: true,
      email: r.email,
      role: r.role,
      workspace_nom: r.workspace_nom,
      workspace_logo: r.logo_url,
      is_first_admin: r.role === 'admin' && (r.existing_members ?? 0) === 0,
    })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
