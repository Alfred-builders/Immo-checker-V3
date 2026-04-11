import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../db/index.js'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendSuccess, sendList, sendError } from '../utils/response.js'
import { NotFoundError, AppError } from '../utils/errors.js'

const router = Router()
router.use(verifyToken)

// Enums
const categoriePieceEnum = z.enum([
  'vie', 'eau_sanitaires', 'circulations', 'exterieur_annexes', 'equipements', 'autres',
])

// GET /api/type-pieces — List all type_piece (plateforme + workspace)
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { contexte, search } = req.query

    let where = `(tp.workspace_id IS NULL OR tp.workspace_id = $1) AND tp.est_archive = false`
    const params: unknown[] = [workspaceId]
    let paramIndex = 2

    if (search) {
      where += ` AND tp.nom ILIKE $${paramIndex}`
      params.push(`%${search}%`)
      paramIndex++
    }

    // When filtering by contexte, only count items matching that contexte
    let itemCountFilter = ''
    if (contexte && (contexte === 'edl' || contexte === 'inventaire')) {
      itemCountFilter = ` AND ci.contexte = $${paramIndex}`
      params.push(contexte)
      paramIndex++
    }

    const sql = `
      SELECT
        tp.id, tp.workspace_id, tp.nom, tp.categorie_piece, tp.icon,
        tp.source, tp.ordre_affichage, tp.est_archive,
        tp.created_at, tp.updated_at,
        (SELECT count(*) FROM template_piece_item tpi
         JOIN catalogue_item ci ON ci.id = tpi.catalogue_item_id
         WHERE tpi.type_piece_id = tp.id${itemCountFilter})::int as nb_items
      FROM type_piece tp
      WHERE ${where}
      ORDER BY tp.categorie_piece ASC, tp.ordre_affichage ASC, tp.nom ASC
    `

    const result = await query(sql, params)

    sendSuccess(res, result.rows)
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/type-pieces/:id — Detail with linked items
router.get('/:id', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    const result = await query(
      `SELECT tp.*
       FROM type_piece tp
       WHERE tp.id = $1 AND (tp.workspace_id IS NULL OR tp.workspace_id = $2)`,
      [req.params.id, workspaceId]
    )

    if (result.rows.length === 0) throw new NotFoundError('Type de pièce')

    // Fetch linked items via template_piece_item
    const itemsResult = await query(
      `SELECT
        tpi.id as template_piece_item_id,
        tpi.quantite_defaut, tpi.labels_defaut, tpi.ordre_affichage as tpi_ordre,
        ci.id, ci.nom, ci.categorie, ci.contexte, ci.parent_item_id,
        ci.aide_contextuelle, ci.source, ci.qte_par_defaut,
        ci.ordre_affichage, ci.est_archive
       FROM template_piece_item tpi
       JOIN catalogue_item ci ON ci.id = tpi.catalogue_item_id
       WHERE tpi.type_piece_id = $1 AND ci.est_archive = false
       ORDER BY tpi.ordre_affichage ASC, ci.nom ASC`,
      [req.params.id]
    )

    sendSuccess(res, { ...result.rows[0], items: itemsResult.rows })
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/type-pieces — Create
const createTypePieceSchema = z.object({
  nom: z.string().min(1).max(255),
  categorie_piece: categoriePieceEnum,
  icon: z.string().max(100).optional(),
  ordre_affichage: z.number().int().optional(),
})

router.post('/', requireRole('admin', 'gestionnaire'), validate(createTypePieceSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { nom, categorie_piece, icon, ordre_affichage } = req.body

    const result = await query(
      `INSERT INTO type_piece (workspace_id, nom, categorie_piece, icon, source, ordre_affichage)
       VALUES ($1, $2, $3, $4, 'workspace', $5) RETURNING *`,
      [workspaceId, nom, categorie_piece, icon ?? null, ordre_affichage ?? 0]
    )

    sendSuccess(res, result.rows[0], 201)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/type-pieces/:id — Update (workspace source only)
router.patch('/:id', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    // Verify ownership — only workspace-owned pieces can be updated
    const existing = await query(
      `SELECT id, source FROM type_piece WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (existing.rows.length === 0) throw new NotFoundError('Type de pièce')
    if (existing.rows[0].source !== 'workspace') {
      throw new AppError(
        'Impossible de modifier un type de pièce plateforme',
        'PLATEFORME_READONLY',
        403
      )
    }

    const { nom, categorie_piece, icon, ordre_affichage } = req.body

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
    addField('categorie_piece', categorie_piece)
    addField('icon', icon)
    addField('ordre_affichage', ordre_affichage)

    if (fields.length === 0) {
      sendSuccess(res, { message: 'Aucune modification' })
      return
    }

    fields.push(`updated_at = now()`)
    values.push(req.params.id, workspaceId)

    const result = await query(
      `UPDATE type_piece SET ${fields.join(', ')} WHERE id = $${idx++} AND workspace_id = $${idx} RETURNING *`,
      values
    )

    if (result.rows.length === 0) throw new NotFoundError('Type de pièce')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/type-pieces/:id/archive — Archive (workspace source only)
router.patch('/:id/archive', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    const existing = await query(
      `SELECT id, source FROM type_piece WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (existing.rows.length === 0) throw new NotFoundError('Type de pièce')
    if (existing.rows[0].source !== 'workspace') {
      throw new AppError(
        'Impossible d\'archiver un type de pièce plateforme',
        'PLATEFORME_READONLY',
        403
      )
    }

    const result = await query(
      `UPDATE type_piece SET est_archive = true, updated_at = now()
       WHERE id = $1 AND workspace_id = $2 RETURNING *`,
      [req.params.id, workspaceId]
    )

    if (result.rows.length === 0) throw new NotFoundError('Type de pièce')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

export default router
