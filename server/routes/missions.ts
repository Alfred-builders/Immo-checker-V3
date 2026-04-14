import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../db/index.js'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendSuccess, sendList, sendError } from '../utils/response.js'
import { NotFoundError, AppError } from '../utils/errors.js'
import { dispatchWebhook } from '../services/webhook-service.js'

const router = Router()
router.use(verifyToken)

// ── GET /api/missions/stats — Stat cards ──
router.get('/stats', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const result = await query(
      `SELECT
        count(*) FILTER (WHERE m.statut NOT IN ('annulee'))::int as total,
        count(*) FILTER (WHERE m.date_planifiee = CURRENT_DATE AND m.statut NOT IN ('annulee'))::int as today,
        count(*) FILTER (
          WHERE m.statut IN ('planifiee', 'assignee')
          AND (
            NOT EXISTS (SELECT 1 FROM mission_technicien mt2 WHERE mt2.mission_id = m.id)
            OR EXISTS (SELECT 1 FROM mission_technicien mt2 WHERE mt2.mission_id = m.id AND mt2.statut_invitation != 'accepte')
            OR m.statut_rdv = 'a_confirmer'
          )
        )::int as pending,
        count(*) FILTER (WHERE m.date_planifiee > CURRENT_DATE AND m.statut IN ('planifiee', 'assignee'))::int as upcoming
      FROM mission m
      WHERE m.workspace_id = $1 AND m.est_archive = false`,
      [workspaceId]
    )
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// ── GET /api/missions — List with filters ──
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const {
      search, statut, statut_rdv, technicien_id, date_from, date_to,
      pending_actions, lot_id, cursor, limit: rawLimit
    } = req.query
    const limit = Math.min(parseInt(rawLimit as string) || 25, 100)

    let where = `m.workspace_id = $1 AND m.est_archive = false`
    const params: unknown[] = [workspaceId]
    let paramIndex = 2

    // Default: exclude annulee unless explicitly filtered
    if (statut) {
      where += ` AND m.statut = $${paramIndex}`
      params.push(statut)
      paramIndex++
    } else {
      where += ` AND m.statut != 'annulee'`
    }

    if (search) {
      where += ` AND (
        m.reference ILIKE $${paramIndex}
        OR EXISTS (SELECT 1 FROM lot l2 WHERE l2.id = m.lot_id AND l2.designation ILIKE $${paramIndex})
      )`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (statut_rdv) {
      where += ` AND m.statut_rdv = $${paramIndex}`
      params.push(statut_rdv)
      paramIndex++
    }

    if (technicien_id) {
      where += ` AND EXISTS (SELECT 1 FROM mission_technicien mt2 WHERE mt2.mission_id = m.id AND mt2.user_id = $${paramIndex})`
      params.push(technicien_id)
      paramIndex++
    }

    if (date_from) {
      where += ` AND m.date_planifiee >= $${paramIndex}`
      params.push(date_from)
      paramIndex++
    }

    if (date_to) {
      where += ` AND m.date_planifiee <= $${paramIndex}`
      params.push(date_to)
      paramIndex++
    }

    if (lot_id) {
      where += ` AND m.lot_id = $${paramIndex}`
      params.push(lot_id)
      paramIndex++
    }

    if (pending_actions === 'true') {
      where += ` AND m.statut IN ('planifiee', 'assignee') AND (
        NOT EXISTS (SELECT 1 FROM mission_technicien mt2 WHERE mt2.mission_id = m.id)
        OR EXISTS (SELECT 1 FROM mission_technicien mt2 WHERE mt2.mission_id = m.id AND mt2.statut_invitation != 'accepte')
        OR m.statut_rdv = 'a_confirmer'
      )`
    }

    if (cursor) {
      where += ` AND (m.date_planifiee, m.reference) < (
        (SELECT date_planifiee FROM mission WHERE id = $${paramIndex}),
        (SELECT reference FROM mission WHERE id = $${paramIndex})
      )`
      params.push(cursor)
      paramIndex++
    }

    const sql = `
      SELECT
        m.id, m.reference, m.date_planifiee, m.heure_debut, m.heure_fin,
        m.statut, m.statut_rdv, m.avec_inventaire, m.type_bail,
        m.commentaire, m.motif_annulation, m.created_at,
        json_build_object(
          'id', l.id, 'designation', l.designation, 'type_bien', l.type_bien,
          'etage', l.etage
        ) as lot,
        (SELECT json_build_object(
          'rue', ab.rue, 'complement', ab.complement,
          'code_postal', ab.code_postal, 'ville', ab.ville,
          'latitude', ab.latitude, 'longitude', ab.longitude
        ) FROM adresse_batiment ab
         JOIN batiment b ON b.id = l.batiment_id
         WHERE ab.batiment_id = b.id AND ab.type = 'principale' LIMIT 1) as adresse,
        (SELECT json_build_object(
          'id', b.id, 'designation', b.designation
        ) FROM batiment b WHERE b.id = l.batiment_id) as batiment,
        (SELECT json_agg(json_build_object(
          'user_id', u.id, 'nom', u.nom, 'prenom', u.prenom,
          'statut_invitation', mt.statut_invitation, 'est_principal', mt.est_principal
        )) FROM mission_technicien mt
         JOIN utilisateur u ON u.id = mt.user_id
         WHERE mt.mission_id = m.id) as techniciens,
        (SELECT json_agg(json_build_object(
          'id', ei.id, 'type', ei.type, 'sens', ei.sens, 'statut', ei.statut
        )) FROM edl_inventaire ei WHERE ei.mission_id = m.id) as edls
      FROM mission m
      JOIN lot l ON l.id = m.lot_id
      WHERE ${where}
      ORDER BY m.date_planifiee DESC, m.reference DESC
      LIMIT $${paramIndex}
    `
    params.push(limit + 1)

    const result = await query(sql, params)
    const hasMore = result.rows.length > limit
    const rawData = hasMore ? result.rows.slice(0, limit) : result.rows
    const nextCursor = hasMore ? rawData[rawData.length - 1].id : undefined

    // Transform raw rows to match frontend Mission interface
    const data = rawData.map((row: any) => {
      const edls = row.edls ?? []
      const techniciens = row.techniciens ?? []
      const primaryTech = techniciens.find((t: any) => t.est_principal) ?? techniciens[0] ?? null
      const edlTypes = [...new Set(edls.flatMap((e: any) => [e.sens, ...(e.type === 'inventaire' ? ['inventaire'] : [])]))]
      const hasPendingActions = (row.statut === 'planifiee' || row.statut === 'assignee') && (
        techniciens.length === 0 ||
        techniciens.some((t: any) => t.statut_invitation !== 'accepte') ||
        row.statut_rdv === 'a_confirmer'
      )

      return {
        id: row.id,
        reference: row.reference,
        lot_id: row.lot?.id,
        lot_designation: row.lot?.designation,
        lot_type_bien: row.lot?.type_bien,
        batiment_designation: row.batiment?.designation,
        adresse: row.adresse ? `${row.adresse.rue ?? ''}${row.adresse.complement ? `, ${row.adresse.complement}` : ''}, ${row.adresse.code_postal ?? ''} ${row.adresse.ville ?? ''}` : null,
        latitude: row.adresse?.latitude,
        longitude: row.adresse?.longitude,
        date_planifiee: row.date_planifiee,
        heure_debut: row.heure_debut,
        heure_fin: row.heure_fin,
        statut: row.statut,
        statut_rdv: row.statut_rdv,
        avec_inventaire: row.avec_inventaire,
        type_bail: row.type_bail,
        commentaire: row.commentaire,
        motif_annulation: row.motif_annulation,
        technicien: primaryTech ? { user_id: primaryTech.user_id, nom: primaryTech.nom, prenom: primaryTech.prenom, statut_invitation: primaryTech.statut_invitation } : null,
        edl_types: edlTypes,
        has_pending_actions: hasPendingActions,
        created_at: row.created_at,
      }
    })

    sendList(res, data, { cursor: nextCursor, has_more: hasMore })
  } catch (error) {
    sendError(res, error)
  }
})

