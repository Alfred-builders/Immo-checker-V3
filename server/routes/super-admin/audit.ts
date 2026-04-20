import { Router } from 'express'
import { query } from '../../db/index.js'
import { sendSuccess, sendError } from '../../utils/response.js'

const router = Router()

// GET /api/super-admin/audit-log
router.get('/', async (req, res) => {
  try {
    const { action, target_type, limit: rawLimit } = req.query
    const limit = Math.min(parseInt(rawLimit as string) || 100, 500)
    const filters: string[] = []
    const params: unknown[] = []
    let i = 1
    if (action) { filters.push(`al.action = $${i}`); params.push(action); i++ }
    if (target_type) { filters.push(`al.target_type = $${i}`); params.push(target_type); i++ }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

    const result = await query(
      `SELECT al.*,
              json_build_object('id', u.id, 'email', u.email, 'nom', u.nom, 'prenom', u.prenom) AS super_admin
       FROM audit_log al
       JOIN utilisateur u ON u.id = al.super_admin_user_id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT ${limit}`,
      params
    )
    sendSuccess(res, { data: result.rows })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
