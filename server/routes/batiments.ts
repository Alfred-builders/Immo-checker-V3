import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../db/index.js'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendSuccess, sendList, sendError } from '../utils/response.js'
import { NotFoundError, AppError } from '../utils/errors.js'

const router = Router()
router.use(verifyToken)

// GET /api/batiments — List buildings with search, filters, pagination
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { search, type, archived, cursor, limit: rawLimit } = req.query
    const limit = Math.min(parseInt(rawLimit as string) || 25, 100)

    let where = `b.workspace_id = $1 AND b.est_archive = $2`
    const params: unknown[] = [workspaceId, archived === 'true']
    let paramIndex = 3

    if (search) {
      where += ` AND (
        b.designation ILIKE $${paramIndex}
        OR EXISTS (SELECT 1 FROM adresse_batiment ab WHERE ab.batiment_id = b.id AND (ab.rue ILIKE $${paramIndex} OR ab.ville ILIKE $${paramIndex} OR ab.code_postal ILIKE $${paramIndex}))
        OR EXISTS (SELECT 1 FROM lot l WHERE l.batiment_id = b.id AND (l.designation ILIKE $${paramIndex} OR l.reference_interne ILIKE $${paramIndex}))
      )`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (type) {
      where += ` AND b.type = $${paramIndex}`
      params.push(type)
      paramIndex++
    }

    if (cursor) {
      where += ` AND b.id > $${paramIndex}`
      params.push(cursor)
      paramIndex++
    }

    const sql = `
      SELECT
        b.id, b.designation, b.type, b.num_batiment, b.nb_etages,
        b.annee_construction, b.commentaire, b.est_archive,
        b.created_at, b.updated_at,
        (SELECT json_build_object(
          'rue', ab.rue, 'complement', ab.complement,
          'code_postal', ab.code_postal, 'ville', ab.ville,
          'latitude', ab.latitude, 'longitude', ab.longitude
        ) FROM adresse_batiment ab WHERE ab.batiment_id = b.id AND ab.type = 'principale' LIMIT 1) as adresse_principale,
        (SELECT count(*) FROM lot l WHERE l.batiment_id = b.id AND l.est_archive = false)::int as nb_lots,
        (SELECT max(m.date_planifiee) FROM mission m JOIN lot l ON l.id = m.lot_id WHERE l.batiment_id = b.id AND m.statut = 'terminee') as derniere_mission,
        (SELECT count(*) FROM mission m JOIN lot l ON l.id = m.lot_id WHERE l.batiment_id = b.id AND m.statut IN ('planifiee', 'assignee') AND m.date_planifiee >= CURRENT_DATE)::int as missions_a_venir
      FROM batiment b
      WHERE ${where}
      ORDER BY b.designation ASC
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

// GET /api/batiments/:id — Building detail
router.get('/:id', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const result = await query(
      `SELECT b.*,
        (SELECT json_agg(json_build_object(
          'id', ab.id, 'type', ab.type, 'rue', ab.rue, 'complement', ab.complement,
          'code_postal', ab.code_postal, 'ville', ab.ville,
          'latitude', ab.latitude, 'longitude', ab.longitude, 'ordre', ab.ordre
        ) ORDER BY ab.ordre) FROM adresse_batiment ab WHERE ab.batiment_id = b.id) as adresses,
        (SELECT count(*) FROM lot l WHERE l.batiment_id = b.id AND l.est_archive = false)::int as nb_lots
      FROM batiment b
      WHERE b.id = $1 AND b.workspace_id = $2`,
      [req.params.id, workspaceId]
    )

    if (result.rows.length === 0) throw new NotFoundError('Bâtiment')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/batiments/:id/lots — Lots for a building (drill-down)
router.get('/:id/lots', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const result = await query(
      `SELECT l.id, l.designation, l.reference_interne, l.type_bien, l.etage,
        l.emplacement_palier, l.surface, l.meuble, l.nb_pieces, l.est_archive,
        (SELECT json_agg(json_build_object('id', t.id, 'nom', t.nom, 'prenom', t.prenom, 'type_personne', t.type_personne, 'est_principal', lp.est_principal))
         FROM lot_proprietaire lp JOIN tiers t ON t.id = lp.tiers_id WHERE lp.lot_id = l.id) as proprietaires,
        (SELECT json_build_object('id', t.id, 'nom', t.nom, 'prenom', t.prenom, 'raison_sociale', t.raison_sociale)
         FROM tiers t WHERE t.id = l.mandataire_id) as mandataire,
        (SELECT max(m.date_planifiee) FROM mission m WHERE m.lot_id = l.id AND m.statut = 'terminee') as derniere_mission
      FROM lot l
      WHERE l.batiment_id = $1 AND l.workspace_id = $2 AND l.est_archive = false
      ORDER BY l.etage ASC NULLS LAST, l.designation ASC`,
      [req.params.id, workspaceId]
    )

    sendSuccess(res, result.rows)
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/batiments — Create building
const createBatimentSchema = z.object({
  designation: z.string().min(1).max(255),
  type: z.enum(['immeuble', 'maison', 'local_commercial', 'mixte', 'autre']),
  num_batiment: z.string().max(50).optional(),
  nb_etages: z.number().int().optional(),
  annee_construction: z.number().int().optional(),
  commentaire: z.string().optional(),
  adresses: z.array(z.object({
    type: z.enum(['principale', 'secondaire']),
    rue: z.string().min(1),
    complement: z.string().optional(),
    code_postal: z.string().min(1),
    ville: z.string().min(1),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  })).min(1),
})

router.post('/', requireRole('admin', 'gestionnaire'), validate(createBatimentSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { adresses, ...batimentData } = req.body

    const batResult = await query(
      `INSERT INTO batiment (workspace_id, designation, type, num_batiment, nb_etages, annee_construction, commentaire)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [workspaceId, batimentData.designation, batimentData.type, batimentData.num_batiment ?? null,
       batimentData.nb_etages ?? null, batimentData.annee_construction ?? null, batimentData.commentaire ?? null]
    )
    const batiment = batResult.rows[0]

    for (let i = 0; i < adresses.length; i++) {
      const a = adresses[i]
      await query(
        `INSERT INTO adresse_batiment (batiment_id, type, rue, complement, code_postal, ville, latitude, longitude, ordre)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [batiment.id, a.type, a.rue, a.complement ?? null, a.code_postal, a.ville,
         a.latitude ?? null, a.longitude ?? null, i + 1]
      )
    }

    sendSuccess(res, batiment, 201)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/batiments/:id — Update building
router.patch('/:id', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { designation, type, num_batiment, nb_etages, annee_construction, commentaire, est_archive } = req.body

    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    const addField = (name: string, value: unknown) => {
      if (value !== undefined) {
        fields.push(`${name} = $${idx++}`)
        values.push(value)
      }
    }

    addField('designation', designation)
    addField('type', type)
    addField('num_batiment', num_batiment)
    addField('nb_etages', nb_etages)
    addField('annee_construction', annee_construction)
    addField('commentaire', commentaire)
    addField('est_archive', est_archive)

    if (fields.length === 0) {
      sendSuccess(res, { message: 'Aucune modification' })
      return
    }

    fields.push(`updated_at = now()`)
    values.push(req.params.id, workspaceId)

    const result = await query(
      `UPDATE batiment SET ${fields.join(', ')} WHERE id = $${idx++} AND workspace_id = $${idx} RETURNING *`,
      values
    )

    if (result.rows.length === 0) throw new NotFoundError('Bâtiment')

    // If archiving a building, archive all its non-archived lots
    if (est_archive === true) {
      // Check for active missions first
      const activeMissions = await query(
        `SELECT count(*) as cnt FROM mission m JOIN lot l ON l.id = m.lot_id
         WHERE l.batiment_id = $1 AND m.workspace_id = $2 AND m.statut IN ('planifiee', 'assignee')`,
        [req.params.id, workspaceId]
      )
      if (parseInt(activeMissions.rows[0].cnt) > 0) {
        throw new AppError(
          `Impossible d'archiver — ${activeMissions.rows[0].cnt} mission(s) en cours`,
          'ACTIVE_MISSIONS',
          409
        )
      }
      await query(
        `UPDATE lot SET est_archive = true, updated_at = now() WHERE batiment_id = $1 AND est_archive = false`,
        [req.params.id]
      )
    }

    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// PUT /api/batiments/:id/adresses/:adresseId — Update an address
