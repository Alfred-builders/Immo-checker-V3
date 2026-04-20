import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../db/index.js'
import { verifyToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { AppError } from '../utils/errors.js'

const router = Router()
router.use(verifyToken)

// GET /api/users/me/onboarding-status
router.get('/me/onboarding-status', async (req, res) => {
  try {
    const { userId } = req.user!
    const result = await query(
      `SELECT onboarding_completed_at, onboarding_current_step, onboarding_skipped_steps,
              (SELECT COUNT(*)::int FROM workspace_user wu
               JOIN workspace w ON w.id = wu.workspace_id
               JOIN utilisateur u2 ON u2.id = wu.user_id
               WHERE u2.id = $1 AND u2.onboarding_completed_at IS NOT NULL) > 0 AS has_onboarded_before
       FROM utilisateur WHERE id = $1`,
      [userId]
    )
    if (result.rows.length === 0) {
      throw new AppError('Utilisateur introuvable', 'NOT_FOUND', 404)
    }
    const row = result.rows[0]
    sendSuccess(res, {
      completed_at: row.onboarding_completed_at,
      current_step: row.onboarding_current_step,
      skipped_steps: row.onboarding_skipped_steps ?? [],
      can_skip_express: row.has_onboarded_before === true,
    })
  } catch (error) {
    sendError(res, error)
  }
})

const updateOnboardingSchema = z.object({
  step: z.number().int().min(1).max(4).optional(),
  action: z.enum(['advance', 'skip', 'complete', 'reset']),
  skipped_step: z.number().int().min(1).max(4).optional(),
})

// PATCH /api/users/me/onboarding
router.patch('/me/onboarding', validate(updateOnboardingSchema), async (req, res) => {
  try {
    const { userId } = req.user!
    const { step, action, skipped_step } = req.body as z.infer<typeof updateOnboardingSchema>

    if (action === 'complete') {
      await query(
        `UPDATE utilisateur SET onboarding_completed_at = now(), updated_at = now() WHERE id = $1`,
        [userId]
      )
    } else if (action === 'reset') {
      await query(
        `UPDATE utilisateur
         SET onboarding_completed_at = NULL,
             onboarding_current_step = 1,
             onboarding_skipped_steps = '{}',
             updated_at = now()
         WHERE id = $1`,
        [userId]
      )
    } else if (action === 'advance' && step) {
      await query(
        `UPDATE utilisateur SET onboarding_current_step = $1, updated_at = now() WHERE id = $2`,
        [step, userId]
      )
    } else if (action === 'skip' && skipped_step) {
      await query(
        `UPDATE utilisateur
         SET onboarding_skipped_steps = array_append(
               array_remove(onboarding_skipped_steps, $1::text),
               $1::text
             ),
             updated_at = now()
         WHERE id = $2`,
        [String(skipped_step), userId]
      )
    }

    const result = await query(
      `SELECT onboarding_completed_at, onboarding_current_step, onboarding_skipped_steps
       FROM utilisateur WHERE id = $1`,
      [userId]
    )
    const row = result.rows[0]
    sendSuccess(res, {
      completed_at: row.onboarding_completed_at,
      current_step: row.onboarding_current_step,
      skipped_steps: row.onboarding_skipped_steps ?? [],
    })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
