import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../../db/index.js'
import { requireWriteScope } from '../../middleware/api-key-auth.js'
import { sendSuccess, sendError } from '../../utils/response.js'
import { NotFoundError, AppError } from '../../utils/errors.js'
import { dispatchWebhook } from '../../services/webhook-service.js'
import { presignPdfUrl } from '../../services/s3-presign-service.js'
import { encodeCursor, decodeCursor } from '../../utils/cursor.js'
import { resolveId } from '../../utils/resolve-id.js'

// Resolve mission `:id` path-param: accepts UUID or `reference` (M-YYYY-XXXX).
function resolveMissionId(rawId: string, workspaceId: string) {
  return resolveId({
    table: 'mission',
    alternateColumn: 'reference',
    identifier: rawId,
    workspaceId,
    entityName: 'Mission',
  })
}

const router = Router()

// SQL projection for the full Mission object returned by GET /:id, POST and PATCH.
// Keep aligned with the `Mission` schema in openapi.yaml.
const MISSION_SELECT = `
  m.id, m.reference, m.lot_id, m.date_planifiee, m.heure_debut, m.heure_fin,
  m.statut, m.avec_inventaire, m.commentaire,
  m.motif_annulation, m.motif_infructueux, m.terminee_at, m.infructueuse_at, m.annulee_at,
  m.created_at, m.updated_at,
  json_build_object('id', l.id, 'designation', l.designation, 'type_bien', l.type_bien,
    'etage', l.etage, 'surface', l.surface) AS lot,
  (SELECT json_build_object(
            'user_id', mt.user_id, 'statut_invitation', mt.statut_invitation,
            'nom', u.nom, 'prenom', u.prenom, 'email', u.email)
   FROM mission_technicien mt
   JOIN utilisateur u ON u.id = mt.user_id
   WHERE mt.mission_id = m.id LIMIT 1) AS technicien,
  (SELECT json_agg(json_build_object('id', ei.id, 'type', ei.type, 'sens', ei.sens,
    'statut', ei.statut, 'motif_infructueux', ei.motif_infructueux,
    'pdf_url', ei.pdf_url, 'web_url', ei.web_url,
    'pdf_url_legal', ei.pdf_url_legal, 'web_url_legal', ei.web_url_legal,
    'url_verification', ei.url_verification))
   FROM edl_inventaire ei WHERE ei.mission_id = m.id) AS edls
`

async function fetchMissionById(missionId: string, workspaceId: string) {
  const result = await query(
    `SELECT ${MISSION_SELECT}
     FROM mission m
     JOIN lot l ON l.id = m.lot_id
     WHERE m.id = $1 AND m.workspace_id = $2`,
    [missionId, workspaceId]
  )
  if (result.rows.length === 0) throw new NotFoundError('Mission')
  const mission = result.rows[0]
  mission.edls = projectEdlRows(mission.edls)
  return mission
}