router.put('/:id/adresses/:adresseId', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const bat = await query(`SELECT id FROM batiment WHERE id = $1 AND workspace_id = $2`, [req.params.id, workspaceId])
    if (bat.rows.length === 0) throw new NotFoundError('Bâtiment')

    const { rue, complement, code_postal, ville, latitude, longitude } = req.body
    const result = await query(
      `UPDATE adresse_batiment SET rue = $1, complement = $2, code_postal = $3, ville = $4, latitude = $5, longitude = $6, updated_at = now()
       WHERE id = $7 AND batiment_id = $8 RETURNING *`,
      [rue, complement ?? null, code_postal, ville, latitude ?? null, longitude ?? null, req.params.adresseId, req.params.id]
    )
    if (result.rows.length === 0) throw new NotFoundError('Adresse')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/batiments/:id/adresses — Add a new address
router.post('/:id/adresses', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const bat = await query(`SELECT id FROM batiment WHERE id = $1 AND workspace_id = $2`, [req.params.id, workspaceId])
    if (bat.rows.length === 0) throw new NotFoundError('Bâtiment')

    const { type, rue, complement, code_postal, ville, latitude, longitude } = req.body
    const maxOrdre = await query(`SELECT COALESCE(MAX(ordre), 0) + 1 as next FROM adresse_batiment WHERE batiment_id = $1`, [req.params.id])

    const result = await query(
      `INSERT INTO adresse_batiment (batiment_id, type, rue, complement, code_postal, ville, latitude, longitude, ordre)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.params.id, type || 'secondaire', rue, complement ?? null, code_postal, ville, latitude ?? null, longitude ?? null, maxOrdre.rows[0].next]
    )
    sendSuccess(res, result.rows[0], 201)
  } catch (error) {
    sendError(res, error)
  }
})

// DELETE /api/batiments/:id/adresses/:adresseId — Remove an address
router.delete('/:id/adresses/:adresseId', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const bat = await query(`SELECT id FROM batiment WHERE id = $1 AND workspace_id = $2`, [req.params.id, workspaceId])
    if (bat.rows.length === 0) throw new NotFoundError('Bâtiment')

    // Don't allow deleting the last address
    const count = await query(`SELECT count(*) as cnt FROM adresse_batiment WHERE batiment_id = $1`, [req.params.id])
    if (parseInt(count.rows[0].cnt) <= 1) {
      throw new AppError('Impossible de supprimer la dernière adresse', 'LAST_ADDRESS', 409)
    }

    await query(`DELETE FROM adresse_batiment WHERE id = $1 AND batiment_id = $2`, [req.params.adresseId, req.params.id])
    sendSuccess(res, { deleted: true })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
