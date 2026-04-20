import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../db/index.js'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendSuccess, sendList, sendError } from '../utils/response.js'
import { NotFoundError, AppError } from '../utils/errors.js'

const router = Router()
router.use(verifyToken)
router.use(requireRole('admin', 'gestionnaire'))

// Enums
const categorieEnum = z.enum([
  'revetement_sol', 'revetement_mur', 'revetement_plafond', 'menuiserie',
  'plomberie', 'electricite', 'chauffage', 'ventilation', 'electromenager',
  'mobilier', 'equipement', 'serrurerie', 'vitrage', 'exterieur', 'divers',
  'structure', 'securite',
])

const contexteEnum = z.enum(['edl', 'inventaire'])

const critereEnum = z.enum(['caracteristiques', 'degradations', 'couleur'])

// GET /api/catalogue-items — List items with filters
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { contexte, categorie, search, parent_only, cursor, limit: rawLimit } = req.query
    const limit = Math.min(parseInt(rawLimit as string) || 50, 100)

    let where = `(ci.workspace_id IS NULL OR ci.workspace_id = $1) AND ci.est_archive = false`
    const params: unknown[] = [workspaceId]
    let paramIndex = 2

    if (contexte) {
      where += ` AND ci.contexte = $${paramIndex}`
      params.push(contexte)
      paramIndex++
    }

    if (categorie) {
      where += ` AND ci.categorie = $${paramIndex}`
      params.push(categorie)
      paramIndex++
    }

    if (search) {
      where += ` AND ci.nom ILIKE $${paramIndex}`
      params.push(`%${search}%`)
      paramIndex++
    }

    // Filter to top-level items only (no sub-items)
    if (parent_only === 'true') {
      where += ` AND ci.parent_item_id IS NULL`
    }

    if (cursor) {
      where += ` AND ci.id > $${paramIndex}`
      params.push(cursor)
      paramIndex++
    }

    const sql = `
      SELECT
        ci.id, ci.workspace_id, ci.nom, ci.categorie, ci.contexte,
        ci.parent_item_id, ci.aide_contextuelle, ci.source,
        ci.qte_par_defaut, ci.ordre_affichage, ci.est_archive,
        ci.created_at, ci.updated_at,
        (SELECT count(*) FROM catalogue_item sub
         WHERE sub.parent_item_id = ci.id AND sub.est_archive = false)::int as nb_sous_items,
        (SELECT count(*) FROM valeur_referentiel vr
         WHERE vr.catalogue_item_id = ci.id)::int as nb_valeurs,
        (SELECT count(*) FROM template_piece_item tpi
         WHERE tpi.catalogue_item_id = ci.id)::int as nb_pieces,
        (SELECT json_agg(json_build_object(
          'id', sub.id, 'nom', sub.nom, 'categorie', sub.categorie,
          'contexte', sub.contexte, 'ordre_affichage', sub.ordre_affichage
        ) ORDER BY sub.ordre_affichage ASC)
         FROM catalogue_item sub
         WHERE sub.parent_item_id = ci.id AND sub.est_archive = false) as sous_items
      FROM catalogue_item ci
      WHERE ${where}
      ORDER BY ci.categorie ASC, ci.ordre_affichage ASC, ci.nom ASC
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

// GET /api/catalogue-items/:id — Detail with valeurs, critere overrides, sub-items
router.get('/:id', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    const result = await query(
      `SELECT ci.*
       FROM catalogue_item ci
       WHERE ci.id = $1 AND (ci.workspace_id IS NULL OR ci.workspace_id = $2)`,
      [req.params.id, workspaceId]
    )

    if (result.rows.length === 0) throw new NotFoundError('Item catalogue')

    // Fetch valeur_referentiel (tags)
    const valeursResult = await query(
      `SELECT vr.id, vr.critere, vr.valeur, vr.source, vr.workspace_id, vr.ordre_affichage, vr.created_at
       FROM valeur_referentiel vr
       WHERE vr.catalogue_item_id = $1
         AND (vr.workspace_id IS NULL OR vr.workspace_id = $2)
       ORDER BY vr.critere ASC, vr.ordre_affichage ASC`,
      [req.params.id, workspaceId]
    )

    // Fetch config_critere_item overrides for this item in current workspace
    const criteresResult = await query(
      `SELECT cci.id, cci.critere, cci.niveau_exigence, cci.created_at
       FROM config_critere_item cci
       WHERE cci.catalogue_item_id = $1 AND cci.workspace_id = $2`,
      [req.params.id, workspaceId]
    )

    // Fetch sub-items
    const sousItemsResult = await query(
      `SELECT ci.id, ci.nom, ci.categorie, ci.contexte, ci.aide_contextuelle,
        ci.source, ci.qte_par_defaut, ci.ordre_affichage, ci.est_archive,
        ci.created_at, ci.updated_at
       FROM catalogue_item ci
       WHERE ci.parent_item_id = $1 AND ci.est_archive = false
         AND (ci.workspace_id IS NULL OR ci.workspace_id = $2)
       ORDER BY ci.ordre_affichage ASC, ci.nom ASC`,
      [req.params.id, workspaceId]
    )

    sendSuccess(res, {
      ...result.rows[0],
      valeurs: valeursResult.rows,
      critere_overrides: criteresResult.rows,
      sous_items: sousItemsResult.rows,
    })
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/catalogue-items — Create item (source='workspace')
const createItemSchema = z.object({
  nom: z.string().min(1).max(255),
  categorie: categorieEnum,
  contexte: contexteEnum,
  parent_item_id: z.string().uuid().optional(),
  aide_contextuelle: z.string().optional(),
  qte_par_defaut: z.number().int().optional(),
  ordre_affichage: z.number().int().optional(),
})

router.post('/', requireRole('admin', 'gestionnaire'), validate(createItemSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { nom, categorie, contexte, parent_item_id, aide_contextuelle, qte_par_defaut, ordre_affichage } = req.body

    // If parent_item_id is provided, verify it exists and check depth (max 2 levels)
    if (parent_item_id) {
      const parentResult = await query(
        `SELECT id, parent_item_id FROM catalogue_item
         WHERE id = $1 AND (workspace_id IS NULL OR workspace_id = $2)`,
        [parent_item_id, workspaceId]
      )
      if (parentResult.rows.length === 0) throw new NotFoundError('Item parent')
      if (parentResult.rows[0].parent_item_id !== null) {
        throw new AppError(
          'Profondeur maximale de sous-items atteinte (max 2 niveaux)',
          'MAX_DEPTH_EXCEEDED',
          422
        )
      }
    }

    const result = await query(
      `INSERT INTO catalogue_item (workspace_id, nom, categorie, contexte, parent_item_id, aide_contextuelle, source, qte_par_defaut, ordre_affichage)
       VALUES ($1, $2, $3, $4, $5, $6, 'workspace', $7, $8) RETURNING *`,
      [workspaceId, nom, categorie, contexte, parent_item_id ?? null,
       aide_contextuelle ?? null, qte_par_defaut ?? 1, ordre_affichage ?? 0]
    )

    sendSuccess(res, result.rows[0], 201)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/catalogue-items/:id — Update (workspace only)
router.patch('/:id', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    // Verify ownership
    const existing = await query(
      `SELECT id, source FROM catalogue_item WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (existing.rows.length === 0) throw new NotFoundError('Item catalogue')
    if (existing.rows[0].source !== 'workspace') {
      throw new AppError(
        'Impossible de modifier un item plateforme',
        'PLATEFORME_READONLY',
        403
      )
    }

    const { nom, categorie, contexte, aide_contextuelle, qte_par_defaut, ordre_affichage } = req.body

    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    const addField = (name: string, value: unknown) => {
      if (value !== undefined) {
        fields.push(`${name} = $${idx++}`)
        values.push(value)
      }
    }

    addField('nom', nom)
    addField('categorie', categorie)
    addField('contexte', contexte)
    addField('aide_contextuelle', aide_contextuelle)
    addField('qte_par_defaut', qte_par_defaut)
    addField('ordre_affichage', ordre_affichage)

    if (fields.length === 0) {
      sendSuccess(res, { message: 'Aucune modification' })
      return
    }

    fields.push(`updated_at = now()`)
    values.push(req.params.id, workspaceId)

    const result = await query(
      `UPDATE catalogue_item SET ${fields.join(', ')} WHERE id = $${idx++} AND workspace_id = $${idx} RETURNING *`,
      values
    )

    if (result.rows.length === 0) throw new NotFoundError('Item catalogue')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/catalogue-items/:id/archive — Archive (workspace only)
