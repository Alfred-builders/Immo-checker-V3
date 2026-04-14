import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../../db/index.js'
import { requireWriteScope } from '../../middleware/api-key-auth.js'
import { sendSuccess, sendError } from '../../utils/response.js'
import { NotFoundError, AppError } from '../../utils/errors.js'
import { dispatchWebhook } from '../../services/webhook-service.js'

const router = Router()

const createSchema = z.object({
  lot_id: z.string().uuid(),
  sens: z.enum(['entree', 'sortie', 'entree_sortie']),
  avec_inventaire: z.boolean().optional().default(false),
  date_planifiee: z.string().min(1),
  heure_debut: z.string().optional(),
  heure_fin: z.string().optional(),
  commentaire: z.string().optional(),
  // optional: assign a technician immediately
  technicien_id: z.string().uuid().optional(),
  // optional: colocation support
  locataires: z.array(z.string().uuid()).optional(),
  type_bail: z.enum(['individuel', 'collectif']).optional().default('individuel'),
})

const patchSchema = z.object({
  date_planifiee: z.string().optional(),
  heure_debut: z.string().nullable().optional(),
  heure_fin: z.string().nullable().optional(),
  commentaire: z.string().nullable().optional(),
  statut_rdv: z.enum(['a_confirmer', 'confirme', 'reporte']).optional(),
})

const cancelSchema = z.object({
  motif: z.string().min(1, 'Motif obligatoire'),
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
                'pdf_url_legal', ei.pdf_url_legal, 'web_url_legal', ei.web_url_legal,
                'url_verification', ei.url_verification))
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

