import { Router } from 'express'
import { query } from '../db/index.js'
import { verifyToken } from '../middleware/auth.js'
import { sendSuccess, sendError } from '../utils/response.js'

const router = Router()
router.use(verifyToken)

// GET /api/preferences/:page — Get user column preferences for a page
router.get('/:page', async (req, res) => {
  try {
    const { userId, workspaceId } = req.user!
    const result = await query(
      `SELECT config FROM user_preference WHERE user_id = $1 AND workspace_id = $2 AND page = $3`,
      [userId, workspaceId, req.params.page]
    )
    sendSuccess(res, result.rows[0]?.config ?? null)
  } catch (error) {
    sendError(res, error)
  }
})

// PUT /api/preferences/:page — Save user column preferences
router.put('/:page', async (req, res) => {
  try {
    const { userId, workspaceId } = req.user!
    const { config } = req.body

    await query(
      `INSERT INTO user_preference (user_id, workspace_id, page, config)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, workspace_id, page)
       DO UPDATE SET config = $4, updated_at = now()`,
      [userId, workspaceId, req.params.page, JSON.stringify(config)]
    )
    sendSuccess(res, { saved: true })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