router.patch('/:id/archive', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    const existing = await query(
      `SELECT id, source FROM catalogue_item WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (existing.rows.length === 0) throw new NotFoundError('Item catalogue')
    if (existing.rows[0].source !== 'workspace') {
      throw new AppError(
        'Impossible d\'archiver un item plateforme',
        'PLATEFORME_READONLY',
        403
      )
    }

    // Also archive sub-items
    await query(
      `UPDATE catalogue_item SET est_archive = true, updated_at = now()
       WHERE parent_item_id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )

    const result = await query(
      `UPDATE catalogue_item SET est_archive = true, updated_at = now()
       WHERE id = $1 AND workspace_id = $2 RETURNING *`,
      [req.params.id, workspaceId]
    )

    if (result.rows.length === 0) throw new NotFoundError('Item catalogue')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/catalogue-items/:id/valeurs — List valeur_referentiel for item
router.get('/:id/valeurs', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    // Verify item exists and is accessible
    const itemResult = await query(
      `SELECT id FROM catalogue_item
       WHERE id = $1 AND (workspace_id IS NULL OR workspace_id = $2)`,
      [req.params.id, workspaceId]
    )
    if (itemResult.rows.length === 0) throw new NotFoundError('Item catalogue')

    const result = await query(
      `SELECT vr.id, vr.critere, vr.valeur, vr.source, vr.workspace_id,
        vr.ordre_affichage, vr.created_at
       FROM valeur_referentiel vr
       WHERE vr.catalogue_item_id = $1
         AND (vr.workspace_id IS NULL OR vr.workspace_id = $2)
       ORDER BY vr.critere ASC, vr.ordre_affichage ASC`,
      [req.params.id, workspaceId]
    )

    sendSuccess(res, result.rows)
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/catalogue-items/:id/valeurs — Add valeur_referentiel
const createValeurSchema = z.object({
  critere: critereEnum,
  valeur: z.string().min(1).max(255),
  ordre_affichage: z.number().int().optional(),
})

router.post('/:id/valeurs', requireRole('admin', 'gestionnaire'), validate(createValeurSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { critere, valeur, ordre_affichage } = req.body

    // Verify item exists and is accessible
    const itemResult = await query(
      `SELECT id FROM catalogue_item
       WHERE id = $1 AND (workspace_id IS NULL OR workspace_id = $2)`,
      [req.params.id, workspaceId]
    )
    if (itemResult.rows.length === 0) throw new NotFoundError('Item catalogue')

    const result = await query(
      `INSERT INTO valeur_referentiel (catalogue_item_id, critere, valeur, source, workspace_id, ordre_affichage)
       VALUES ($1, $2, $3, 'workspace', $4, $5) RETURNING *`,
      [req.params.id, critere, valeur, workspaceId, ordre_affichage ?? 0]
    )

    sendSuccess(res, result.rows[0], 201)
  } catch (error) {
    sendError(res, error)
  }
})

// DELETE /api/catalogue-items/:itemId/valeurs/:valeurId — Remove valeur_referentiel
router.delete('/:itemId/valeurs/:valeurId', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    // Only workspace-owned valeurs can be deleted
    const result = await query(
      `DELETE FROM valeur_referentiel
       WHERE id = $1 AND catalogue_item_id = $2 AND workspace_id = $3
       RETURNING id`,
      [req.params.valeurId, req.params.itemId, workspaceId]
    )

    if (result.rows.length === 0) {
      // Check if it exists but is a plateforme valeur
      const exists = await query(
        `SELECT id, workspace_id FROM valeur_referentiel
         WHERE id = $1 AND catalogue_item_id = $2`,
        [req.params.valeurId, req.params.itemId]
      )
      if (exists.rows.length === 0) throw new NotFoundError('Valeur référentiel')
      throw new AppError(
        'Impossible de supprimer une valeur plateforme',
        'PLATEFORME_READONLY',
        403
      )
    }

    sendSuccess(res, { deleted: true })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
