import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../db/index.js'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { NotFoundError, AppError } from '../utils/errors.js'
import { dispatchWebhook } from '../services/webhook-service.js'

const router = Router()
router.use(verifyToken)

// GET /api/edl/:id — EDL detail with locataires + cles
router.get('/:id', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    const result = await query(
      `SELECT ei.*,
        (SELECT json_agg(json_build_object(
          'id', el.id, 'tiers_id', el.tiers_id, 'role_locataire', el.role_locataire,
          'nom', t.nom, 'prenom', t.prenom, 'raison_sociale', t.raison_sociale,
          'email', t.email, 'tel', t.tel
        )) FROM edl_locataire el JOIN tiers t ON t.id = el.tiers_id WHERE el.edl_id = ei.id) as locataires,
        (SELECT json_agg(json_build_object(
          'id', cm.id, 'type_cle', cm.type_cle, 'quantite', cm.quantite,
          'statut', cm.statut, 'lieu_depot', cm.lieu_depot, 'commentaire', cm.commentaire,
          'deposee_at', cm.deposee_at, 'created_at', cm.created_at
        )) FROM cle_mission cm WHERE cm.edl_id = ei.id) as cles,
        (SELECT json_build_object('id', l.id, 'designation', l.designation, 'type_bien', l.type_bien)
         FROM lot l WHERE l.id = ei.lot_id) as lot,
        (SELECT json_build_object('id', m.id, 'reference', m.reference, 'statut', m.statut)
         FROM mission m WHERE m.id = ei.mission_id) as mission
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

// PATCH /api/edl/:id — Update EDL status / fields
const updateEdlSchema = z.object({
  statut: z.enum(['brouillon', 'signe', 'infructueux']).optional(),
  code_acces: z.string().max(100).optional(),
  commentaire_general: z.string().optional(),
  presence_locataire: z.boolean().optional(),
  presence_bailleur: z.boolean().optional(),
})

router.patch('/:id', requireRole('admin', 'gestionnaire'), validate(updateEdlSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const allowedFields = ['statut', 'code_acces', 'commentaire_general', 'presence_locataire', 'presence_bailleur']

    // Validate statut transitions: brouillon → signe | infructueux (forward only)
    if (req.body.statut) {
      const current = await query(
        `SELECT statut FROM edl_inventaire WHERE id = $1 AND workspace_id = $2`,
        [req.params.id, workspaceId]
      )
      if (current.rows.length > 0) {
        const from = current.rows[0].statut
        const to = req.body.statut
        const allowed: Record<string, string[]> = {
          brouillon: ['signe', 'infructueux'],
          signe: [], // document legal, immutable
          infructueux: [], // terminal
        }
        if (from !== to && !(allowed[from] || []).includes(to)) {
          throw new AppError(`Transition EDL ${from} → ${to} non autorisee`, 'INVALID_TRANSITION', 400)
        }
      }
    }

    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        fields.push(`${field} = $${idx++}`)
        values.push(req.body[field])
      }
    }

    if (fields.length === 0) {
      sendSuccess(res, { message: 'Aucune modification' })
      return
    }

    // If signing, set date_signature
    if (req.body.statut === 'signe') {
      fields.push(`date_signature = $${idx++}`)
      values.push(new Date().toISOString())
    }

    fields.push(`updated_at = now()`)
    values.push(req.params.id, workspaceId)

    // Use transaction for EDL update + auto-termination (prevents race condition)
    const { pool } = await import('../db/index.js')
    const client = await pool.connect()
    let edl: any

    try {
      await client.query('BEGIN')

      const result = await client.query(
        `UPDATE edl_inventaire SET ${fields.join(', ')} WHERE id = $${idx++} AND workspace_id = $${idx} RETURNING *`,
        values
      )

      if (result.rows.length === 0) { await client.query('ROLLBACK'); throw new NotFoundError('EDL') }
      edl = result.rows[0]

      // AUTO-TERMINATION: if statut changed to 'signe' and EDL belongs to a mission,
      // lock the mission row, check if ALL EDLs are signed → auto-terminate
      if (req.body.statut === 'signe' && edl.mission_id) {
        // Lock the mission row to prevent concurrent auto-termination
        await client.query(
          'SELECT id FROM mission WHERE id = $1 FOR UPDATE',
          [edl.mission_id]
        )

        const pendingEdl = await client.query(
          `SELECT count(*) as cnt FROM edl_inventaire
           WHERE mission_id = $1 AND statut != 'signe' AND statut != 'infructueux'`,
          [edl.mission_id]
        )
        if (parseInt(pendingEdl.rows[0].cnt) === 0) {
          await client.query(
            `UPDATE mission SET statut = 'terminee', updated_at = now() WHERE id = $1 AND statut NOT IN ('terminee', 'annulee')`,
            [edl.mission_id]
          )
          // Dispatch mission.terminee webhook (after commit)
          setImmediate(() => dispatchWebhook(req.user!.workspaceId, 'mission.terminee', {
            mission_id: edl.mission_id,
          }))
        }
      }

      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }

    // Dispatch edl.signe webhook
    if (req.body.statut === 'signe') {
      dispatchWebhook(req.user!.workspaceId, 'edl.signe', {
        edl_id: req.params.id,
        mission_id: edl.mission_id,
        lot_id: edl.lot_id,
      })
    }

    // Dispatch edl.infructueux webhook
    if (req.body.statut === 'infructueux') {
      dispatchWebhook(req.user!.workspaceId, 'edl.infructueux', {
        edl_id: req.params.id,
        mission_id: edl.mission_id,
        lot_id: edl.lot_id,
      })
    }

    sendSuccess(res, edl)
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/edl/:edlId/cles — Add key to EDL
const createCleSchema = z.object({
  type_cle: z.enum(['cle_principale', 'badge', 'boite_aux_lettres', 'parking', 'cave', 'digicode', 'autre']),
  quantite: z.number().int().positive().default(1),
  statut: z.enum(['remise', 'a_deposer', 'deposee']).optional(),
  lieu_depot: z.string().optional(),
  commentaire: z.string().optional(),
})

router.post('/:edlId/cles', requireRole('admin', 'gestionnaire', 'technicien'), validate(createCleSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const d = req.body

    // Verify EDL exists and belongs to workspace
    const edl = await query(
      `SELECT id, mission_id, sens FROM edl_inventaire WHERE id = $1 AND workspace_id = $2`,
      [req.params.edlId, workspaceId]
    )
    if (edl.rows.length === 0) throw new NotFoundError('EDL')

    const edlRow = edl.rows[0]
    if (!edlRow.mission_id) {
      throw new AppError('EDL non rattache a une mission', 'NO_MISSION', 400)
    }

    // Default statut based on EDL sens: entree → 'remise', sortie → 'a_deposer'
    const statut = d.statut ?? (edlRow.sens === 'entree' ? 'remise' : 'a_deposer')

    const result = await query(
      `INSERT INTO cle_mission (edl_id, mission_id, type_cle, quantite, statut, lieu_depot, commentaire)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.params.edlId, edlRow.mission_id, d.type_cle, d.quantite, statut, d.lieu_depot ?? null, d.commentaire ?? null]
    )

    sendSuccess(res, result.rows[0], 201)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/edl/:edlId/cles/:cleId — Update key
