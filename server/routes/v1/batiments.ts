import { Router } from 'express'
import { query } from '../../db/index.js'
import { sendSuccess, sendError } from '../../utils/response.js'
import { NotFoundError } from '../../utils/errors.js'

const router = Router()

// GET /api/v1/batiments
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const { search, cursor, limit: rawLimit } = req.query as Record<string, string>
    const limit = Math.min(parseInt(rawLimit) || 25, 100)

    const params: unknown[] = [workspaceId]
    let where = 'WHERE b.workspace_id = $1 AND b.est_archive = false'
    let idx = 2

    if (search) { where += ` AND b.designation ILIKE $${idx++}`; params.push(`%${search}%`) }
    if (cursor) { where += ` AND b.id > $${idx++}`; params.push(cursor) }

    params.push(limit + 1)
    const result = await query(
      `SELECT b.id, b.designation, b.type, b.nb_etages, b.annee_construction,
              b.reference_interne, b.created_at,
              ab.rue, ab.code_postal, ab.ville, ab.latitude, ab.longitude,
              (SELECT count(*) FROM lot l WHERE l.batiment_id = b.id AND l.est_archive = false)::int AS nb_lots
       FROM batiment b
       LEFT JOIN adresse_batiment ab ON ab.batiment_id = b.id AND ab.type = 'principale'
       ${where}
       ORDER BY b.designation
       LIMIT $${idx}`,
      params
    )

    const has_more = result.rows.length > limit
    const rows = has_more ? result.rows.slice(0, limit) : result.rows
    sendSuccess(res, { data: rows, meta: { cursor: has_more ? rows[rows.length - 1].id : undefined, has_more } })
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/v1/batiments/:id
router.get('/:id', async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const result = await query(
      `SELECT b.id, b.designation, b.type, b.nb_etages, b.annee_construction,
              b.reference_interne, b.commentaire, b.created_at,
              ab.rue, ab.complement, ab.code_postal, ab.ville, ab.latitude, ab.longitude
       FROM batiment b
       LEFT JOIN adresse_batiment ab ON ab.batiment_id = b.id AND ab.type = 'principale'
       WHERE b.id = $1 AND b.workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (result.rows.length === 0) throw new NotFoundError('Bâtiment')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

export default router
