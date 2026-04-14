import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../db/index.js'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendSuccess, sendList, sendError } from '../utils/response.js'
import { NotFoundError, AppError } from '../utils/errors.js'

const router = Router()
router.use(verifyToken)

// GET /api/tiers — List tiers with search, filters, pagination
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { search, type_personne, role, archived, cursor, limit: rawLimit } = req.query
    const limit = Math.min(parseInt(rawLimit as string) || 50, 100)

    let where = `t.workspace_id = $1 AND t.est_archive = $2`
    const params: unknown[] = [workspaceId, archived === 'true']
    let paramIndex = 3

    if (search) {
      where += ` AND (t.nom ILIKE $${paramIndex} OR t.prenom ILIKE $${paramIndex} OR t.raison_sociale ILIKE $${paramIndex} OR t.email ILIKE $${paramIndex} OR t.tel ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (type_personne && type_personne !== 'all') {
      where += ` AND t.type_personne = $${paramIndex}`
      params.push(type_personne)
      paramIndex++
    }

    // Role filter: proprietaire, locataire, mandataire
    let roleJoin = ''
    if (role === 'proprietaire') {
      roleJoin = `AND EXISTS (SELECT 1 FROM lot_proprietaire lp WHERE lp.tiers_id = t.id)`
    } else if (role === 'mandataire') {
      roleJoin = `AND EXISTS (SELECT 1 FROM lot l WHERE l.mandataire_id = t.id AND l.est_archive = false)`
    } else if (role === 'locataire') {
      roleJoin = `AND EXISTS (SELECT 1 FROM edl_locataire el WHERE el.tiers_id = t.id)`
    }

    if (cursor) {
      where += ` AND t.id > $${paramIndex}`
      params.push(cursor)
      paramIndex++
    }

    const sql = `
      SELECT t.*,
        (SELECT count(*) FROM lot_proprietaire lp WHERE lp.tiers_id = t.id)::int as nb_lots_proprio,
        (SELECT count(*) FROM lot l WHERE l.mandataire_id = t.id AND l.est_archive = false)::int as nb_lots_mandataire,
        (SELECT count(*) FROM edl_locataire el WHERE el.tiers_id = t.id)::int as nb_edl_locataire,
        (SELECT m.date_planifiee FROM mission m JOIN lot_proprietaire lp2 ON lp2.lot_id = m.lot_id WHERE lp2.tiers_id = t.id ORDER BY m.date_planifiee DESC LIMIT 1) as derniere_mission,
        (SELECT l2.designation FROM edl_locataire el2 JOIN edl_inventaire ei ON ei.id = el2.edl_id JOIN mission m2 ON m2.id = ei.mission_id JOIN lot l2 ON l2.id = m2.lot_id WHERE el2.tiers_id = t.id ORDER BY ei.created_at DESC LIMIT 1) as dernier_lot,
        (SELECT COALESCE(tp.prenom || ' ' || tp.nom, tp.nom) FROM edl_locataire el3 JOIN edl_inventaire ei2 ON ei2.id = el3.edl_id JOIN mission m3 ON m3.id = ei2.mission_id JOIN lot_proprietaire lp3 ON lp3.lot_id = m3.lot_id AND lp3.est_principal = true JOIN tiers tp ON tp.id = lp3.tiers_id WHERE el3.tiers_id = t.id ORDER BY ei2.created_at DESC LIMIT 1) as proprietaire_nom,
        (SELECT COALESCE(tc.prenom || ' ' || tc.nom, tc.nom) FROM tiers_organisation toc JOIN tiers tc ON tc.id = toc.tiers_id WHERE toc.organisation_id = t.id AND toc.est_principal = true LIMIT 1) as contact_principal
      FROM tiers t
      WHERE ${where} ${roleJoin}
      ORDER BY t.nom ASC, t.prenom ASC
      LIMIT $${paramIndex}
    `
    params.push(limit + 1)

    const result = await query(sql, params)
    const hasMore = result.rows.length > limit
    const data = hasMore ? result.rows.slice(0, limit) : result.rows
    const nextCursor = hasMore ? data[data.length - 1].id : undefined

    sendList(res, data, { cursor: nextCursor, has_more: hasMore })
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/tiers/stats/counts — Count by role (MUST be before /:id to avoid route shadowing)
router.get('/stats/counts', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const result = await query(`
      SELECT
        count(*) FILTER (WHERE est_archive = false)::int as total,
        count(*) FILTER (WHERE type_personne = 'physique' AND est_archive = false)::int as physiques,
        count(*) FILTER (WHERE type_personne = 'morale' AND est_archive = false)::int as morales,
        (SELECT count(DISTINCT lp.tiers_id) FROM lot_proprietaire lp JOIN tiers t2 ON t2.id = lp.tiers_id WHERE t2.workspace_id = $1 AND t2.est_archive = false)::int as proprietaires,
        (SELECT count(DISTINCT l.mandataire_id) FROM lot l WHERE l.workspace_id = $1 AND l.mandataire_id IS NOT NULL AND l.est_archive = false)::int as mandataires
      FROM tiers WHERE workspace_id = $1
    `, [workspaceId])
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/tiers/:id — Tiers detail
router.get('/:id', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const result = await query(
      `SELECT t.*,
        (SELECT json_agg(json_build_object('id', l.id, 'designation', l.designation, 'type_bien', l.type_bien,
          'batiment_designation', b.designation, 'est_principal', lp.est_principal))
         FROM lot_proprietaire lp JOIN lot l ON l.id = lp.lot_id JOIN batiment b ON b.id = l.batiment_id
         WHERE lp.tiers_id = t.id AND l.est_archive = false) as lots_proprietaire,
        (SELECT json_agg(json_build_object('id', l.id, 'designation', l.designation, 'type_bien', l.type_bien,
          'batiment_designation', b.designation))
         FROM lot l JOIN batiment b ON b.id = l.batiment_id
         WHERE l.mandataire_id = t.id AND l.est_archive = false) as lots_mandataire,
        (SELECT json_agg(json_build_object('tiers_id', to2.id, 'nom', to2.nom, 'raison_sociale', to2.raison_sociale, 'fonction', torg.fonction, 'est_principal', torg.est_principal))
         FROM tiers_organisation torg JOIN tiers to2 ON to2.id = torg.organisation_id
         WHERE torg.tiers_id = t.id) as organisations,
        (SELECT json_agg(json_build_object('tiers_id', to3.id, 'nom', to3.nom, 'prenom', to3.prenom, 'fonction', torg2.fonction, 'est_principal', torg2.est_principal))
         FROM tiers_organisation torg2 JOIN tiers to3 ON to3.id = torg2.tiers_id
         WHERE torg2.organisation_id = t.id) as membres
      FROM tiers t
      WHERE t.id = $1 AND t.workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (result.rows.length === 0) throw new NotFoundError('Tiers')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/tiers — Create tiers
const createTiersSchema = z.object({
  type_personne: z.enum(['physique', 'morale']),
  nom: z.string().min(1).max(255),
  prenom: z.string().max(255).optional(),
  raison_sociale: z.string().max(255).optional(),
  siren: z.string().max(14).optional(),
  email: z.string().email().optional().or(z.literal('')),
  tel: z.string().max(20).optional(),
  adresse: z.string().max(500).optional(),
  code_postal: z.string().max(10).optional(),
  ville: z.string().max(255).optional(),
  date_naissance: z.string().optional(),
  representant_nom: z.string().max(255).optional(),
  procuration: z.boolean().optional(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  // US-588: PM must have raison_sociale, PP must have nom
  if (data.type_personne === 'morale' && !data.raison_sociale?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'raison_sociale est requise pour une personne morale', path: ['raison_sociale'] })
  }
  if (data.type_personne === 'physique' && !data.nom?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'nom est requis pour une personne physique', path: ['nom'] })
  }
})