const updateCleSchema = z.object({
  statut: z.enum(['remise', 'a_deposer', 'deposee']).optional(),
  lieu_depot: z.string().optional(),
  commentaire: z.string().optional(),
})

router.patch('/:edlId/cles/:cleId', requireRole('admin', 'gestionnaire', 'technicien'), validate(updateCleSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const allowedFields = ['statut', 'lieu_depot', 'commentaire']

    // Verify EDL belongs to workspace
    const edl = await query(
      `SELECT id FROM edl_inventaire WHERE id = $1 AND workspace_id = $2`,
      [req.params.edlId, workspaceId]
    )
    if (edl.rows.length === 0) throw new NotFoundError('EDL')

    // Validate cle statut transition: remise → a_deposer → deposee (forward only)
    if (req.body.statut) {
      const current = await query(`SELECT statut FROM cle_mission WHERE id = $1 AND edl_id = $2`, [req.params.cleId, req.params.edlId])
      if (current.rows.length > 0) {
        const from = current.rows[0].statut
        const to = req.body.statut
        const order = ['remise', 'a_deposer', 'deposee']
        if (from !== to && order.indexOf(to) < order.indexOf(from)) {
          throw new AppError(`Transition cle ${from} → ${to} non autorisee (retour arriere)`, 'INVALID_TRANSITION', 400)
        }
      }
    }

    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        fields.push(`${field} = $${idx++}`)
        values.push(req.body[field])
      }
    }

    if (fields.length === 0) {
      sendSuccess(res, { message: 'Aucune modification' })
      return
    }

    // If statut changes to 'deposee', set deposee_at
    if (req.body.statut === 'deposee') {
      fields.push(`deposee_at = $${idx++}`)
      values.push(new Date().toISOString())
    }

    fields.push(`updated_at = now()`)
    values.push(req.params.cleId, req.params.edlId)

    const result = await query(
      `UPDATE cle_mission SET ${fields.join(', ')} WHERE id = $${idx++} AND edl_id = $${idx} RETURNING *`,
      values
    )

    if (result.rows.length === 0) throw new NotFoundError('Cle')

    // Dispatch cle.deposee webhook
    if (req.body.statut === 'deposee') {
      dispatchWebhook(req.user!.workspaceId, 'cle.deposee', {
        cle_id: req.params.cleId,
        edl_id: req.params.edlId,
      })
    }

    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// DELETE /api/edl/:edlId/cles/:cleId — Remove key
