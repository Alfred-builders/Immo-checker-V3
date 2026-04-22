import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../db/index.js'
import { verifyToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendSuccess, sendError, sendList } from '../utils/response.js'
import { AppError, NotFoundError } from '../utils/errors.js'

const router = Router()
router.use(verifyToken)

// GET /api/notifications — list notifications for current user+workspace
const listQuerySchema = z.object({
  unread_only: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
})
router.get('/', async (req, res) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError('Paramètres invalides', 'VALIDATION_ERROR', 400)
    }
    const { userId, workspaceId } = req.user!
    const unreadOnly = parsed.data.unread_only === 'true'
    const limit = parsed.data.limit ?? 20
    const cursor = parsed.data.cursor

    const params: unknown[] = [userId, workspaceId]
    let cursorClause = ''
    if (cursor) {
      params.push(cursor)
      cursorClause = `AND created_at < $${params.length}`
    }
    const unreadClause = unreadOnly ? `AND est_lu = false` : ''

    params.push(limit + 1)
    const result = await query(
      `SELECT id, type, titre, message, lien, est_lu, created_at, read_at
       FROM notification
       WHERE user_id = $1 AND workspace_id = $2
         ${unreadClause}
         ${cursorClause}
       ORDER BY created_at DESC
       LIMIT $${params.length}`,
      params
    )

    const hasMore = result.rows.length > limit
    const data = hasMore ? result.rows.slice(0, limit) : result.rows
    const nextCursor = hasMore ? (data[data.length - 1].created_at as Date).toISOString() : undefined

    sendList(res, data, { cursor: nextCursor, has_more: hasMore })
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/notifications/unread-count — lightweight count for bell badge
router.get('/unread-count', async (req, res) => {
  try {
    const { userId, workspaceId } = req.user!
    const { rows } = await query(
      `SELECT COUNT(*)::int AS count
       FROM notification
       WHERE user_id = $1 AND workspace_id = $2 AND est_lu = false`,
      [userId, workspaceId]
    )
    sendSuccess(res, { count: rows[0].count })
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/notifications/:id/read — mark a single notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { userId, workspaceId } = req.user!
    const result = await query(
      `UPDATE notification
       SET est_lu = true, read_at = now()
       WHERE id = $1 AND user_id = $2 AND workspace_id = $3 AND est_lu = false
       RETURNING id, est_lu, read_at`,
      [req.params.id, userId, workspaceId]
    )
    if (result.rows.length === 0) {
      throw new NotFoundError('Notification')
    }
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/notifications/mark-all-read — mark all unread notifications as read
router.post('/mark-all-read', async (req, res) => {
  try {
    const { userId, workspaceId } = req.user!
    const result = await query(
      `UPDATE notification
       SET est_lu = true, read_at = now()
       WHERE user_id = $1 AND workspace_id = $2 AND est_lu = false
       RETURNING id`,
      [userId, workspaceId]
    )
    sendSuccess(res, { marked_read: result.rowCount ?? 0 })
  } catch (error) {
    sendError(res, error)
  }
})

// DELETE /api/notifications/:id — dismiss a notification
router.delete('/:id', async (req, res) => {
  try {
    const { userId, workspaceId } = req.user!
    const result = await query(
      `DELETE FROM notification
       WHERE id = $1 AND user_id = $2 AND workspace_id = $3`,
      [req.params.id, userId, workspaceId]
    )
    if (result.rowCount === 0) {
      sendError(res, { status: 404, message: 'Notification introuvable', code: 'NOT_FOUND' })
      return
    }
    res.status(204).end()
  } catch (error) {
    sendError(res, error)
  }
})

// Optional dev/test endpoint — seed a notification to verify the pipeline
// Only available outside production
if (process.env.NODE_ENV !== 'production') {
  const seedSchema = z.object({
    type: z.string().min(1).max(64).optional(),
    titre: z.string().min(1).max(255),
    message: z.string().max(1000).nullable().optional(),
    lien: z.string().max(500).nullable().optional(),
  })
  router.post('/_seed', validate(seedSchema), async (req, res) => {
    try {
      const { userId, workspaceId } = req.user!
      const { type = 'mission_created', titre, message, lien } = req.body
      const result = await query(
        `INSERT INTO notification (user_id, workspace_id, type, titre, message, lien)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, type, titre, message, lien, est_lu, created_at`,
        [userId, workspaceId, type, titre, message ?? null, lien ?? null]
      )
      sendSuccess(res, result.rows[0], 201)
    } catch (error) {
      sendError(res, error)
    }
  })
}

export default router
