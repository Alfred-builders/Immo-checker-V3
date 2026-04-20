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

const niveauExigenceEnum = z.enum(['masque', 'optionnel', 'recommande', 'obligatoire'])

const critereEnum = z.enum([
  'etat_general', 'proprete', 'photos', 'caracteristiques',
  'couleur', 'degradations', 'fonctionnement', 'quantite',
])

// =============================================
// Template Piece Items (associations piece <> item)
// =============================================

// GET /api/templates/pieces/:typePieceId/items — List items linked to a piece type
router.get('/pieces/:typePieceId/items', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    // Verify type_piece exists and is accessible
    const pieceResult = await query(
      `SELECT id FROM type_piece
       WHERE id = $1 AND (workspace_id IS NULL OR workspace_id = $2)`,
      [req.params.typePieceId, workspaceId]
    )
    if (pieceResult.rows.length === 0) throw new NotFoundError('Type de pièce')

    const result = await query(
      `SELECT
        tpi.id, tpi.type_piece_id, tpi.catalogue_item_id,
        tpi.quantite_defaut, tpi.labels_defaut, tpi.ordre_affichage,
        tpi.created_at,
        ci.nom, ci.categorie, ci.contexte, ci.parent_item_id,
        ci.aide_contextuelle, ci.source as item_source,
        ci.qte_par_defaut, ci.est_archive
       FROM template_piece_item tpi
       JOIN catalogue_item ci ON ci.id = tpi.catalogue_item_id
       WHERE tpi.type_piece_id = $1 AND ci.est_archive = false
       ORDER BY tpi.ordre_affichage ASC, ci.nom ASC`,
      [req.params.typePieceId]
    )

    sendSuccess(res, result.rows)
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/templates/pieces/:typePieceId/items — Link item to piece type
const linkItemSchema = z.object({
  catalogue_item_id: z.string().uuid(),
  quantite_defaut: z.number().int().min(1).optional(),
  labels_defaut: z.record(z.string(), z.unknown()).optional(),
  ordre_affichage: z.number().int().optional(),
})

router.post('/pieces/:typePieceId/items', requireRole('admin', 'gestionnaire'), validate(linkItemSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { catalogue_item_id, quantite_defaut, labels_defaut, ordre_affichage } = req.body

    // Verify type_piece exists and is accessible
    const pieceResult = await query(
      `SELECT id FROM type_piece
       WHERE id = $1 AND (workspace_id IS NULL OR workspace_id = $2)`,
      [req.params.typePieceId, workspaceId]
    )
    if (pieceResult.rows.length === 0) throw new NotFoundError('Type de pièce')

    // Verify catalogue_item exists and is accessible
    const itemResult = await query(
      `SELECT id FROM catalogue_item
       WHERE id = $1 AND (workspace_id IS NULL OR workspace_id = $2)`,
      [catalogue_item_id, workspaceId]
    )
    if (itemResult.rows.length === 0) throw new NotFoundError('Item catalogue')

    // Check for duplicate (unique constraint: type_piece_id + catalogue_item_id)
    const existing = await query(
      `SELECT id FROM template_piece_item
       WHERE type_piece_id = $1 AND catalogue_item_id = $2`,
      [req.params.typePieceId, catalogue_item_id]
    )
    if (existing.rows.length > 0) {
      throw new AppError(
        'Cet item est déjà associé à ce type de pièce',
        'DUPLICATE_ASSOCIATION',
        409
      )
    }

    const result = await query(
      `INSERT INTO template_piece_item (type_piece_id, catalogue_item_id, quantite_defaut, labels_defaut, ordre_affichage)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.typePieceId, catalogue_item_id, quantite_defaut ?? 1,
       labels_defaut ? JSON.stringify(labels_defaut) : null, ordre_affichage ?? 0]
    )

    sendSuccess(res, result.rows[0], 201)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/templates/pieces/:typePieceId/items/:itemId — Update quantity/labels/order
router.patch('/pieces/:typePieceId/items/:itemId', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const { quantite_defaut, labels_defaut, ordre_affichage } = req.body

    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    const addField = (name: string, value: unknown) => {
      if (value !== undefined) {
        fields.push(`${name} = $${idx++}`)
        values.push(name === 'labels_defaut' ? JSON.stringify(value) : value)
      }
    }

    addField('quantite_defaut', quantite_defaut)
    addField('labels_defaut', labels_defaut)
    addField('ordre_affichage', ordre_affichage)

    if (fields.length === 0) {
      sendSuccess(res, { message: 'Aucune modification' })
      return
    }

    values.push(req.params.typePieceId, req.params.itemId)

    const result = await query(
      `UPDATE template_piece_item SET ${fields.join(', ')}
       WHERE type_piece_id = $${idx++} AND catalogue_item_id = $${idx} RETURNING *`,
      values
    )

    if (result.rows.length === 0) throw new NotFoundError('Association pièce-item')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// DELETE /api/templates/pieces/:typePieceId/items/:itemId — Unlink item from piece type
router.delete('/pieces/:typePieceId/items/:itemId', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const result = await query(
      `DELETE FROM template_piece_item
       WHERE type_piece_id = $1 AND catalogue_item_id = $2 RETURNING id`,
      [req.params.typePieceId, req.params.itemId]
    )

    if (result.rows.length === 0) throw new NotFoundError('Association pièce-item')
    sendSuccess(res, { deleted: true })
  } catch (error) {
    sendError(res, error)
  }
})

// =============================================
// Criteria Configuration (category-level + item-level overrides)
// =============================================

// GET /api/templates/criteres — Full criteria matrix for current workspace
router.get('/criteres', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { contexte } = req.query

    let where = `ccc.workspace_id = $1`
    const params: unknown[] = [workspaceId]
    let paramIndex = 2

    if (contexte && (contexte === 'edl' || contexte === 'inventaire')) {
      where += ` AND ccc.contexte = $${paramIndex}`
      params.push(contexte)
      paramIndex++
    }

    const result = await query(
      `SELECT
        ccc.id, ccc.workspace_id, ccc.categorie, ccc.contexte,
        ccc.etat_general, ccc.proprete, ccc.photos, ccc.caracteristiques,
        ccc.couleur, ccc.degradations, ccc.fonctionnement, ccc.quantite,
        ccc.created_at, ccc.updated_at
       FROM config_critere_categorie ccc
       WHERE ${where}
       ORDER BY ccc.categorie ASC, ccc.contexte ASC`,
      params
    )

    sendSuccess(res, result.rows)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/templates/criteres/:categorie — Upsert category-level criteria
const upsertCritereSchema = z.object({
  contexte: contexteEnum,
  etat_general: niveauExigenceEnum.optional(),
  proprete: niveauExigenceEnum.optional(),
  photos: niveauExigenceEnum.optional(),
  caracteristiques: niveauExigenceEnum.optional(),
  couleur: niveauExigenceEnum.optional(),
  degradations: niveauExigenceEnum.optional(),
  fonctionnement: niveauExigenceEnum.optional(),
  quantite: niveauExigenceEnum.optional(),
})

router.patch('/criteres/:categorie', requireRole('admin', 'gestionnaire'), validate(upsertCritereSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const categorie = req.params.categorie
    const { contexte, ...criteres } = req.body

    // Build the SET clause for only provided criteria
    const setClauses: string[] = []
    const values: unknown[] = [workspaceId, categorie, contexte]
    let idx = 4

    for (const [key, value] of Object.entries(criteres)) {
      if (value !== undefined) {
        setClauses.push(`${key} = $${idx++}`)
        values.push(value)
      }
    }

    // Build insert columns/values for the ON CONFLICT case
    const allCritereKeys = [
      'etat_general', 'proprete', 'photos', 'caracteristiques',
      'couleur', 'degradations', 'fonctionnement', 'quantite',
    ]

    const insertColumns = ['workspace_id', 'categorie', 'contexte']
    const insertValues = ['$1', '$2', '$3']
    const insertParams: unknown[] = [workspaceId, categorie, contexte]
    let insertIdx = 4

    for (const key of allCritereKeys) {
      insertColumns.push(key)
      if (criteres[key] !== undefined) {
        insertValues.push(`$${insertIdx}`)
        insertParams.push(criteres[key])
        insertIdx++
      } else {
        insertValues.push(`'optionnel'`)
      }
    }

    // Use the ON CONFLICT upsert approach
    if (setClauses.length === 0) {
      sendSuccess(res, { message: 'Aucune modification' })
      return
    }

    setClauses.push(`updated_at = now()`)

    const result = await query(
      `INSERT INTO config_critere_categorie (${insertColumns.join(', ')})
       VALUES (${insertValues.join(', ')})
       ON CONFLICT (workspace_id, categorie, contexte)
       DO UPDATE SET ${setClauses.join(', ')}
       RETURNING *`,
      insertParams
    )

    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/templates/criteres/items/:itemId — Get item-level overrides
router.get('/criteres/items/:itemId', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    // Verify item exists and is accessible
    const itemResult = await query(
      `SELECT id FROM catalogue_item
       WHERE id = $1 AND (workspace_id IS NULL OR workspace_id = $2)`,
      [req.params.itemId, workspaceId]
    )
    if (itemResult.rows.length === 0) throw new NotFoundError('Item catalogue')

    const result = await query(
      `SELECT cci.id, cci.critere, cci.niveau_exigence, cci.created_at
       FROM config_critere_item cci
       WHERE cci.catalogue_item_id = $1 AND cci.workspace_id = $2
       ORDER BY cci.critere ASC`,
      [req.params.itemId, workspaceId]
    )

    sendSuccess(res, result.rows)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/templates/criteres/items/:itemId — Set item override
const setItemOverrideSchema = z.object({
  critere: critereEnum,
  niveau_exigence: niveauExigenceEnum,
})

router.patch('/criteres/items/:itemId', requireRole('admin', 'gestionnaire'), validate(setItemOverrideSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { critere, niveau_exigence } = req.body

    // Verify item exists and is accessible
    const itemResult = await query(
      `SELECT id FROM catalogue_item
       WHERE id = $1 AND (workspace_id IS NULL OR workspace_id = $2)`,
      [req.params.itemId, workspaceId]
    )
    if (itemResult.rows.length === 0) throw new NotFoundError('Item catalogue')

    // Upsert: insert or update on conflict
    const result = await query(
      `INSERT INTO config_critere_item (workspace_id, catalogue_item_id, critere, niveau_exigence)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (workspace_id, catalogue_item_id, critere)
       DO UPDATE SET niveau_exigence = $4
       RETURNING *`,
      [workspaceId, req.params.itemId, critere, niveau_exigence]
    )

    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// DELETE /api/templates/criteres/items/:itemId/:critere — Reset item override
router.delete('/criteres/items/:itemId/:critere', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    const result = await query(
      `DELETE FROM config_critere_item
       WHERE workspace_id = $1 AND catalogue_item_id = $2 AND critere = $3
       RETURNING id`,
      [workspaceId, req.params.itemId, req.params.critere]
    )

    if (result.rows.length === 0) throw new NotFoundError('Override critère')
    sendSuccess(res, { deleted: true })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