// GET /api/v1/missions/:id/edl-inventaires
router.get('/:id/edl-inventaires', async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const missionCheck = await query(
      `SELECT id FROM mission WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (missionCheck.rows.length === 0) throw new NotFoundError('Mission')

    const result = await query(
      `SELECT ei.id, ei.type, ei.sens, ei.statut,
              ei.date_realisation, ei.date_signature, ei.created_at,
              ei.pdf_url, ei.web_url, ei.pdf_url_legal, ei.web_url_legal, ei.url_verification
       FROM edl_inventaire ei
       WHERE ei.mission_id = $1 AND ei.workspace_id = $2
       ORDER BY ei.created_at ASC`,
      [req.params.id, workspaceId]
    )
    sendSuccess(res, result.rows)
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

    // Verify technicien if provided
    if (data.technicien_id) {
      const techCheck = await query(
        `SELECT id FROM workspace_user WHERE user_id = $1 AND workspace_id = $2 AND role = 'technicien'`,
        [data.technicien_id, workspaceId]
      )
      if (techCheck.rows.length === 0) throw new NotFoundError('Technicien')
    }

    // Generate reference
    const year = new Date().getFullYear()
    const countResult = await query(
      `SELECT count(*) FROM mission WHERE workspace_id = $1 AND EXTRACT(YEAR FROM created_at) = $2`,
      [workspaceId, year]
    )
    const seq = String(parseInt(countResult.rows[0].count) + 1).padStart(4, '0')
    const reference = `M-${year}-${seq}`

    const initialStatut = data.technicien_id ? 'assignee' : 'planifiee'

    // Use transaction for mission + EDLs + optional technician assignment
    const { pool } = await import('../../db/index.js')
    const client = await pool.connect()
    let mission: any

    try {
      await client.query('BEGIN')

      const mResult = await client.query(
        `INSERT INTO mission (workspace_id, lot_id, reference, date_planifiee, heure_debut, heure_fin,
          statut, statut_rdv, avec_inventaire, commentaire)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'a_confirmer', $8, $9)
         RETURNING id, reference, date_planifiee, statut, statut_rdv, created_at`,
        [workspaceId, data.lot_id, reference, data.date_planifiee,
         data.heure_debut ?? null, data.heure_fin ?? null,
         initialStatut, data.avec_inventaire, data.commentaire ?? null]
      )
      mission = mResult.rows[0]

      // Assign technicien if provided
      if (data.technicien_id) {
        await client.query(
          `INSERT INTO mission_technicien (mission_id, user_id, statut_invitation)
           VALUES ($1, $2, 'en_attente')`,
          [mission.id, data.technicien_id]
        )
      }

      // Create EDL(s) based on sens and colocation type
      const senses = data.sens === 'entree_sortie' ? ['entree', 'sortie'] : [data.sens]
      const hasMultipleLocataires = (data.locataires?.length ?? 0) > 1

      if (hasMultipleLocataires && data.type_bail === 'individuel') {
        // Bail individuel: 1 EDL per locataire per sens
        for (const sens of senses) {
          for (const locataireId of data.locataires!) {
            const edlResult = await client.query(
              `INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, type, sens, statut)
               VALUES ($1, $2, $3, 'etat_des_lieux', $4, 'brouillon') RETURNING id`,
              [workspaceId, mission.id, data.lot_id, sens]
            )
            await client.query(
              `INSERT INTO edl_locataire (edl_id, tiers_id) VALUES ($1, $2)`,
              [edlResult.rows[0].id, locataireId]
            )
          }
        }
      } else if (hasMultipleLocataires && data.type_bail === 'collectif') {
        // Bail collectif: 1 EDL per sens, all locataires linked
        for (const sens of senses) {
          const edlResult = await client.query(
            `INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, type, sens, statut)
             VALUES ($1, $2, $3, 'etat_des_lieux', $4, 'brouillon') RETURNING id`,
            [workspaceId, mission.id, data.lot_id, sens]
          )
          for (const locataireId of data.locataires!) {
            await client.query(
              `INSERT INTO edl_locataire (edl_id, tiers_id) VALUES ($1, $2)`,
              [edlResult.rows[0].id, locataireId]
            )
          }
        }
      } else {
        // Standard: 1 EDL per sens
        for (const sens of senses) {
          await client.query(
            `INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, type, sens, statut)
             VALUES ($1, $2, $3, 'etat_des_lieux', $4, 'brouillon')`,
            [workspaceId, mission.id, data.lot_id, sens]
          )
        }
      }

      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }

    // Dispatch mission.creee webhook (fire-and-forget)
    setImmediate(() => dispatchWebhook(workspaceId, 'mission.creee', {
      mission_id: mission.id,
      reference: mission.reference,
      lot_id: data.lot_id,
      statut: mission.statut,
    }))

    sendSuccess(res, mission, 201)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/v1/missions/:id — modify (locked if terminee)
router.patch('/:id', requireWriteScope, async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const data = patchSchema.parse(req.body)

    const current = await query(
      `SELECT id, statut FROM mission WHERE id = $1 AND workspace_id = $2 AND est_archive = false`,
      [req.params.id, workspaceId]
    )
    if (current.rows.length === 0) throw new NotFoundError('Mission')

    const { statut } = current.rows[0]
    if (statut === 'annulee') throw new AppError('Mission annulée non modifiable', 'MISSION_LOCKED', 403)

    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    // Terminée: commentaire seul modifiable
    if (statut === 'terminee') {
      if (data.commentaire !== undefined) {
        fields.push(`commentaire = $${idx++}`); values.push(data.commentaire)
      } else {
        throw new AppError('Mission terminée : seul le commentaire est modifiable', 'MISSION_LOCKED', 403)
      }
    } else {
      if (data.date_planifiee !== undefined) { fields.push(`date_planifiee = $${idx++}`); values.push(data.date_planifiee) }
      if (data.heure_debut !== undefined) { fields.push(`heure_debut = $${idx++}`); values.push(data.heure_debut) }
      if (data.heure_fin !== undefined) { fields.push(`heure_fin = $${idx++}`); values.push(data.heure_fin) }
      if (data.commentaire !== undefined) { fields.push(`commentaire = $${idx++}`); values.push(data.commentaire) }
      if (data.statut_rdv !== undefined) { fields.push(`statut_rdv = $${idx++}`); values.push(data.statut_rdv) }
    }

    if (fields.length === 0) throw new AppError('Aucun champ à modifier', 'VALIDATION_ERROR', 400)

    fields.push(`updated_at = now()`)
    values.push(req.params.id)
    const result = await query(
      `UPDATE mission SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, reference, date_planifiee, heure_debut, heure_fin, statut, statut_rdv, commentaire`,
      values
    )
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// DELETE /api/v1/missions/:id — cancel (motif required, blocked if terminee)
router.delete('/:id', requireWriteScope, async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const data = cancelSchema.parse(req.body)

    const current = await query(
      `SELECT id, statut FROM mission WHERE id = $1 AND workspace_id = $2 AND est_archive = false`,
      [req.params.id, workspaceId]
    )
    if (current.rows.length === 0) throw new NotFoundError('Mission')

    const { statut } = current.rows[0]
    if (statut === 'terminee') {
      throw new AppError('Impossible d\'annuler une mission avec des EDL signés', 'MISSION_LOCKED', 403)
    }
    if (statut === 'annulee') {
      throw new AppError('Mission déjà annulée', 'ALREADY_CANCELLED', 400)
    }

    await query(
      `UPDATE mission SET statut = 'annulee', motif_annulation = $1, updated_at = now() WHERE id = $2`,
      [data.motif, req.params.id]
    )
    await query(
      `UPDATE edl_inventaire SET statut = 'infructueux', updated_at = now()
       WHERE mission_id = $1 AND statut = 'brouillon'`,
      [req.params.id]
    )

    setImmediate(() => dispatchWebhook(workspaceId, 'mission.annulee', {
      mission_id: req.params.id,
      motif: data.motif,
    }))

    sendSuccess(res, { cancelled: true })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
