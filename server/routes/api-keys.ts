import { Router } from 'express'
import crypto from 'crypto'
import { z } from 'zod/v4'
import { query } from '../db/index.js'
import { verifyToken } from '../middleware/auth.js'
import { requireRole } from '../middleware/auth.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { NotFoundError, AppError } from '../utils/errors.js'

const router = Router()
router.use(verifyToken)
router.use(requireRole('admin'))

const createSchema = z.object({
  name: z.string().min(1).max(255),
  scope: z.enum(['read', 'write']).default('write'),
  expires_at: z.string().datetime().optional(),
})

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  scope: z.enum(['read', 'write']).optional(),
  est_active: z.boolean().optional(),
})

// GET /api/api-keys — list workspace keys (no hash exposed)
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const result = await query(
      `SELECT ak.id, ak.name, ak.key_prefix, ak.scope, ak.est_active,
              ak.last_used_at, ak.expires_at, ak.created_at,
              u.prenom || ' ' || u.nom AS created_by_name
       FROM api_key ak
       JOIN utilisateur u ON u.id = ak.created_by
       WHERE ak.workspace_id = $1
       ORDER BY ak.created_at DESC`,
      [workspaceId]
    )
    sendSuccess(res, result.rows)
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/api-keys — create a new key (returns full key ONCE)
router.post('/', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const userId = req.user!.userId
    const data = createSchema.parse(req.body)

    // Generate: imk_live_ + 32 hex chars
    const rawKey = 'imk_live_' + crypto.randomBytes(16).toString('hex')
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
    const keyPrefix = rawKey.slice(0, 16) // "imk_live_" + 7 chars

    const result = await query(
      `INSERT INTO api_key (workspace_id, name, key_hash, key_prefix, scope, created_by, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, key_prefix, scope, est_active, expires_at, created_at`,
      [workspaceId, data.name, keyHash, keyPrefix, data.scope, userId, data.expires_at ?? null]
    )

    // Return full key — ONLY TIME it is exposed
    sendSuccess(res, { ...result.rows[0], key: rawKey }, 201)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/api-keys/:id — rename, change scope, toggle active
router.patch('/:id', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const data = updateSchema.parse(req.body)

    const current = await query(
      `SELECT id FROM api_key WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (current.rows.length === 0) throw new NotFoundError('Clé API')

    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1
    if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name) }
    if (data.scope !== undefined) { fields.push(`scope = $${idx++}`); values.push(data.scope) }
    if (data.est_active !== undefined) { fields.push(`est_active = $${idx++}`); values.push(data.est_active) }

    if (fields.length === 0) throw new AppError('Aucun champ à modifier', 'VALIDATION_ERROR', 400)

    values.push(req.params.id)
    const result = await query(
      `UPDATE api_key SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, key_prefix, scope, est_active, expires_at, created_at`,
      values
    )
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// DELETE /api/api-keys/:id — revoke (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const result = await query(
      `UPDATE api_key SET est_active = false WHERE id = $1 AND workspace_id = $2 RETURNING id`,
      [req.params.id, workspaceId]
    )
    if (result.rows.length === 0) throw new NotFoundError('Clé API')
    sendSuccess(res, { revoked: true })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