// ── GET /api/missions/:id — Full detail ──
router.get('/:id', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const result = await query(
      `SELECT m.*,
        -- Lot
        json_build_object(
          'id', l.id, 'designation', l.designation, 'type_bien', l.type_bien,
          'etage', l.etage, 'emplacement_palier', l.emplacement_palier,
          'surface', l.surface, 'meuble', l.meuble
        ) as lot,
        -- Batiment
        (SELECT json_build_object('id', b.id, 'designation', b.designation, 'type', b.type)
         FROM batiment b WHERE b.id = l.batiment_id) as batiment,
        -- Adresse principale
        (SELECT json_build_object(
          'rue', ab.rue, 'complement', ab.complement,
          'code_postal', ab.code_postal, 'ville', ab.ville,
          'latitude', ab.latitude, 'longitude', ab.longitude
        ) FROM adresse_batiment ab WHERE ab.batiment_id = l.batiment_id AND ab.type = 'principale' LIMIT 1) as adresse,
        -- Proprietaires (via lot_proprietaire)
        (SELECT json_agg(json_build_object(
          'id', t.id, 'nom', t.nom, 'prenom', t.prenom,
          'type_personne', t.type_personne, 'raison_sociale', t.raison_sociale,
          'email', t.email, 'tel', t.tel, 'est_principal', lp.est_principal
        )) FROM lot_proprietaire lp JOIN tiers t ON t.id = lp.tiers_id WHERE lp.lot_id = l.id) as proprietaires,
        -- Mandataire (via lot.mandataire_id)
        (SELECT json_build_object(
          'id', t.id, 'nom', t.nom, 'prenom', t.prenom,
          'raison_sociale', t.raison_sociale, 'email', t.email, 'tel', t.tel
        ) FROM tiers t WHERE t.id = l.mandataire_id) as mandataire,
        -- Techniciens (via mission_technicien)
        (SELECT json_agg(json_build_object(
          'id', mt.id, 'user_id', u.id, 'nom', u.nom, 'prenom', u.prenom,
          'email', u.email, 'statut_invitation', mt.statut_invitation,
          'est_principal', mt.est_principal
        )) FROM mission_technicien mt JOIN utilisateur u ON u.id = mt.user_id WHERE mt.mission_id = m.id) as techniciens,
        -- EDLs with their locataires
        (SELECT json_agg(json_build_object(
          'id', ei.id, 'type', ei.type, 'sens', ei.sens, 'statut', ei.statut,
          'date_realisation', ei.date_realisation, 'date_signature', ei.date_signature,
          'code_acces', ei.code_acces, 'commentaire_general', ei.commentaire_general,
          'pdf_url', ei.pdf_url, 'web_url', ei.web_url,
          'locataires', (
            SELECT json_agg(json_build_object(
              'id', t2.id, 'nom', t2.nom, 'prenom', t2.prenom,
              'type_personne', t2.type_personne, 'raison_sociale', t2.raison_sociale,
              'email', t2.email, 'tel', t2.tel, 'role_locataire', el.role_locataire
            )) FROM edl_locataire el JOIN tiers t2 ON t2.id = el.tiers_id WHERE el.edl_id = ei.id
          )
        )) FROM edl_inventaire ei WHERE ei.mission_id = m.id) as edls,
        -- Cles (via edl_inventaire -> cle_mission)
        (SELECT json_agg(json_build_object(
          'id', cm.id, 'edl_id', cm.edl_id, 'type_cle', cm.type_cle,
          'quantite', cm.quantite, 'statut', cm.statut,
          'lieu_depot', cm.lieu_depot, 'commentaire', cm.commentaire,
          'deposee_at', cm.deposee_at
        )) FROM cle_mission cm
         JOIN edl_inventaire ei2 ON ei2.id = cm.edl_id
         WHERE ei2.mission_id = m.id) as cles
      FROM mission m
      JOIN lot l ON l.id = m.lot_id
      WHERE m.id = $1 AND m.workspace_id = $2`,
      [req.params.id, workspaceId]
    )

    if (result.rows.length === 0) throw new NotFoundError('Mission')

    const row = result.rows[0]
    const edls = row.edls ?? []
    const techniciens = row.techniciens ?? []
    const primaryTech = techniciens.find((t: any) => t.est_principal) ?? techniciens[0] ?? null
    const edlTypes = [...new Set(edls.flatMap((e: any) => [e.sens, ...(e.type === 'inventaire' ? ['inventaire'] : [])]))]
    const hasPendingActions = (row.statut === 'planifiee' || row.statut === 'assignee') && (
      techniciens.length === 0 ||
      techniciens.some((t: any) => t.statut_invitation !== 'accepte') ||
      row.statut_rdv === 'a_confirmer'
    )

    const creatorResult = await query(`SELECT nom, prenom FROM utilisateur WHERE id = $1`, [row.created_by])
    const creator = creatorResult.rows[0]

    const detail: any = {
      ...row,
      lot_designation: row.lot?.designation,
      lot_type_bien: row.lot?.type_bien,
      batiment_designation: row.batiment?.designation,
      adresse: row.adresse ? `${row.adresse.rue ?? ''}${row.adresse.complement ? `, ${row.adresse.complement}` : ''}, ${row.adresse.code_postal ?? ''} ${row.adresse.ville ?? ''}` : null,
      latitude: row.adresse?.latitude,
      longitude: row.adresse?.longitude,
      technicien: primaryTech ? { user_id: primaryTech.user_id, nom: primaryTech.nom, prenom: primaryTech.prenom, statut_invitation: primaryTech.statut_invitation } : null,
      edl_types: edlTypes,
      has_pending_actions: hasPendingActions,
      lot: { ...row.lot, batiment: row.batiment, adresse: row.adresse },
      techniciens,
      proprietaires: row.proprietaires ?? [],
      edls: edls.map((e: any) => ({ ...e, locataires: e.locataires ?? [], url_pdf: e.pdf_url || null, url_web: e.web_url || null, url_pdf_legal: null, url_web_legal: null })),
      cles: row.cles ?? [],
      created_by_nom: creator ? `${creator.prenom} ${creator.nom}` : '',
    }
    delete detail.batiment

    sendSuccess(res, detail)
  } catch (error) {
    sendError(res, error)
  }
})

