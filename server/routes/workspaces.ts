import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../db/index.js'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { AppError } from '../utils/errors.js'

const router = Router()
router.use(verifyToken)

// POST /api/workspaces — Create a new workspace (US-577)
const createWorkspaceSchema = z.object({
  nom: z.string().min(1).max(255),
  type_workspace: z.enum(['societe_edl', 'bailleur', 'agence']),
  siret: z.string().optional(),
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  code_postal: z.string().optional(),
  ville: z.string().optional(),
})

router.post('/', validate(createWorkspaceSchema), async (req, res) => {
  try {
    const userId = req.user!.userId
    const d = req.body

    // Create workspace
    const wsResult = await query(
      `INSERT INTO workspace (nom, type_workspace, siret, email, telephone, adresse, code_postal, ville, statut)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'actif')
       RETURNING *`,
      [d.nom, d.type_workspace, d.siret ?? null, d.email ?? null, d.telephone ?? null, d.adresse ?? null, d.code_postal ?? null, d.ville ?? null]
    )

    const workspace = wsResult.rows[0]

    // Add creator as admin
    await query(
      `INSERT INTO workspace_user (workspace_id, user_id, role)
       VALUES ($1, $2, 'admin')
       ON CONFLICT (workspace_id, user_id) DO NOTHING`,
      [workspace.id, userId]
    )

    sendSuccess(res, workspace, 201)
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/workspaces/current — Get current workspace details
router.get('/current', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM workspace WHERE id = $1`,
      [req.user!.workspaceId]
    )
    if (result.rows.length === 0) {
      sendError(res, { status: 404, message: 'Workspace introuvable', code: 'NOT_FOUND' })
      return
    }
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/workspaces/current — Update current workspace (admin only)
router.patch('/current', requireRole('admin'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const allowedFields = ['nom', 'siret', 'email', 'telephone', 'adresse', 'code_postal', 'ville', 'logo_url', 'couleur_primaire', 'couleur_fond', 'fond_style']

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
    values.push(workspaceId)

    const result = await query(
      `UPDATE workspace SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )

    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

export default router