router.post('/', requireRole('admin', 'gestionnaire'), validate(createTiersSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const d = req.body

    // Non-blocking duplicate warning
    let warning: string | undefined
    if (d.email) {
      const existing = await query(
        `SELECT id FROM tiers WHERE email = $1 AND workspace_id = $2 AND est_archive = false`,
        [d.email, workspaceId]
      )
      if (existing.rows.length > 0) {
        warning = 'Un tiers avec cet email existe deja'
      }
    }

    const result = await query(
      `INSERT INTO tiers (workspace_id, type_personne, nom, prenom, raison_sociale, siren, email, tel, adresse, code_postal, ville, date_naissance, representant_nom, procuration, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [workspaceId, d.type_personne, d.nom, d.prenom ?? null, d.raison_sociale ?? null, d.siren ?? null,
       d.email || null, d.tel ?? null, d.adresse ?? null, d.code_postal ?? null, d.ville ?? null,
       d.date_naissance ?? null, d.representant_nom ?? null, d.procuration ?? false, d.notes ?? null]
    )

    sendSuccess(res, { ...result.rows[0], warning }, 201)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/tiers/:id — Update tiers
router.patch('/:id', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const allowedFields = [
      'nom', 'prenom', 'raison_sociale', 'siren', 'email', 'tel',
      'adresse', 'code_postal', 'ville', 'date_naissance', 'representant_nom', 'procuration', 'notes', 'est_archive'
    ]

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

    // US-593: Validate archive — block if active EDL or missions
    if (req.body.est_archive === true) {
      const tiersId = req.params.id
      // Check active EDL (brouillon) where tiers is locataire
      const activeEdl = await query(
        `SELECT count(*)::int as cnt FROM edl_locataire el
         JOIN edl_inventaire ei ON ei.id = el.edl_id
         WHERE el.tiers_id = $1 AND ei.statut = 'brouillon'`,
        [tiersId]
      )
      if (activeEdl.rows[0].cnt > 0) {
        throw new AppError(`Impossible d'archiver — ${activeEdl.rows[0].cnt} EDL en cours`, 'ACTIVE_EDL', 409)
      }
      // Check active missions on lots where tiers is proprietaire or mandataire
      const activeMissions = await query(
        `SELECT count(DISTINCT m.id)::int as cnt FROM mission m
         JOIN lot l ON l.id = m.lot_id
         WHERE m.statut IN ('planifiee', 'assignee')
           AND m.workspace_id = $1
           AND (l.mandataire_id = $2 OR EXISTS (SELECT 1 FROM lot_proprietaire lp WHERE lp.lot_id = l.id AND lp.tiers_id = $2))`,
        [workspaceId, tiersId]
      )
      if (activeMissions.rows[0].cnt > 0) {
        throw new AppError(`Impossible d'archiver — ${activeMissions.rows[0].cnt} mission(s) active(s) liee(s)`, 'ACTIVE_MISSIONS', 409)
      }
    }

    fields.push(`updated_at = now()`)
    values.push(req.params.id, workspaceId)

    const result = await query(
      `UPDATE tiers SET ${fields.join(', ')} WHERE id = $${idx++} AND workspace_id = $${idx} RETURNING *`,
      values
    )
    if (result.rows.length === 0) throw new NotFoundError('Tiers')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// ── US-589: TiersOrganisation CRUD ──

// POST /api/tiers/:id/organisations — Link PP to PM
router.post('/:id/organisations', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { organisation_id, fonction, est_principal } = req.body
    if (!organisation_id) { sendError(res, { status: 400, message: 'organisation_id requis', code: 'VALIDATION_ERROR' }); return }

    // Verify both tiers belong to workspace + validate types (PP → PM only)
    const check = await query(
      `SELECT id, type_personne FROM tiers WHERE id IN ($1, $2) AND workspace_id = $3`,
      [req.params.id, organisation_id, workspaceId]
    )
    if (check.rows.length < 2) throw new NotFoundError('Tiers')

    const tiersRow = check.rows.find((r: any) => r.id === req.params.id)
    const orgRow = check.rows.find((r: any) => r.id === organisation_id)
    if (tiersRow?.type_personne !== 'physique' || orgRow?.type_personne !== 'morale') {
      throw new AppError('Le lien organisation doit etre entre une personne physique et une personne morale', 'INVALID_TYPE', 400)
    }

    const result = await query(
      `INSERT INTO tiers_organisation (tiers_id, organisation_id, fonction, est_principal)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (tiers_id, organisation_id) DO UPDATE SET fonction = $3, est_principal = $4
       RETURNING *`,
      [req.params.id, organisation_id, fonction ?? 'contact_principal', est_principal ?? false]
    )
    sendSuccess(res, result.rows[0], 201)
  } catch (error) {
    sendError(res, error)
  }
})