// ── POST /api/missions — Create mission ──
const createMissionSchema = z.object({
  lot_id: z.uuid(),
  sens: z.enum(['entree', 'sortie', 'entree_sortie']),
  avec_inventaire: z.boolean().optional().default(false),
  date_planifiee: z.string().min(1), // ISO date YYYY-MM-DD
  heure_debut: z.string().optional(),
  heure_fin: z.string().optional(),
  technicien_id: z.uuid().optional(),
  commentaire: z.string().optional(),
  locataires: z.array(z.object({
    tiers_id: z.uuid(),
    role_locataire: z.enum(['entrant', 'sortant']),
  })).optional().default([]),
  type_bail: z.enum(['individuel', 'collectif']).optional().default('individuel'),
})

router.post('/', requireRole('admin', 'gestionnaire'), validate(createMissionSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const userId = req.user!.userId
    const d = req.body

    // Verify lot exists in workspace
    const lotCheck = await query(
      `SELECT id FROM lot WHERE id = $1 AND workspace_id = $2 AND est_archive = false`,
      [d.lot_id, workspaceId]
    )
    if (lotCheck.rows.length === 0) throw new NotFoundError('Lot')

    // Auto-generate reference: M-{YYYY}-{XXXX}
    const year = new Date().getFullYear()
    const countResult = await query(
      `SELECT count(*)::int as cnt FROM mission
       WHERE workspace_id = $1 AND EXTRACT(YEAR FROM created_at) = $2`,
      [workspaceId, year]
    )
    const nextNum = (countResult.rows[0].cnt + 1).toString().padStart(4, '0')
    const reference = `M-${year}-${nextNum}`

    // Create mission
    const missionResult = await query(
      `INSERT INTO mission (workspace_id, lot_id, created_by, reference, date_planifiee,
        heure_debut, heure_fin, statut, statut_rdv, avec_inventaire, type_bail, commentaire)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'planifiee','a_confirmer',$8,$9,$10) RETURNING *`,
      [workspaceId, d.lot_id, userId, reference, d.date_planifiee,
       d.heure_debut ?? null, d.heure_fin ?? null,
       d.avec_inventaire, d.type_bail ?? null, d.commentaire ?? null]
    )
    const mission = missionResult.rows[0]

    // Helper: create EDL + link locataires
    const createEdl = async (
      type: 'edl' | 'inventaire',
      sens: 'entree' | 'sortie',
      locataires: Array<{ tiers_id: string; role_locataire: string }>
    ) => {
      const edlResult = await query(
        `INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, type, sens, statut)
         VALUES ($1,$2,$3,$4,$5,'brouillon') RETURNING id`,
        [workspaceId, mission.id, d.lot_id, type, sens]
      )
      const edlId = edlResult.rows[0].id

      for (const loc of locataires) {
        await query(
          `INSERT INTO edl_locataire (edl_id, tiers_id, role_locataire)
           VALUES ($1,$2,$3)`,
          [edlId, loc.tiers_id, loc.role_locataire]
        )
      }
      return edlId
    }

    // Determine which EDLs to create based on sens
    const sensEntree = d.sens === 'entree' || d.sens === 'entree_sortie'
    const sensSortie = d.sens === 'sortie' || d.sens === 'entree_sortie'

    const locEntrants = d.locataires.filter((l: { role_locataire: string }) => l.role_locataire === 'entrant')
    const locSortants = d.locataires.filter((l: { role_locataire: string }) => l.role_locataire === 'sortant')

    // Entree EDLs
    if (sensEntree) {
      if (d.type_bail === 'individuel' && locEntrants.length > 1) {
        // Bail individuel + colocation: 1 EDL per locataire
        for (const loc of locEntrants) {
          await createEdl('edl', 'entree', [loc])
          if (d.avec_inventaire) {
            await createEdl('inventaire', 'entree', [loc])
          }
        }
      } else {
        // Bail collectif or single locataire: 1 EDL + N locataires
        await createEdl('edl', 'entree', locEntrants)
        if (d.avec_inventaire) {
          await createEdl('inventaire', 'entree', locEntrants)
        }
      }
    }

    // Sortie EDLs
    if (sensSortie) {
      if (d.type_bail === 'individuel' && locSortants.length > 1) {
        for (const loc of locSortants) {
          await createEdl('edl', 'sortie', [loc])
          if (d.avec_inventaire) {
            await createEdl('inventaire', 'sortie', [loc])
          }
        }
      } else {
        await createEdl('edl', 'sortie', locSortants)
        if (d.avec_inventaire) {
          await createEdl('inventaire', 'sortie', locSortants)
        }
      }
    }

    // Assign technician if provided
    if (d.technicien_id) {
      // Verify user is a technicien in this workspace
      const techCheck = await query(
        `SELECT wu.id FROM workspace_user wu
         WHERE wu.user_id = $1 AND wu.workspace_id = $2 AND wu.role = 'technicien'`,
        [d.technicien_id, workspaceId]
      )
      if (techCheck.rows.length === 0) {
        throw new AppError('Utilisateur non technicien dans ce workspace', 'INVALID_TECHNICIAN', 400)
      }

      await query(
        `INSERT INTO mission_technicien (mission_id, user_id, est_principal, statut_invitation)
         VALUES ($1, $2, true, 'en_attente')`,
        [mission.id, d.technicien_id]
      )
    }

    // Dispatch mission.creee webhook
    setImmediate(() => dispatchWebhook(workspaceId, 'mission.creee', {
      mission_id: mission.id,
      reference: mission.reference,
      lot_id: mission.lot_id,
      statut: mission.statut,
    }))

    sendSuccess(res, mission, 201)
  } catch (error) {
    sendError(res, error)
  }
})

