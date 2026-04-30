import { Router } from 'express'
import { z } from 'zod/v4'
import crypto from 'crypto'
import { query } from '../../db/index.js'
import { validate } from '../../middleware/validate.js'
import { sendSuccess, sendList, sendError } from '../../utils/response.js'
import { NotFoundError, AppError } from '../../utils/errors.js'
import { logAudit } from '../../services/audit-service.js'
import { sendPasswordResetEmail } from '../../services/email-service.js'

const router = Router()

// GET /api/super-admin/users
router.get('/', async (req, res) => {
  try {
    const { search, cursor, limit: rawLimit } = req.query
    const limit = Math.min(parseInt(rawLimit as string) || 25, 100)
    const filters: string[] = []
    const params: unknown[] = []
    let i = 1
    if (search) {
      filters.push(`(u.email ILIKE $${i} OR u.nom ILIKE $${i} OR u.prenom ILIKE $${i})`)
      params.push(`%${search}%`)
      i++
    }
    if (cursor) {
      filters.push(`(u.created_at, u.id) < (
        (SELECT created_at FROM utilisateur WHERE id = $${i}),
        $${i}
      )`)
      params.push(cursor)
      i++
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

    const result = await query(
      `SELECT u.id, u.email, u.nom, u.prenom, u.is_super_admin, u.est_actif,
              u.last_login_at, u.created_at,
              (SELECT json_agg(json_build_object(
                 'workspace_id', w.id, 'workspace_nom', w.nom,
                 'role', wu.role, 'est_actif', wu.est_actif
               )) FROM workspace_user wu JOIN workspace w ON w.id = wu.workspace_id
               WHERE wu.user_id = u.id) AS memberships
       FROM utilisateur u ${where}
       ORDER BY u.created_at DESC, u.id DESC
       LIMIT $${i}`,
      [...params, limit + 1]
    )
    const hasMore = result.rows.length > limit
    const data = hasMore ? result.rows.slice(0, limit) : result.rows
    const nextCursor = hasMore ? data[data.length - 1].id : undefined
    sendList(res, data, { cursor: nextCursor, has_more: hasMore })
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/super-admin/users/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT u.*,
              (SELECT json_agg(json_build_object(
                 'workspace_id', w.id, 'workspace_nom', w.nom, 'type_workspace', w.type_workspace,
                 'role', wu.role, 'est_actif', wu.est_actif, 'joined_at', wu.created_at
               )) FROM workspace_user wu JOIN workspace w ON w.id = wu.workspace_id
               WHERE wu.user_id = u.id) AS memberships
       FROM utilisateur u WHERE u.id = $1`,
      [req.params.id]
    )
    if (result.rows.length === 0) throw new NotFoundError('Utilisateur')
    // Never expose password_hash
    const { password_hash, ...safe } = result.rows[0]
    sendSuccess(res, safe)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/super-admin/users/:id/super-admin
const promoteSchema = z.object({ is_super_admin: z.boolean() })
router.patch('/:id/super-admin', validate(promoteSchema), async (req, res) => {
  try {
    const { is_super_admin } = req.body as z.infer<typeof promoteSchema>
    const targetId = String(req.params.id)
    const selfId = req.user!.userId

    // Prevent self-demotion (avoid orphaning the super-admin role)
    if (targetId === selfId && is_super_admin === false) {
      throw new AppError(
        'Vous ne pouvez pas retirer vos propres droits super-admin',
        'FORBIDDEN_SELF_DEMOTE',
        403
      )
    }

    const result = await query(
      `UPDATE utilisateur SET is_super_admin = $1, updated_at = now() WHERE id = $2 RETURNING id, email`,
      [is_super_admin, targetId]
    )
    if (result.rows.length === 0) throw new NotFoundError('Utilisateur')

    await logAudit(
      selfId,
      is_super_admin ? 'user.promoted_super_admin' : 'user.demoted_super_admin',
      'user',
      targetId,
      { email: result.rows[0].email }
    )
    sendSuccess(res, { id: result.rows[0].id, is_super_admin })
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/super-admin/users/:id/status — activate / deactivate user globally
const statusSchema = z.object({ est_actif: z.boolean() })
router.patch('/:id/status', validate(statusSchema), async (req, res) => {
  try {
    const { est_actif } = req.body as z.infer<typeof statusSchema>
    const targetId = String(req.params.id)
    const selfId = req.user!.userId

    if (targetId === selfId && est_actif === false) {
      throw new AppError(
        'Vous ne pouvez pas désactiver votre propre compte',
        'FORBIDDEN_SELF_DEACTIVATE',
        403
      )
    }

    const result = await query(
      `UPDATE utilisateur
       SET est_actif = $1,
           deactivated_at = CASE WHEN $1 = false THEN now() ELSE NULL END,
           updated_at = now()
       WHERE id = $2
       RETURNING id, email, est_actif`,
      [est_actif, targetId]
    )
    if (result.rows.length === 0) throw new NotFoundError('Utilisateur')

    // On deactivation, also revoke all refresh tokens (kick existing sessions).
    if (!est_actif) {
      await query(`DELETE FROM refresh_token WHERE user_id = $1`, [targetId])
    }

    await logAudit(
      selfId,
      est_actif ? 'user.reactivated' : 'user.deactivated',
      'user',
      targetId,
      { email: result.rows[0].email },
    )
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/super-admin/users/:id/force-password-reset — generate a reset token and email it
router.post('/:id/force-password-reset', async (req, res) => {
  try {
    const targetId = String(req.params.id)
    const userResult = await query(
      `SELECT id, email FROM utilisateur WHERE id = $1`,
      [targetId]
    )
    if (userResult.rows.length === 0) throw new NotFoundError('Utilisateur')
    const { email } = userResult.rows[0]

    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await query(
      `INSERT INTO password_reset_token (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [targetId, tokenHash, expiresAt]
    )

    try {
      await sendPasswordResetEmail(email, token)
    } catch (e) {
      console.error('[super-admin] Force password reset email failed:', e)
    }

    await logAudit(req.user!.userId, 'user.force_password_reset', 'user', targetId, { email })
    sendSuccess(res, { message: 'Email de réinitialisation envoyé', email })
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/super-admin/users/:id/revoke-sessions — invalidate all refresh tokens
router.post('/:id/revoke-sessions', async (req, res) => {
  try {
    const targetId = String(req.params.id)
    const userResult = await query(
      `SELECT id, email FROM utilisateur WHERE id = $1`,
      [targetId]
    )
    if (userResult.rows.length === 0) throw new NotFoundError('Utilisateur')

    const del = await query(
      `DELETE FROM refresh_token WHERE user_id = $1 RETURNING id`,
      [targetId]
    )

    await logAudit(req.user!.userId, 'user.sessions_revoked', 'user', targetId, {
      email: userResult.rows[0].email,
      revoked: del.rows.length,
    })
    sendSuccess(res, { revoked: del.rows.length })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
