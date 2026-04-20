import { Router } from 'express'
import { query } from '../../db/index.js'
import { sendSuccess, sendError } from '../../utils/response.js'
import { NotFoundError } from '../../utils/errors.js'
import { presignPdfUrl } from '../../services/s3-presign-service.js'

const router = Router()

function projectEdlUrls<T extends Record<string, unknown>>(row: T): T {
  if (row.statut !== 'signe') {
    return { ...row, pdf_url: null, web_url: null, pdf_url_legal: null, web_url_legal: null, url_verification: null }
  }
  return {
    ...row,
    pdf_url: presignPdfUrl(row.pdf_url as string | null),
    pdf_url_legal: presignPdfUrl(row.pdf_url_legal as string | null),
  }
}

// GET /api/v1/lots
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const { search, batiment_id, cursor, limit: rawLimit } = req.query as Record<string, string>
    const limit = Math.min(parseInt(rawLimit) || 25, 100)

    const params: unknown[] = [workspaceId]
    let where = 'WHERE l.workspace_id = $1 AND l.est_archive = false'
    let idx = 2

    if (batiment_id) { where += ` AND l.batiment_id = $${idx++}`; params.push(batiment_id) }
    if (search) { where += ` AND (l.designation ILIKE $${idx} OR l.reference_interne ILIKE $${idx})`; params.push(`%${search}%`); idx++ }
    if (cursor) { where += ` AND l.id > $${idx++}`; params.push(cursor) }

    params.push(limit + 1)
    const result = await query(
      `SELECT l.id, l.designation, l.type_bien, l.etage, l.surface,
              l.reference_interne, l.num_cave, l.num_parking, l.created_at,
              json_build_object('id', b.id, 'designation', b.designation,
                'adresse', ab.rue || ', ' || ab.code_postal || ' ' || ab.ville
              ) AS batiment
       FROM lot l
       JOIN batiment b ON b.id = l.batiment_id
       LEFT JOIN adresse_batiment ab ON ab.batiment_id = b.id AND ab.type = 'principale'
       ${where}
       ORDER BY l.designation
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

// GET /api/v1/lots/:id
router.get('/:id', async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const result = await query(
      `SELECT l.id, l.designation, l.type_bien, l.etage, l.surface,
              l.reference_interne, l.num_cave, l.num_parking, l.created_at,
              json_build_object('id', b.id, 'designation', b.designation) AS batiment
       FROM lot l JOIN batiment b ON b.id = l.batiment_id
       WHERE l.id = $1 AND l.workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (result.rows.length === 0) throw new NotFoundError('Lot')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/v1/lots/:id/edl-inventaires — historical EDLs for a lot
router.get('/:id/edl-inventaires', async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const { statut, cursor, limit: rawLimit } = req.query as Record<string, string>
    const limit = Math.min(parseInt(rawLimit) || 25, 100)

    const params: unknown[] = [req.params.id, workspaceId]
    let where = 'WHERE ei.lot_id = $1 AND ei.workspace_id = $2'
    let idx = 3

    if (statut) { where += ` AND ei.statut = $${idx++}`; params.push(statut) }
    if (cursor) { where += ` AND ei.id > $${idx++}`; params.push(cursor) }

    params.push(limit + 1)
    const result = await query(
      `SELECT ei.id, ei.type, ei.sens, ei.statut, ei.mission_id,
              ei.date_realisation, ei.date_signature, ei.motif_infructueux, ei.created_at,
              ei.pdf_url, ei.web_url, ei.pdf_url_legal, ei.web_url_legal, ei.url_verification
       FROM edl_inventaire ei
       ${where}
       ORDER BY ei.created_at DESC
       LIMIT $${idx}`,
      params
    )

    const has_more = result.rows.length > limit
    const rows = (has_more ? result.rows.slice(0, limit) : result.rows).map(projectEdlUrls)
    sendSuccess(res, { data: rows, meta: { cursor: has_more ? rows[rows.length - 1].id : undefined, has_more } })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