router.delete('/:edlId/cles/:cleId', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    // Verify EDL belongs to workspace
    const edl = await query(
      `SELECT id FROM edl_inventaire WHERE id = $1 AND workspace_id = $2`,
      [req.params.edlId, workspaceId]
    )
    if (edl.rows.length === 0) throw new NotFoundError('EDL')

    const result = await query(
      `DELETE FROM cle_mission WHERE id = $1 AND edl_id = $2 RETURNING id`,
      [req.params.cleId, req.params.edlId]
    )

    if (result.rows.length === 0) throw new NotFoundError('Cle')
    sendSuccess(res, { deleted: true })
  } catch (error) {
    sendError(res, error)
  }
})

// ── Mission-scoped EDL routes (mounted at /api/missions) ──

const missionEdlRouter = Router()
missionEdlRouter.use(verifyToken)

// POST /api/missions/:missionId/edl — Add EDL to existing mission
const createEdlForMissionSchema = z.object({
  type: z.enum(['edl', 'inventaire']),
  sens: z.enum(['entree', 'sortie']),
  locataires: z.array(z.object({
    tiers_id: z.uuid(),
    role_locataire: z.enum(['entrant', 'sortant']),
  })).optional(),
})

missionEdlRouter.post('/:missionId/edl', requireRole('admin', 'gestionnaire'), validate(createEdlForMissionSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const d = req.body

    // Verify mission exists, belongs to workspace, and is NOT terminee
    const mission = await query(
      `SELECT id, lot_id, statut FROM mission WHERE id = $1 AND workspace_id = $2`,
      [req.params.missionId, workspaceId]
    )
    if (mission.rows.length === 0) throw new NotFoundError('Mission')

    const missionRow = mission.rows[0]
    if (missionRow.statut === 'terminee') {
      throw new AppError(
        'Impossible d\'ajouter un EDL a une mission terminee',
        'MISSION_LOCKED',
        409
      )
    }
    if (missionRow.statut === 'annulee') {
      throw new AppError(
        'Impossible d\'ajouter un EDL a une mission annulee',
        'MISSION_CANCELLED',
        409
      )
    }

    // Create EDL linked to mission and mission's lot
    const edlResult = await query(
      `INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, type, sens)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [workspaceId, req.params.missionId, missionRow.lot_id, d.type, d.sens]
    )
    const edl = edlResult.rows[0]

    // If locataires provided, create edl_locataire entries
    if (d.locataires && d.locataires.length > 0) {
      for (const loc of d.locataires) {
        await query(
          `INSERT INTO edl_locataire (edl_id, tiers_id, role_locataire)
           VALUES ($1, $2, $3)`,
          [edl.id, loc.tiers_id, loc.role_locataire]
        )
      }
    }

    // Re-fetch with locataires
    const full = await query(
      `SELECT ei.*,
        (SELECT json_agg(json_build_object(
          'id', el.id, 'tiers_id', el.tiers_id, 'role_locataire', el.role_locataire,
          'nom', t.nom, 'prenom', t.prenom
        )) FROM edl_locataire el JOIN tiers t ON t.id = el.tiers_id WHERE el.edl_id = ei.id) as locataires
      FROM edl_inventaire ei
      WHERE ei.id = $1`,
      [edl.id]
    )

    sendSuccess(res, full.rows[0], 201)
  } catch (error) {
    sendError(res, error)
  }
})

export { missionEdlRouter }
export default router