// ── PATCH /api/missions/:id — Update mission ──
router.patch('/:id', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    // Fetch current mission
    const current = await query(
      `SELECT id, statut FROM mission WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (current.rows.length === 0) throw new NotFoundError('Mission')

    const mission = current.rows[0]

    // If terminated, only commentaire is editable
    if (mission.statut === 'terminee') {
      const nonCommentFields = Object.keys(req.body).filter(k => k !== 'commentaire')
      if (nonCommentFields.length > 0) {
        throw new AppError(
          'Mission terminee — seul le commentaire est modifiable',
          'MISSION_LOCKED',
          409
        )
      }
    }

    const allowedFields = ['date_planifiee', 'heure_debut', 'heure_fin', 'statut_rdv', 'commentaire']
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

    fields.push(`updated_at = now()`)
    values.push(req.params.id, workspaceId)

    const result = await query(
      `UPDATE mission SET ${fields.join(', ')} WHERE id = $${idx++} AND workspace_id = $${idx} RETURNING *`,
      values
    )

    if (result.rows.length === 0) throw new NotFoundError('Mission')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// ── POST /api/missions/:id/cancel — Cancel mission ──
const cancelSchema = z.object({
  motif: z.string().min(1, 'Le motif est obligatoire'),
})

router.post('/:id/cancel', requireRole('admin', 'gestionnaire', 'technicien'), validate(cancelSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const role = req.user!.role

    // Fetch current mission
    const current = await query(
      `SELECT id, statut, date_planifiee FROM mission WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (current.rows.length === 0) throw new NotFoundError('Mission')

    const mission = current.rows[0]

    if (mission.statut === 'terminee') {
      throw new AppError(
        'Impossible d\'annuler une mission terminee — documents legaux immuables',
        'MISSION_LOCKED',
        409
      )
    }

    if (mission.statut === 'annulee') {
      throw new AppError('Mission deja annulee', 'ALREADY_CANCELLED', 409)
    }

    // Technicien: must cancel at least 48h before
    if (role === 'technicien') {
      const missionDate = new Date(mission.date_planifiee)
      const cutoff = new Date(Date.now() + 48 * 60 * 60 * 1000)
      if (missionDate <= cutoff) {
        throw new AppError(
          'Un technicien ne peut annuler que si la mission est dans plus de 48h',
          'CANCEL_TOO_LATE',
          403
        )
      }
    }

    // Cancel mission
    const result = await query(
      `UPDATE mission SET statut = 'annulee', motif_annulation = $1, updated_at = now()
       WHERE id = $2 AND workspace_id = $3 RETURNING *`,
      [req.body.motif, req.params.id, workspaceId]
    )

    // Set all linked brouillon EDLs to infructueux
    await query(
      `UPDATE edl_inventaire SET statut = 'infructueux', updated_at = now()
       WHERE mission_id = $1 AND statut = 'brouillon'`,
      [req.params.id]
    )

    // Dispatch mission.annulee webhook
    dispatchWebhook(workspaceId, 'mission.annulee', {
      mission_id: req.params.id,
      reference: result.rows[0].reference,
      motif: req.body.motif,
    })

    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// ── POST /api/missions/:id/technician — Assign technician ──
router.post('/:id/technician', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { user_id } = req.body

    if (!user_id) {
      throw new AppError('user_id requis', 'VALIDATION_ERROR', 400)
    }

    // Verify mission exists
    const missionCheck = await query(
      `SELECT id, statut FROM mission WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (missionCheck.rows.length === 0) throw new NotFoundError('Mission')

    if (missionCheck.rows[0].statut === 'terminee') {
      throw new AppError('Mission terminee — technicien non modifiable', 'MISSION_LOCKED', 409)
    }

    if (missionCheck.rows[0].statut === 'annulee') {
      throw new AppError('Mission annulee — assignation impossible', 'MISSION_CANCELLED', 409)
    }

    // Verify user is technicien in workspace
    const techCheck = await query(
      `SELECT wu.id FROM workspace_user wu
       WHERE wu.user_id = $1 AND wu.workspace_id = $2 AND wu.role = 'technicien'`,
      [user_id, workspaceId]
    )
    if (techCheck.rows.length === 0) {
      throw new AppError('Utilisateur non technicien dans ce workspace', 'INVALID_TECHNICIAN', 400)
    }

    // Insert or update
    const result = await query(
      `INSERT INTO mission_technicien (mission_id, user_id, est_principal, statut_invitation)
       VALUES ($1, $2, true, 'en_attente')
       ON CONFLICT (mission_id, user_id) DO UPDATE SET est_principal = true, statut_invitation = 'en_attente', updated_at = now()
       RETURNING *`,
      [req.params.id, user_id]
    )

    sendSuccess(res, result.rows[0], 201)
  } catch (error) {
    sendError(res, error)
  }
})

// ── PATCH /api/missions/:id/technician — Update invitation status ──
const updateInvitationSchema = z.object({
  statut_invitation: z.enum(['accepte', 'refuse']),
})

router.patch('/:id/technician', validate(updateInvitationSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const userId = req.user!.userId
    const { statut_invitation } = req.body

    // Update the technician's invitation for this mission
    const result = await query(
      `UPDATE mission_technicien SET statut_invitation = $1, updated_at = now()
       WHERE mission_id = $2 AND user_id = $3
       RETURNING *`,
      [statut_invitation, req.params.id, userId]
    )

    if (result.rows.length === 0) throw new NotFoundError('Assignation technicien')

    // If accepted and mission is planifiee, transition to assignee
    if (statut_invitation === 'accepte') {
      await query(
        `UPDATE mission SET statut = 'assignee', updated_at = now()
         WHERE id = $1 AND workspace_id = $2 AND statut = 'planifiee'`,
        [req.params.id, workspaceId]
      )
    }

    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// ── GET /api/missions/:id/cles — List keys for mission ──
router.get('/:id/cles', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    // Verify mission exists in workspace
    const missionCheck = await query(
      `SELECT id FROM mission WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (missionCheck.rows.length === 0) throw new NotFoundError('Mission')

    const result = await query(
      `SELECT cm.*,
        json_build_object(
          'id', ei.id, 'type', ei.type, 'sens', ei.sens, 'statut', ei.statut
        ) as edl
      FROM cle_mission cm
      JOIN edl_inventaire ei ON ei.id = cm.edl_id
      WHERE ei.mission_id = $1
      ORDER BY cm.created_at ASC`,
      [req.params.id]
    )

    sendSuccess(res, result.rows)
  } catch (error) {
    sendError(res, error)
  }
})

export default router
