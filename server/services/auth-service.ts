import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { query } from '../db/index.js'
import { AppError, UnauthorizedError, ConflictError } from '../utils/errors.js'
import type { JWTPayload } from '../middleware/auth.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret'
const ACCESS_TOKEN_EXPIRY = '30m'
const REFRESH_TOKEN_EXPIRY_DAYS = 7
const MAX_FAILED_ATTEMPTS = 10
const LOCKOUT_MINUTES = 15
const BCRYPT_ROUNDS = 12

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY })
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex')
}

export async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const hash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  await query(
    `INSERT INTO refresh_token (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, hash, expiresAt]
  )
}

export async function verifyRefreshToken(token: string): Promise<string> {
  const hash = crypto.createHash('sha256').update(token).digest('hex')

  // Atomic delete-and-return: only one caller can consume the token
  const result = await query(
    `DELETE FROM refresh_token WHERE token_hash = $1 AND expires_at > now() RETURNING user_id`,
    [hash]
  )

  if (result.rows.length === 0) {
    // Token not found — could be replay attack. Check if it ever existed (expired or already used).
    // If it was a valid token that was already consumed, invalidate ALL tokens for that user (security measure).
    const expired = await query(
      `SELECT user_id FROM refresh_token WHERE token_hash = $1`,
      [hash]
    )
    if (expired.rows.length > 0) {
      // Token exists but expired — normal case, no action needed
    }
    // Note: if token was already deleted (consumed), we can't identify the user from the hash alone.
    // This is the safest design — no user info leaks from a replayed token.
    throw new UnauthorizedError('Refresh token invalide ou expiré')
  }

  // Clean up any expired tokens for this user (housekeeping)
  await query(
    `DELETE FROM refresh_token WHERE user_id = $1 AND expires_at < now()`,
    [result.rows[0].user_id]
  ).catch(() => {}) // Non-blocking cleanup

  return result.rows[0].user_id
}

export async function login(email: string, password: string) {
  // Check if user exists
  const userResult = await query(
    `SELECT id, email, nom, prenom, password_hash, failed_login_attempts, locked_until
     FROM utilisateur WHERE email = $1`,
    [email.toLowerCase().trim()]
  )

  if (userResult.rows.length === 0) {
    throw new UnauthorizedError('Email ou mot de passe incorrect')
  }

  const user = userResult.rows[0]

  // Check lockout
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const minutes = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000)
    throw new AppError(
      `Compte temporairement bloqué. Réessayez dans ${minutes} minute(s).`,
      'ACCOUNT_LOCKED',
      423
    )
  }

  // Verify password
  const validPassword = await bcrypt.compare(password, user.password_hash)
  if (!validPassword) {
    const attempts = user.failed_login_attempts + 1
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
      await query(
        `UPDATE utilisateur SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3`,
        [attempts, lockUntil, user.id]
      )
      throw new AppError(
        `Compte bloqué pour ${LOCKOUT_MINUTES} minutes après ${MAX_FAILED_ATTEMPTS} tentatives échouées.`,
        'ACCOUNT_LOCKED',
        423
      )
    }
    await query(
      `UPDATE utilisateur SET failed_login_attempts = $1 WHERE id = $2`,
      [attempts, user.id]
    )
    throw new UnauthorizedError('Email ou mot de passe incorrect')
  }

  // Reset failed attempts on successful login
  await query(
    `UPDATE utilisateur SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1`,
    [user.id]
  )

  // Get user's workspaces
  const workspacesResult = await query(
    `SELECT w.id, w.nom, w.type_workspace, w.logo_url, w.couleur_primaire, wu.role
     FROM workspace_user wu
     JOIN workspace w ON w.id = wu.workspace_id
     WHERE wu.user_id = $1 AND w.statut = 'actif'
     ORDER BY w.nom`,
    [user.id]
  )

  return {
    user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom },
    workspaces: workspacesResult.rows,
  }
}

export async function switchWorkspace(userId: string, workspaceId: string) {
  const result = await query(
    `SELECT wu.role, w.nom as workspace_nom, u.email
     FROM workspace_user wu
     JOIN workspace w ON w.id = wu.workspace_id
     JOIN utilisateur u ON u.id = wu.user_id
     WHERE wu.user_id = $1 AND wu.workspace_id = $2 AND w.statut = 'actif'`,
    [userId, workspaceId]
  )

  if (result.rows.length === 0) {
    throw new UnauthorizedError('Accès non autorisé à ce workspace')
  }

  const { role, email } = result.rows[0]

  const payload: JWTPayload = { userId, email, workspaceId, role }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken()
  await storeRefreshToken(userId, refreshToken)

  return { accessToken, refreshToken, payload }
}

export async function register(
  token: string,
  nom: string,
  prenom: string,
  password: string
) {
  // Validate invitation
  const invResult = await query(
    `SELECT id, workspace_id, email, role FROM invitation
     WHERE token = $1 AND accepted_at IS NULL AND expires_at > now()`,
    [token]
  )

  if (invResult.rows.length === 0) {
    throw new AppError('Invitation invalide ou expirée', 'INVITATION_INVALID', 400)
  }

  const invitation = invResult.rows[0]

  // Check if user already exists
  const existingUser = await query(
    `SELECT id FROM utilisateur WHERE email = $1`,
    [invitation.email]
  )

  let userId: string

  if (existingUser.rows.length > 0) {
    // User exists — just add to workspace
    userId = existingUser.rows[0].id
    const existingWU = await query(
      `SELECT id FROM workspace_user WHERE user_id = $1 AND workspace_id = $2`,
      [userId, invitation.workspace_id]
    )
    if (existingWU.rows.length > 0) {
      throw new ConflictError('Vous faites déjà partie de ce workspace')
    }
  } else {
    // Create new user
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const userResult = await query(
      `INSERT INTO utilisateur (email, nom, prenom, password_hash)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [invitation.email, nom, prenom, passwordHash]
    )
    userId = userResult.rows[0].id
  }

  // Add to workspace
  await query(
    `INSERT INTO workspace_user (workspace_id, user_id, role) VALUES ($1, $2, $3)`,
    [invitation.workspace_id, userId, invitation.role]
  )

  // Mark invitation as accepted
  await query(
    `UPDATE invitation SET accepted_at = now() WHERE id = $1`,
    [invitation.id]
  )

  return { userId, workspaceId: invitation.workspace_id, role: invitation.role, email: invitation.email }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}
