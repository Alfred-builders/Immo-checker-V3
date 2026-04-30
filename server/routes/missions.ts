import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../db/index.js'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendSuccess, sendList, sendError } from '../utils/response.js'
import { NotFoundError, AppError } from '../utils/errors.js'
import { dispatchWebhook } from '../services/webhook-service.js'
import { publishToRoles } from '../services/notification-service.js'
import { formatDateFr } from '../utils/date-format.js'
import {
  notifyMissionPlanifiee,
  notifyCreneauModifie,
  notifyTechnicienAssigne,
} from '../services/mission-mailer.js'

const router = Router()
router.use(verifyToken)

// ── GET /api/missions/stats — Stat cards ──
router.get('/stats', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const userId = req.user!.userId
    const isTechnicien = req.user!.role === 'technicien'
    const techScope = isTechnicien
      ? `AND EXISTS (SELECT 1 FROM mission_technicien mt_scope WHERE mt_scope.mission_id = m.id AND mt_scope.user_id = $2)`
      : ''
    const params: unknown[] = [workspaceId]
    if (isTechnicien) params.push(userId)
    const result = await query(
      `SELECT
        count(*) FILTER (WHERE m.statut NOT IN ('annulee'))::int as total,
        count(*) FILTER (WHERE m.date_planifiee = CURRENT_DATE AND m.statut NOT IN ('annulee'))::int as today,
        count(*) FILTER (
          WHERE m.statut = 'planifiee'
          AND (
            m.date_planifiee IS NULL
            OR NOT EXISTS (SELECT 1 FROM mission_technicien mt2 WHERE mt2.mission_id = m.id)
            OR EXISTS (SELECT 1 FROM mission_technicien mt2 WHERE mt2.mission_id = m.id AND mt2.statut_invitation != 'accepte')
          )
        )::int as pending,
        count(*) FILTER (WHERE m.date_planifiee > CURRENT_DATE AND m.statut = 'planifiee')::int as upcoming
      FROM mission m
      WHERE m.workspace_id = $1 AND m.est_archive = false ${techScope}`,
      params
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
    const userId = req.user!.userId
    const isTechnicien = req.user!.role === 'technicien'
    const {
      search, statut, statut_affichage, technicien_id, date_from, date_to,
      pending_actions, lot_id, batiment_id, cursor, limit: rawLimit
    } = req.query
    const limit = Math.min(parseInt(rawLimit as string) || 25, 100)

    let where = `m.workspace_id = $1 AND m.est_archive = false`
    const params: unknown[] = [workspaceId]
    let paramIndex = 2

    // Technicien scoping — only see missions they are assigned to
    if (isTechnicien) {
      where += ` AND EXISTS (SELECT 1 FROM mission_technicien mt_scope WHERE mt_scope.mission_id = m.id AND mt_scope.user_id = $${paramIndex})`
      params.push(userId)
      paramIndex++
    }

    // Filtre statut. 2 modes mutuellement exclusifs :
    //   1. statut (4 valeurs brutes : planifiee/terminee/infructueuse/annulee) — usage legacy + intégrations
    //   2. statut_affichage (5 valeurs UI : a_planifier/planifie/finalisee/infructueuse/annulee) — filtre tableau
    //   3. par défaut : exclut annulee
    // Cadrage Flat Checker du 28/04/2026 — modèle de statuts mission.
    if (statut) {
      where += ` AND m.statut = $${paramIndex}`
      params.push(statut)
      paramIndex++
    } else if (statut_affichage === 'a_planifier') {
      where += ` AND m.statut = 'planifiee' AND m.date_planifiee IS NULL`
    } else if (statut_affichage === 'planifie') {
      where += ` AND m.statut = 'planifiee' AND m.date_planifiee IS NOT NULL`
    } else if (statut_affichage === 'finalisee') {
      where += ` AND m.statut = 'terminee'`
    } else if (statut_affichage === 'infructueuse') {
      where += ` AND m.statut = 'infructueuse'`
    } else if (statut_affichage === 'annulee') {
      where += ` AND m.statut = 'annulee'`
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

    if (batiment_id) {
      where += ` AND EXISTS (SELECT 1 FROM lot l3 WHERE l3.id = m.lot_id AND l3.batiment_id = $${paramIndex})`
      params.push(batiment_id)
      paramIndex++
    }

    if (pending_actions === 'true') {
      where += ` AND m.statut = 'planifiee' AND (
        m.date_planifiee IS NULL
        OR NOT EXISTS (SELECT 1 FROM mission_technicien mt2 WHERE mt2.mission_id = m.id)
        OR EXISTS (SELECT 1 FROM mission_technicien mt2 WHERE mt2.mission_id = m.id AND mt2.statut_invitation != 'accepte')
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
        m.id, m.reference, m.date_planifiee::date::text as date_planifiee, m.heure_debut, m.heure_fin,
        m.statut, m.avec_inventaire, m.type_bail,
        m.commentaire, m.motif_annulation, m.motif_infructueux, m.created_at,
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
          'user_id', u.id, 'nom', u.nom, 'prenom', u.prenom, 'avatar_url', u.avatar_url,
          'statut_invitation', mt.statut_invitation, 'est_principal', mt.est_principal
        )) FROM mission_technicien mt
         JOIN utilisateur u ON u.id = mt.user_id
         WHERE mt.mission_id = m.id) as techniciens,
        (SELECT json_agg(json_build_object(
          'id', ei.id, 'type', ei.type, 'sens', ei.sens, 'statut', ei.statut
        )) FROM edl_inventaire ei WHERE ei.mission_id = m.id) as edls,
        -- Stakeholders for list columns
        (SELECT COALESCE(tp.prenom || ' ' || tp.nom, tp.raison_sociale, tp.nom)
         FROM lot_proprietaire lp JOIN tiers tp ON tp.id = lp.tiers_id
         WHERE lp.lot_id = l.id AND lp.est_principal = true LIMIT 1) as proprietaire_nom,
        (SELECT json_agg(DISTINCT COALESCE(t2.prenom || ' ' || t2.nom, t2.raison_sociale, t2.nom))
         FROM edl_locataire el
         JOIN edl_inventaire ei2 ON ei2.id = el.edl_id
         JOIN tiers t2 ON t2.id = el.tiers_id
         WHERE ei2.mission_id = m.id) as locataires_noms,
        EXISTS (SELECT 1 FROM edl_inventaire ei3
                WHERE ei3.mission_id = m.id AND ei3.statut = 'signe') as has_signed_document
      FROM mission m
      JOIN lot l ON l.id = m.lot_id
      WHERE ${where}
      ORDER BY m.date_planifiee DESC NULLS FIRST, m.reference DESC
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
      const hasPendingActions = row.statut === 'planifiee' && (
        !row.date_planifiee ||
        techniciens.length === 0 ||
        techniciens.some((t: any) => t.statut_invitation !== 'accepte')
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
        avec_inventaire: row.avec_inventaire,
        type_bail: row.type_bail,
        commentaire: row.commentaire,
        motif_annulation: row.motif_annulation,
        motif_infructueux: row.motif_infructueux,
        technicien: primaryTech ? { user_id: primaryTech.user_id, nom: primaryTech.nom, prenom: primaryTech.prenom, avatar_url: primaryTech.avatar_url ?? null, statut_invitation: primaryTech.statut_invitation } : null,
        edl_types: edlTypes,
        has_pending_actions: hasPendingActions,
        proprietaire_nom: row.proprietaire_nom ?? null,
        locataires_noms: row.locataires_noms ?? [],
        has_signed_document: !!row.has_signed_document,
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
    const userId = req.user!.userId
    const isTechnicien = req.user!.role === 'technicien'

    // Technicien scoping — 404 if they are not assigned to this mission
    if (isTechnicien) {
      const scope = await query(
        `SELECT 1 FROM mission_technicien WHERE mission_id = $1 AND user_id = $2`,
        [req.params.id, userId]
      )
      if (scope.rows.length === 0) throw new NotFoundError('Mission')
    }

    const result = await query(
      `SELECT m.*, m.date_planifiee::date::text as date_planifiee,
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
          'email', u.email, 'avatar_url', u.avatar_url,
          'statut_invitation', mt.statut_invitation,
          'est_principal', mt.est_principal,
          'assigned_at', mt.created_at, 'invitation_updated_at', mt.updated_at
        )) FROM mission_technicien mt JOIN utilisateur u ON u.id = mt.user_id WHERE mt.mission_id = m.id) as techniciens,
        -- EDLs with their locataires
        (SELECT json_agg(json_build_object(
          'id', ei.id, 'type', ei.type, 'sens', ei.sens, 'statut', ei.statut,
          'date_realisation', ei.date_realisation, 'date_signature', ei.date_signature,
          'code_acces', ei.code_acces, 'commentaire_general', ei.commentaire_general,
          'pdf_url', ei.pdf_url, 'web_url', ei.web_url,
          'pdf_url_legal', ei.pdf_url_legal, 'web_url_legal', ei.web_url_legal,
          'created_at', ei.created_at,
          'locataires', (
            SELECT json_agg(json_build_object(
              'tiers_id', t2.id, 'nom', t2.nom, 'prenom', t2.prenom,
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
    const hasPendingActions = row.statut === 'planifiee' && (
      !row.date_planifiee ||
      techniciens.length === 0 ||
      techniciens.some((t: any) => t.statut_invitation !== 'accepte')
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
      technicien: primaryTech ? { user_id: primaryTech.user_id, nom: primaryTech.nom, prenom: primaryTech.prenom, avatar_url: primaryTech.avatar_url ?? null, statut_invitation: primaryTech.statut_invitation } : null,
      edl_types: edlTypes,
      has_pending_actions: hasPendingActions,
      lot: { ...row.lot, batiment: row.batiment, adresse: row.adresse },
      techniciens,
      proprietaires: row.proprietaires ?? [],
      edls: edls.map((e: any) => ({ ...e, locataires: e.locataires ?? [], url_pdf: e.pdf_url || null, url_web: e.web_url || null, url_pdf_legal: e.pdf_url_legal || null, url_web_legal: e.web_url_legal || null })),
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
  date_planifiee: z.string().min(1).optional(), // ISO date YYYY-MM-DD — null = mission "À planifier"
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
        heure_debut, heure_fin, statut, avec_inventaire, type_bail, commentaire)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'planifiee',$8,$9,$10) RETURNING *`,
      [workspaceId, d.lot_id, userId, reference, d.date_planifiee ?? null,
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

    // In-app notification — admin + gestionnaires (excl. créateur)
    setImmediate(() => publishToRoles(workspaceId, ['admin', 'gestionnaire'], {
      type: 'mission_created',
      titre: mission.date_planifiee ? 'Nouvelle mission planifiée' : 'Nouvelle mission à planifier',
      message: mission.date_planifiee
        ? `${mission.reference} planifiée le ${formatDateFr(mission.date_planifiee)}`
        : `${mission.reference} créée — date à définir`,
      lien: `/app/missions/${mission.id}`,
    }, userId))

    // Mails transactionnels (Cadrage FC §6) — fire-and-forget
    if (mission.date_planifiee) {
      // Confirmation au locataire (la mission démarre directement en "Planifié")
      setImmediate(() => notifyMissionPlanifiee(mission.id))
    }
    if (d.technicien_id) {
      // Invitation au tech. isDeferred=false car simultané avec la création.
      setImmediate(() => notifyTechnicienAssigne(mission.id, { isDeferred: false }))
    }

    sendSuccess(res, mission, 201)
  } catch (error) {
    sendError(res, error)
  }
})

// ── PATCH /api/missions/:id — Update mission ──
router.patch('/:id', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    // Fetch current mission (avec snapshot du créneau pour mail "Modification")
    const current = await query(
      `SELECT id, statut, date_planifiee::date::text as date_planifiee,
        heure_debut, heure_fin
       FROM mission WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (current.rows.length === 0) throw new NotFoundError('Mission')

    const mission = current.rows[0]
    const oldSnapshot = {
      date_planifiee: mission.date_planifiee as string | null,
      heure_debut: mission.heure_debut as string | null,
      heure_fin: mission.heure_fin as string | null,
    }

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

    const allowedFields = ['date_planifiee', 'heure_debut', 'heure_fin', 'commentaire']
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

    // Auto-réinvitation : si la planification (date/heures) change, l'invitation
    // technicien repasse automatiquement à "Invité" — Cadrage FC du 28/04/2026.
    // Toute acceptation antérieure n'est plus valide pour un nouveau créneau.
    const schedulingFields = ['date_planifiee', 'heure_debut', 'heure_fin']
    const schedulingChanged = schedulingFields.some(f => req.body[f] !== undefined)
    if (schedulingChanged) {
      await query(
        `UPDATE mission_technicien SET statut_invitation = 'en_attente', updated_at = now()
         WHERE mission_id = $1 AND statut_invitation IN ('accepte', 'en_attente')`,
        [req.params.id]
      )
    }

    // Mails transactionnels (Cadrage FC §6) — fire-and-forget
    if (schedulingChanged) {
      const wasUnplanned = !oldSnapshot.date_planifiee
      const isNowPlanned = result.rows[0].date_planifiee != null
      if (wasUnplanned && isNowPlanned) {
        // Passage de "À planifier" à "Planifié" : confirmation locataire.
        setImmediate(() => notifyMissionPlanifiee(req.params.id))
      } else if (!wasUnplanned && isNowPlanned) {
        // Modification d'un créneau existant : notif locataire + tech.
        setImmediate(() => notifyCreneauModifie(req.params.id, oldSnapshot))
      }
    }

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

    // Cancel mission (annulee_at set pour le feed d'activité — audit Tony §8)
    const result = await query(
      `UPDATE mission SET statut = 'annulee', motif_annulation = $1, annulee_at = now(), updated_at = now()
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

    // In-app notification — admin + gestionnaires (excl. annulateur)
    setImmediate(() => publishToRoles(workspaceId, ['admin', 'gestionnaire'], {
      type: 'mission_cancelled',
      titre: 'Mission annulée',
      message: `${result.rows[0].reference} — ${req.body.motif}`,
      lien: `/app/missions/${req.params.id}`,
    }, req.user!.userId))

    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// ── POST /api/missions/:id/infructueuse — Mark as Infructueuse ──
// Cadrage Flat Checker du 28/04/2026 : tech déplacé mais EDL pas réalisé
// (locataire absent, accès refusé…). Marqué par le tech depuis l'app mobile,
// avec un motif optionnel.
const infructueuseSchema = z.object({
  motif: z.string().optional(),
})

router.post('/:id/infructueuse', requireRole('admin', 'gestionnaire', 'technicien'), validate(infructueuseSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    const current = await query(
      `SELECT id, statut FROM mission WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (current.rows.length === 0) throw new NotFoundError('Mission')

    const mission = current.rows[0]

    if (mission.statut === 'terminee') {
      throw new AppError('Mission déjà finalisée', 'MISSION_LOCKED', 409)
    }
    if (mission.statut === 'annulee') {
      throw new AppError('Mission annulée — impossible de marquer infructueuse', 'MISSION_LOCKED', 409)
    }
    if (mission.statut === 'infructueuse') {
      throw new AppError('Mission déjà infructueuse', 'ALREADY_INFRUCTUEUSE', 409)
    }

    const result = await query(
      `UPDATE mission SET statut = 'infructueuse', motif_infructueux = $1,
         infructueuse_at = now(), updated_at = now()
       WHERE id = $2 AND workspace_id = $3 RETURNING *`,
      [req.body.motif ?? null, req.params.id, workspaceId]
    )

    // Marquer tous les EDL brouillon comme infructueux (cohérence avec /cancel)
    await query(
      `UPDATE edl_inventaire SET statut = 'infructueux', updated_at = now()
       WHERE mission_id = $1 AND statut = 'brouillon'`,
      [req.params.id]
    )

    // Webhook mission.infructueuse
    dispatchWebhook(workspaceId, 'mission.infructueuse', {
      mission_id: req.params.id,
      reference: result.rows[0].reference,
      motif: req.body.motif,
    })

    // In-app notification
    setImmediate(() => publishToRoles(workspaceId, ['admin', 'gestionnaire'], {
      type: 'mission_infructueuse',
      titre: 'Mission infructueuse',
      message: `${result.rows[0].reference}${req.body.motif ? ` — ${req.body.motif}` : ' — motif non précisé'}`,
      lien: `/app/missions/${req.params.id}`,
    }, req.user!.userId))

    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// ── DELETE /api/missions/:id — Soft archive (Tony retours §3) ──
// Archivage uniquement, pas de hard delete (CLAUDE.md §7b interdiction).
// Bloqué si un EDL signé existe (document légal immuable).
router.delete('/:id', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    const current = await query(
      `SELECT id, reference, est_archive FROM mission WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (current.rows.length === 0) throw new NotFoundError('Mission')
    if (current.rows[0].est_archive) {
      throw new AppError('Mission deja archivee', 'ALREADY_ARCHIVED', 409)
    }

    // Block if any signed EDL exists
    const signedEdls = await query(
      `SELECT count(*)::int as cnt FROM edl_inventaire WHERE mission_id = $1 AND statut = 'signe'`,
      [req.params.id]
    )
    if (signedEdls.rows[0].cnt > 0) {
      throw new AppError(
        'Impossible d\'archiver — la mission a au moins un EDL signe (document legal)',
        'MISSION_HAS_SIGNED_EDL',
        409
      )
    }

    await query(
      `UPDATE mission SET est_archive = true, updated_at = now() WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )

    sendSuccess(res, { id: req.params.id, archived: true })
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

    // Verify mission exists. On capture aussi date_planifiee + présence tech
    // pour distinguer assignation simultanée (création) vs différée (mission
    // déjà planifiée, on assigne plus tard).
    const missionCheck = await query(
      `SELECT m.id, m.statut, m.date_planifiee,
        EXISTS (SELECT 1 FROM mission_technicien mt WHERE mt.mission_id = m.id) AS had_tech
       FROM mission m
       WHERE m.id = $1 AND m.workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (missionCheck.rows.length === 0) throw new NotFoundError('Mission')

    if (missionCheck.rows[0].statut === 'terminee') {
      throw new AppError('Mission terminee — technicien non modifiable', 'MISSION_LOCKED', 409)
    }

    if (missionCheck.rows[0].statut === 'annulee') {
      throw new AppError('Mission annulee — assignation impossible', 'MISSION_CANCELLED', 409)
    }

    const isDeferred = !!missionCheck.rows[0].date_planifiee && !missionCheck.rows[0].had_tech

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

    // Mails transactionnels : invitation tech + (si différée) coordonnées
    // tech au locataire — Cadrage FC §6.
    setImmediate(() => notifyTechnicienAssigne(req.params.id, { isDeferred }))

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
    const role = req.user!.role
    const { statut_invitation } = req.body

    // Vérifier que la mission existe et appartient au workspace
    const missionCheck = await query(
      `SELECT id FROM mission WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (missionCheck.rows.length === 0) throw new NotFoundError('Mission')

    // Deux cas :
    //   1. Technicien qui accepte/refuse sa propre invitation → on filtre par son user_id
    //   2. Admin/gestionnaire qui confirme oralement (téléphone, WhatsApp…) → on met à
    //      jour le technicien principal de la mission. Cf ManualInvitationActions (drawer).
    const isSelfAction = role === 'technicien'
    let sql: string
    let params: unknown[]

    if (isSelfAction) {
      sql = `UPDATE mission_technicien SET statut_invitation = $1, updated_at = now()
             WHERE mission_id = $2 AND user_id = $3 RETURNING *`
      params = [statut_invitation, req.params.id, userId]
    } else {
      // Admin/gestionnaire : cible la ligne principale (ou la seule ligne si non-principal).
      sql = `UPDATE mission_technicien SET statut_invitation = $1, updated_at = now()
             WHERE id = (
               SELECT id FROM mission_technicien
               WHERE mission_id = $2
               ORDER BY est_principal DESC, created_at ASC
               LIMIT 1
             ) RETURNING *`
      params = [statut_invitation, req.params.id]
    }

    const result = await query(sql, params)
    if (result.rows.length === 0) throw new NotFoundError('Assignation technicien')

    // La mission reste en 'planifiee' jusqu'à auto-terminaison (tous EDL signés).
    // L'acceptation du technicien vit dans statut_invitation, pas dans mission.statut.
    if (statut_invitation === 'accepte') {
      const techIdForWebhook = result.rows[0].user_id as string
      setImmediate(() => dispatchWebhook(workspaceId, 'mission.assignee', {
        mission_id: req.params.id,
        technicien_id: techIdForWebhook,
      }))
    }

    // In-app notification — admin + gestionnaires
    setImmediate(async () => {
      const info = await query(
        `SELECT m.reference, u.prenom, u.nom FROM mission m
         JOIN utilisateur u ON u.id = $1
         WHERE m.id = $2`,
        [result.rows[0].user_id, req.params.id]
      )
      const row = info.rows[0]
      if (!row) return
      const techName = `${row.prenom || ''} ${row.nom || ''}`.trim() || 'Le technicien'
      await publishToRoles(workspaceId, ['admin', 'gestionnaire'], {
        type: statut_invitation === 'accepte' ? 'invitation_accepted' : 'technicien_refused',
        titre: statut_invitation === 'accepte' ? 'Invitation acceptée' : 'Invitation refusée',
        message: statut_invitation === 'accepte'
          ? `${techName} a accepté la mission ${row.reference}`
          : `${techName} a refusé la mission ${row.reference}`,
        lien: `/app/missions/${req.params.id}`,
      }, isSelfAction ? userId : undefined)
    })

    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// ── POST /api/missions/:id/edl — Add EDL to existing mission ──
router.post('/:id/edl', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { type, sens, locataires } = req.body

    if (!sens || !['entree', 'sortie'].includes(sens)) {
      throw new AppError('Le champ sens est obligatoire (entree | sortie)', 'VALIDATION_ERROR', 400)
    }

    const missionCheck = await query(
      `SELECT id, statut, lot_id FROM mission WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (missionCheck.rows.length === 0) throw new NotFoundError('Mission')
    const mission = missionCheck.rows[0]

    if (mission.statut === 'terminee') {
      throw new AppError('Mission verrouillée — impossible d\'ajouter un EDL', 'MISSION_LOCKED', 409)
    }
    if (mission.statut === 'annulee') {
      throw new AppError('Mission annulée — impossible d\'ajouter un EDL', 'MISSION_CANCELLED', 409)
    }

    const edlResult = await query(
      `INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, type, sens, statut)
       VALUES ($1, $2, $3, $4, $5, 'brouillon')
       RETURNING *`,
      [workspaceId, req.params.id, mission.lot_id, type || 'edl', sens]
    )
    const edl = edlResult.rows[0]

    if (Array.isArray(locataires) && locataires.length > 0) {
      for (const loc of locataires) {
        await query(
          `INSERT INTO edl_locataire (edl_id, tiers_id, role_locataire) VALUES ($1, $2, $3)`,
          [edl.id, loc.tiers_id, loc.role_locataire || 'entrant']
        )
      }
    }

    sendSuccess(res, edl, 201)
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
