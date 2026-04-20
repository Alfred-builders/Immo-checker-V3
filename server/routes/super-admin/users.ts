import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../../db/index.js'
import { validate } from '../../middleware/validate.js'
import { sendSuccess, sendError } from '../../utils/response.js'
import { NotFoundError, AppError } from '../../utils/errors.js'
import { logAudit } from '../../services/audit-service.js'

const router = Router()

// GET /api/super-admin/users
router.get('/', async (req, res) => {
  try {
    const { search } = req.query
    const filters: string[] = []
    const params: unknown[] = []
    let i = 1
    if (search) {
      filters.push(`(u.email ILIKE $${i} OR u.nom ILIKE $${i} OR u.prenom ILIKE $${i})`)
      params.push(`%${search}%`)
      i++
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

    const result = await query(
      `SELECT u.id, u.email, u.nom, u.prenom, u.is_super_admin,
              u.last_login_at, u.created_at,
              (SELECT json_agg(json_build_object(
                 'workspace_id', w.id, 'workspace_nom', w.nom,
                 'role', wu.role, 'est_actif', wu.est_actif
               )) FROM workspace_user wu JOIN workspace w ON w.id = wu.workspace_id
               WHERE wu.user_id = u.id) AS memberships
       FROM utilisateur u ${where}
       ORDER BY u.created_at DESC
       LIMIT 200`,
      params
    )
    sendSuccess(res, { data: result.rows, total: result.rows.length })
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

export default router
