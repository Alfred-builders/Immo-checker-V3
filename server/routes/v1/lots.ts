import { Router } from 'express'
import { query } from '../../db/index.js'
import { sendSuccess, sendError } from '../../utils/response.js'
import { NotFoundError } from '../../utils/errors.js'
import { presignPdfUrl } from '../../services/s3-presign-service.js'
import { encodeCursor, decodeCursor } from '../../utils/cursor.js'
import { resolveId } from '../../utils/resolve-id.js'

// Resolve lot `:id`: accepts UUID or `reference_interne` (e.g. "BAIL-2025-0302").
function resolveLotId(rawId: string, workspaceId: string) {
  return resolveId({
    table: 'lot',
    alternateColumn: 'reference_interne',
    identifier: rawId,
    workspaceId,
    entityName: 'Lot',
  })
}

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

    if (batiment_id) {
      const resolvedBatimentId = await resolveId({
        table: 'batiment', alternateColumn: 'reference_interne', identifier: batiment_id,
        workspaceId, entityName: 'Bâtiment',
      })
      where += ` AND l.batiment_id = $${idx++}`
      params.push(resolvedBatimentId)
    }
    if (search) { where += ` AND (l.designation ILIKE $${idx} OR l.reference_interne ILIKE $${idx})`; params.push(`%${search}%`); idx++ }
    if (cursor) {
      const c = decodeCursor(cursor)
      if (c) {
        where += ` AND (l.designation, l.id) > ($${idx}, $${idx + 1})`
        params.push(c.orderKey, c.id); idx += 2
      }
    }

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
       ORDER BY l.designation, l.id
       LIMIT $${idx}`,
      params
    )

    const has_more = result.rows.length > limit
    const rows = has_more ? result.rows.slice(0, limit) : result.rows
    const last = rows[rows.length - 1]
    const nextCursor = has_more && last ? encodeCursor(last.designation, last.id) : null
    sendSuccess(res, { data: rows, meta: { cursor: nextCursor, has_more } })
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/v1/lots/:id
router.get('/:id', async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const lotId = await resolveLotId(String(req.params.id), workspaceId)
    const result = await query(
      `SELECT l.id, l.designation, l.type_bien, l.etage, l.surface,
              l.reference_interne, l.num_cave, l.num_parking, l.created_at,
              json_build_object('id', b.id, 'designation', b.designation) AS batiment
       FROM lot l JOIN batiment b ON b.id = l.batiment_id
       WHERE l.id = $1 AND l.workspace_id = $2`,
      [lotId, workspaceId]
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
    const lotId = await resolveLotId(String(req.params.id), workspaceId)

    const params: unknown[] = [lotId, workspaceId]
    let where = 'WHERE ei.lot_id = $1 AND ei.workspace_id = $2'
    let idx = 3

    if (statut) { where += ` AND ei.statut = $${idx++}`; params.push(statut) }
    if (cursor) {
      const c = decodeCursor(cursor)
      if (c) {
        where += ` AND (ei.created_at, ei.id) < ($${idx}, $${idx + 1})`
        params.push(c.orderKey, c.id); idx += 2
      }
    }

    params.push(limit + 1)
    const result = await query(
      `SELECT ei.id, ei.type, ei.sens, ei.statut, ei.mission_id,
              ei.date_realisation, ei.date_signature, ei.motif_infructueux, ei.created_at,
              ei.pdf_url, ei.web_url, ei.pdf_url_legal, ei.web_url_legal, ei.url_verification
       FROM edl_inventaire ei
       ${where}
       ORDER BY ei.created_at DESC, ei.id DESC
       LIMIT $${idx}`,
      params
    )

    const has_more = result.rows.length > limit
    const rows = (has_more ? result.rows.slice(0, limit) : result.rows).map(projectEdlUrls)
    const last = rows[rows.length - 1]
    const nextCursor = has_more && last ? encodeCursor(last.created_at, last.id) : null
    sendSuccess(res, { data: rows, meta: { cursor: nextCursor, has_more } })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