// DELETE /api/tiers/:tiersId/organisations/:orgId — Unlink
router.delete('/:tiersId/organisations/:orgId', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const result = await query(
      `DELETE FROM tiers_organisation WHERE tiers_id = $1 AND organisation_id = $2 RETURNING *`,
      [req.params.tiersId, req.params.orgId]
    )
    if (result.rows.length === 0) throw new NotFoundError('Association')
    sendSuccess(res, { deleted: true })
  } catch (error) {
    sendError(res, error)
  }
})

// ── US-806/807/809: Enhanced tiers detail with role-specific data ──

// GET /api/tiers/:id/lots — Lots linked to tiers (as proprietaire or mandataire)
router.get('/:id/lots', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    // Lots as proprietaire
    const propLots = await query(
      `SELECT l.id, l.designation, l.type_bien, l.etage, l.surface,
        (SELECT json_build_object('id', b.id, 'designation', b.designation) FROM batiment b WHERE b.id = l.batiment_id) as batiment,
        'proprietaire' as role_lien
       FROM lot l
       JOIN lot_proprietaire lp ON lp.lot_id = l.id
       WHERE lp.tiers_id = $1 AND l.workspace_id = $2 AND l.est_archive = false
       ORDER BY l.designation`,
      [req.params.id, workspaceId]
    )
    // Lots as mandataire
    const mandLots = await query(
      `SELECT l.id, l.designation, l.type_bien, l.etage, l.surface,
        (SELECT json_build_object('id', b.id, 'designation', b.designation) FROM batiment b WHERE b.id = l.batiment_id) as batiment,
        'mandataire' as role_lien
       FROM lot l
       WHERE l.mandataire_id = $1 AND l.workspace_id = $2 AND l.est_archive = false
       ORDER BY l.designation`,
      [req.params.id, workspaceId]
    )
    sendSuccess(res, { proprietaire: propLots.rows, mandataire: mandLots.rows })
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/tiers/:id/missions — Missions linked to tiers (via owned/managed lots)
router.get('/:id/missions', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const result = await query(
      `SELECT DISTINCT m.id, m.reference, m.date_planifiee, m.statut, m.statut_rdv,
        json_build_object('id', l.id, 'designation', l.designation) as lot
       FROM mission m
       JOIN lot l ON l.id = m.lot_id
       WHERE m.workspace_id = $1
         AND (l.mandataire_id = $2 OR EXISTS (SELECT 1 FROM lot_proprietaire lp WHERE lp.lot_id = l.id AND lp.tiers_id = $2))
       ORDER BY m.date_planifiee DESC NULLS LAST
       LIMIT 50`,
      [workspaceId, req.params.id]
    )
    sendSuccess(res, result.rows)
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/tiers/:id/edl-history — EDL history for locataire (US-807)
router.get('/:id/edl-history', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const tiersId = req.params.id
    const result = await query(
      `SELECT ei.id, ei.type, ei.sens, ei.statut, ei.date_signature, ei.created_at,
        json_build_object('id', l.id, 'designation', l.designation) as lot,
        json_build_object('id', b.id, 'designation', b.designation) as batiment,
        -- US-807: propriétaire principal du lot
        (SELECT COALESCE(tp.prenom || ' ' || tp.nom, tp.raison_sociale, tp.nom)
         FROM lot_proprietaire lp JOIN tiers tp ON tp.id = lp.tiers_id
         WHERE lp.lot_id = l.id AND lp.est_principal = true LIMIT 1) as proprietaire_nom,
        -- US-807: statut occupation dérivé (en_cours / termine)
        CASE
          WHEN EXISTS (
            SELECT 1 FROM edl_locataire el2
            JOIN edl_inventaire ei2 ON ei2.id = el2.edl_id
            WHERE el2.tiers_id = $1 AND ei2.lot_id = l.id
              AND ei2.sens = 'sortie' AND ei2.statut = 'signe'
          ) THEN 'termine'
          ELSE 'en_cours'
        END as statut_occupation
       FROM edl_locataire el
       JOIN edl_inventaire ei ON ei.id = el.edl_id
       JOIN lot l ON l.id = ei.lot_id
       JOIN batiment b ON b.id = l.batiment_id
       WHERE el.tiers_id = $1 AND ei.workspace_id = $2
       ORDER BY ei.created_at DESC
       LIMIT 50`,
      [tiersId, workspaceId]
    )
    sendSuccess(res, result.rows)
  } catch (error) {
    sendError(res, error)
  }
})

export default router
