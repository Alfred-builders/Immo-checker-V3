import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../../db/index.js'
import { requireWriteScope } from '../../middleware/api-key-auth.js'
import { sendSuccess, sendError } from '../../utils/response.js'
import { NotFoundError, AppError } from '../../utils/errors.js'

const router = Router()

const createSchema = z.object({
  lot_id: z.string().uuid(),
  sens: z.enum(['entree', 'sortie', 'entree_sortie']),
  avec_inventaire: z.boolean().optional().default(false),
  date_planifiee: z.string().min(1),
  heure_debut: z.string().optional(),
  heure_fin: z.string().optional(),
  commentaire: z.string().optional(),
})

// GET /api/v1/missions — list with pagination
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const { statut, date_from, date_to, cursor, limit: rawLimit } = req.query as Record<string, string>
    const limit = Math.min(parseInt(rawLimit) || 25, 100)

    const params: unknown[] = [workspaceId]
    let where = 'WHERE m.workspace_id = $1 AND m.est_archive = false'
    let idx = 2

    if (statut) { where += ` AND m.statut = $${idx++}`; params.push(statut) }
    if (date_from) { where += ` AND m.date_planifiee >= $${idx++}`; params.push(date_from) }
    if (date_to) { where += ` AND m.date_planifiee <= $${idx++}`; params.push(date_to) }
    if (cursor) {
      where += ` AND (m.date_planifiee, m.id) < ((SELECT date_planifiee FROM mission WHERE id=$${idx}), $${idx})`
      params.push(cursor); idx++
    }

    const sql = `
      SELECT m.id, m.reference, m.date_planifiee, m.heure_debut, m.heure_fin,
             m.statut, m.statut_rdv, m.avec_inventaire, m.commentaire, m.created_at,
             json_build_object('id', l.id, 'designation', l.designation, 'type_bien', l.type_bien) AS lot
      FROM mission m
      JOIN lot l ON l.id = m.lot_id
      ${where}
      ORDER BY m.date_planifiee DESC, m.id DESC
      LIMIT $${idx}`
    params.push(limit + 1)

    const result = await query(sql, params)
    const has_more = result.rows.length > limit
    const rows = has_more ? result.rows.slice(0, limit) : result.rows
    const nextCursor = has_more ? rows[rows.length - 1].id : undefined

    sendSuccess(res, { data: rows, meta: { cursor: nextCursor, has_more } })
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/v1/missions/:id
router.get('/:id', async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const result = await query(
      `SELECT m.id, m.reference, m.date_planifiee, m.heure_debut, m.heure_fin,
              m.statut, m.statut_rdv, m.avec_inventaire, m.commentaire,
              m.motif_annulation, m.created_at,
              json_build_object('id', l.id, 'designation', l.designation, 'type_bien', l.type_bien,
                'etage', l.etage, 'surface', l.surface) AS lot,
              (SELECT json_agg(json_build_object('id', ei.id, 'type', ei.type, 'sens', ei.sens,
                'statut', ei.statut, 'pdf_url', ei.pdf_url, 'web_url', ei.web_url,
                'pdf_url_legal', ei.pdf_url_legal, 'web_url_legal', ei.web_url_legal))
               FROM edl_inventaire ei WHERE ei.mission_id = m.id) AS edls
       FROM mission m
       JOIN lot l ON l.id = m.lot_id
       WHERE m.id = $1 AND m.workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (result.rows.length === 0) throw new NotFoundError('Mission')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/v1/missions — create
router.post('/', requireWriteScope, async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const data = createSchema.parse(req.body)

    // Verify lot belongs to workspace
    const lotCheck = await query(
      `SELECT id FROM lot WHERE id = $1 AND workspace_id = $2 AND est_archive = false`,
      [data.lot_id, workspaceId]
    )
    if (lotCheck.rows.length === 0) throw new NotFoundError('Lot')

    // Generate reference
    const year = new Date().getFullYear()
    const countResult = await query(
      `SELECT count(*) FROM mission WHERE workspace_id = $1 AND EXTRACT(YEAR FROM created_at) = $2`,
      [workspaceId, year]
    )
    const seq = String(parseInt(countResult.rows[0].count) + 1).padStart(4, '0')
    const reference = `M-${year}-${seq}`

    const result = await query(
      `INSERT INTO mission (workspace_id, lot_id, reference, date_planifiee, heure_debut, heure_fin,
        statut, statut_rdv, avec_inventaire, commentaire, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, 'planifiee', 'a_confirmer', $7, $8,
         (SELECT id FROM utilisateur WHERE id = (
           SELECT created_by FROM workspace WHERE id = $1 LIMIT 1)
         LIMIT 1))
       RETURNING id, reference, date_planifiee, statut, statut_rdv, created_at`,
      [workspaceId, data.lot_id, reference, data.date_planifiee,
       data.heure_debut ?? null, data.heure_fin ?? null,
       data.avec_inventaire, data.commentaire ?? null]
    )

    // Create EDL(s) based on sens
    const senses = data.sens === 'entree_sortie' ? ['entree', 'sortie'] : [data.sens]
    for (const sens of senses) {
      await query(
        `INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, type, sens, statut)
         VALUES ($1, $2, $3, 'etat_des_lieux', $4, 'brouillon')`,
        [workspaceId, result.rows[0].id, data.lot_id, sens]
      )
    }

    sendSuccess(res, result.rows[0], 201)
  } catch (error) {
    sendError(res, error)
  }
})

export default router
