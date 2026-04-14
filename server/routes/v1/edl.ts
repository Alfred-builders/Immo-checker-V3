import { Router } from 'express'
import { query } from '../../db/index.js'
import { sendSuccess, sendError } from '../../utils/response.js'
import { NotFoundError } from '../../utils/errors.js'

const router = Router()

// GET /api/v1/edl-inventaires
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const { mission_id, statut, cursor, limit: rawLimit } = req.query as Record<string, string>
    const limit = Math.min(parseInt(rawLimit) || 25, 100)

    const params: unknown[] = [workspaceId]
    let where = 'WHERE ei.workspace_id = $1'
    let idx = 2

    if (mission_id) { where += ` AND ei.mission_id = $${idx++}`; params.push(mission_id) }
    if (statut) { where += ` AND ei.statut = $${idx++}`; params.push(statut) }
    if (cursor) { where += ` AND ei.id > $${idx++}`; params.push(cursor) }

    params.push(limit + 1)
    const result = await query(
      `SELECT ei.id, ei.type, ei.sens, ei.statut, ei.mission_id,
              ei.date_realisation, ei.date_signature, ei.created_at,
              ei.pdf_url, ei.web_url, ei.pdf_url_legal, ei.web_url_legal, ei.url_verification
       FROM edl_inventaire ei
       ${where}
       ORDER BY ei.created_at DESC
       LIMIT $${idx}`,
      params
    )

    const has_more = result.rows.length > limit
    const rows = has_more ? result.rows.slice(0, limit) : result.rows
    const nextCursor = has_more ? rows[rows.length - 1].id : undefined

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
        ei.code_acces, ei.commentaire_general, ei.created_at,
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
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/v1/edl-inventaires/:id/pdf — redirect to pdf_url (signed EDLs only)
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
      sendError(res, new (await import('../../utils/errors.js')).AppError('PDF disponible uniquement pour les EDL signés', 'EDL_NOT_SIGNED', 404))
      return
    }
    res.redirect(302, pdf_url)
  } catch (error) {
    sendError(res, error)
  }
})

export default router
