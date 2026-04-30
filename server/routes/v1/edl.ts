import { Router } from 'express'
import { query } from '../../db/index.js'
import { sendSuccess, sendError } from '../../utils/response.js'
import { NotFoundError, AppError } from '../../utils/errors.js'
import { presignPdfUrl } from '../../services/s3-presign-service.js'
import { encodeCursor, decodeCursor } from '../../utils/cursor.js'
import { resolveId } from '../../utils/resolve-id.js'

const router = Router()

// Hide URLs on non-signed EDL and pre-sign PDF URLs on signed ones.
function projectEdlUrls<T extends Record<string, unknown>>(row: T): T {
  if (!row) return row
  const isSigned = row.statut === 'signe'
  if (!isSigned) {
    return {
      ...row,
      pdf_url: null,
      web_url: null,
      pdf_url_legal: null,
      web_url_legal: null,
      url_verification: null,
    }
  }
  return {
    ...row,
    pdf_url: presignPdfUrl(row.pdf_url as string | null),
    pdf_url_legal: presignPdfUrl(row.pdf_url_legal as string | null),
    // web_url, web_url_legal, url_verification are persistent (per spec)
  }
}

// GET /api/v1/edl-inventaires
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const { mission_id, statut, cursor, limit: rawLimit } = req.query as Record<string, string>
    const limit = Math.min(parseInt(rawLimit) || 25, 100)

    const params: unknown[] = [workspaceId]
    let where = 'WHERE ei.workspace_id = $1'
    let idx = 2

    if (mission_id) {
      const resolvedMissionId = await resolveId({
        table: 'mission', alternateColumn: 'reference', identifier: mission_id,
        workspaceId, entityName: 'Mission',
      })
      where += ` AND ei.mission_id = $${idx++}`
      params.push(resolvedMissionId)
    }
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

// GET /api/v1/edl-inventaires/:id — with all URLs + locataires + clés
router.get('/:id', async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const result = await query(
      `SELECT
        ei.id, ei.type, ei.sens, ei.statut,
        ei.mission_id, ei.lot_id,
        ei.date_realisation, ei.date_signature,
        ei.code_acces, ei.commentaire_general, ei.motif_infructueux, ei.created_at,
        ei.pdf_url, ei.web_url, ei.pdf_url_legal, ei.web_url_legal, ei.url_verification,
        (SELECT json_agg(json_build_object(
          'tiers_id', el.tiers_id,
          'nom', t.nom,
          'prenom', t.prenom,
          'role_locataire', el.role_locataire
        ))
         FROM edl_locataire el
         JOIN tiers t ON t.id = el.tiers_id
         WHERE el.edl_id = ei.id
        ) AS locataires,
        (SELECT json_agg(json_build_object(
          'id', cm.id, 'type_cle', cm.type_cle,
          'quantite', cm.quantite, 'statut', cm.statut,
          'lieu_depot', cm.lieu_depot
        ))
         FROM cle_mission cm WHERE cm.edl_id = ei.id
        ) AS cles
       FROM edl_inventaire ei
       WHERE ei.id = $1 AND ei.workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (result.rows.length === 0) throw new NotFoundError('EDL')
    sendSuccess(res, projectEdlUrls(result.rows[0]))
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/v1/edl-inventaires/:id/pdf — redirect to pre-signed pdf_url (signed EDLs only)
router.get('/:id/pdf', async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const result = await query(
      `SELECT statut, pdf_url FROM edl_inventaire WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (result.rows.length === 0) throw new NotFoundError('EDL')
    const { statut, pdf_url } = result.rows[0]
    if (statut !== 'signe' || !pdf_url) {
      sendError(res, new AppError('PDF disponible uniquement pour les EDL signés', 'EDL_NOT_SIGNED', 404))
      return
    }
    res.redirect(302, presignPdfUrl(pdf_url)!)
  } catch (error) {
    sendError(res, error)
  }
})

export default router