// Null out URLs on non-signed EDL; pre-sign PDF URLs on signed ones (US-601).
function projectEdlRows<T extends Record<string, unknown>>(edls: T[] | null): T[] | null {
  if (!Array.isArray(edls)) return edls
  return edls.map(e => {
    if (e.statut !== 'signe') {
      return { ...e, pdf_url: null, web_url: null, pdf_url_legal: null, web_url_legal: null, url_verification: null }
    }
    return {
      ...e,
      pdf_url: presignPdfUrl(e.pdf_url as string | null),
      pdf_url_legal: presignPdfUrl(e.pdf_url_legal as string | null),
    }
  })
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const HHMM = /^\d{2}:\d{2}(:\d{2})?$/

const createSchema = z.object({
  lot_id: z.string().uuid(),
  sens: z.enum(['entree', 'sortie', 'entree_sortie']),
  avec_inventaire: z.boolean().optional().default(false),
  date_planifiee: z.string().regex(ISO_DATE, 'Format attendu YYYY-MM-DD').optional(),
  heure_debut: z.string().regex(HHMM, 'Format attendu HH:MM').optional(),
  heure_fin: z.string().regex(HHMM, 'Format attendu HH:MM').optional(),
  commentaire: z.string().optional(),
  // optional: assign a technician immediately
  technicien_id: z.string().uuid().optional(),
  // optional: colocation support
  locataires: z.array(z.string().uuid()).optional(),
  type_bail: z.enum(['individuel', 'collectif']).optional().default('individuel'),
})

const patchSchema = z.object({
  date_planifiee: z.string().regex(ISO_DATE, 'Format attendu YYYY-MM-DD').optional(),
  heure_debut: z.string().regex(HHMM, 'Format attendu HH:MM').nullable().optional(),
  heure_fin: z.string().regex(HHMM, 'Format attendu HH:MM').nullable().optional(),
  commentaire: z.string().nullable().optional(),
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
      const c = decodeCursor(cursor)
      if (c) {
        where += ` AND (m.date_planifiee, m.id) < ($${idx}, $${idx + 1})`
        params.push(c.orderKey, c.id); idx += 2
      }
    }

    const sql = `
      SELECT m.id, m.reference, m.date_planifiee, m.heure_debut, m.heure_fin,
             m.statut, m.avec_inventaire, m.commentaire, m.created_at,
             json_build_object('id', l.id, 'designation', l.designation, 'type_bien', l.type_bien) AS lot
      FROM mission m
      JOIN lot l ON l.id = m.lot_id
      ${where}
      ORDER BY m.date_planifiee DESC NULLS FIRST, m.id DESC
      LIMIT $${idx}`
    params.push(limit + 1)

    const result = await query(sql, params)
    const has_more = result.rows.length > limit
    const rows = has_more ? result.rows.slice(0, limit) : result.rows
    const last = rows[rows.length - 1]
    const nextCursor = has_more && last ? encodeCursor(last.date_planifiee, last.id) : null

    sendSuccess(res, { data: rows, meta: { cursor: nextCursor, has_more } })
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/v1/missions/:id
router.get('/:id', async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const missionId = await resolveMissionId(String(req.params.id), workspaceId)
    sendSuccess(res, await fetchMissionById(missionId, workspaceId))
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/v1/missions/:id/edl-inventaires
router.get('/:id/edl-inventaires', async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const missionId = await resolveMissionId(String(req.params.id), workspaceId)

    const result = await query(
      `SELECT ei.id, ei.type, ei.sens, ei.statut,
              ei.date_realisation, ei.date_signature, ei.motif_infructueux, ei.created_at,
              ei.pdf_url, ei.web_url, ei.pdf_url_legal, ei.web_url_legal, ei.url_verification
       FROM edl_inventaire ei
       WHERE ei.mission_id = $1 AND ei.workspace_id = $2
       ORDER BY ei.created_at ASC`,
      [missionId, workspaceId]
    )
    sendSuccess(res, projectEdlRows(result.rows))
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

    // Le technicien assigné vit dans mission_technicien.statut_invitation,
    // pas dans mission.statut. Toute nouvelle mission démarre en 'planifiee'.
    const initialStatut = 'planifiee'

    // Use transaction for mission + EDLs + optional technician assignment
    const { pool } = await import('../../db/index.js')
    const client = await pool.connect()
    let mission: any

    try {
      await client.query('BEGIN')

      const mResult = await client.query(
        `INSERT INTO mission (workspace_id, lot_id, reference, date_planifiee, heure_debut, heure_fin,
          statut, avec_inventaire, commentaire)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, reference`,
        [workspaceId, data.lot_id, reference, data.date_planifiee ?? null,
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

    // Re-fetch the full Mission shape so the response matches the OpenAPI `Mission` schema.
    const fullMission = await fetchMissionById(mission.id, workspaceId)

    // Dispatch mission.creee webhook (fire-and-forget)
    setImmediate(() => dispatchWebhook(workspaceId, 'mission.creee', {
      mission_id: fullMission.id,
      reference: fullMission.reference,
      lot_id: data.lot_id,
      statut: fullMission.statut,
    }))

    sendSuccess(res, fullMission, 201)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/v1/missions/:id — modify (locked if terminee)
router.patch('/:id', requireWriteScope, async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const data = patchSchema.parse(req.body)
    const missionId = await resolveMissionId(String(req.params.id), workspaceId)

    const current = await query(
      `SELECT id, statut FROM mission WHERE id = $1 AND workspace_id = $2 AND est_archive = false`,
      [missionId, workspaceId]
    )
    if (current.rows.length === 0) throw new NotFoundError('Mission')

    const { statut } = current.rows[0]
    if (statut === 'annulee') throw new AppError('Mission annulée non modifiable', 'MISSION_LOCKED', 403)

    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    // Terminée / Infructueuse : commentaire seul modifiable
    if (statut === 'terminee' || statut === 'infructueuse') {
      if (data.commentaire !== undefined) {
        fields.push(`commentaire = $${idx++}`); values.push(data.commentaire)
      } else {
        throw new AppError('Mission verrouillée : seul le commentaire est modifiable', 'MISSION_LOCKED', 403)
      }
    } else {
      if (data.date_planifiee !== undefined) { fields.push(`date_planifiee = $${idx++}`); values.push(data.date_planifiee) }
      if (data.heure_debut !== undefined) { fields.push(`heure_debut = $${idx++}`); values.push(data.heure_debut) }
      if (data.heure_fin !== undefined) { fields.push(`heure_fin = $${idx++}`); values.push(data.heure_fin) }
      if (data.commentaire !== undefined) { fields.push(`commentaire = $${idx++}`); values.push(data.commentaire) }
    }

    if (fields.length === 0) throw new AppError('Aucun champ à modifier', 'VALIDATION_ERROR', 400)

    fields.push(`updated_at = now()`)
    values.push(missionId)
    await query(
      `UPDATE mission SET ${fields.join(', ')} WHERE id = $${idx}`,
      values
    )

    // Auto-réinvitation : si la planification change, l'invitation tech repasse à "Invité"
    const schedulingChanged =
      data.date_planifiee !== undefined ||
      data.heure_debut !== undefined ||
      data.heure_fin !== undefined
    if (schedulingChanged) {
      await query(
        `UPDATE mission_technicien SET statut_invitation = 'en_attente', updated_at = now()
         WHERE mission_id = $1 AND statut_invitation IN ('accepte', 'en_attente')`,
        [missionId]
      )
    }

    sendSuccess(res, await fetchMissionById(missionId, workspaceId))
  } catch (error) {
    sendError(res, error)
  }
})

// DELETE /api/v1/missions/:id — cancel (motif required, blocked if terminee)
router.delete('/:id', requireWriteScope, async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const data = cancelSchema.parse(req.body)
    const missionId = await resolveMissionId(String(req.params.id), workspaceId)

    const current = await query(
      `SELECT id, statut FROM mission WHERE id = $1 AND workspace_id = $2 AND est_archive = false`,
      [missionId, workspaceId]
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
      `UPDATE mission SET statut = 'annulee', motif_annulation = $1, annulee_at = now(), updated_at = now() WHERE id = $2`,
      [data.motif, missionId]
    )
    await query(
      `UPDATE edl_inventaire SET statut = 'infructueux', updated_at = now()
       WHERE mission_id = $1 AND statut = 'brouillon'`,
      [missionId]
    )

    setImmediate(() => dispatchWebhook(workspaceId, 'mission.annulee', {
      mission_id: missionId,
      motif: data.motif,
    }))

    sendSuccess(res, { cancelled: true })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
