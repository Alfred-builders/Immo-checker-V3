import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../db/index.js'
import { verifyToken } from '../middleware/auth.js'
import { requireRole } from '../middleware/auth.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { NotFoundError, AppError } from '../utils/errors.js'
import { dispatchWebhook } from '../services/webhook-service.js'

const router = Router()
router.use(verifyToken)
router.use(requireRole('admin'))

const VALID_EVENTS = [
  'edl.signe',
  'edl.infructueux',
  'mission.creee',
  'mission.assignee',
  'mission.terminee',
  'mission.annulee',
  'cle.deposee',
] as const

const createSchema = z.object({
  url: z.url(),
  secret: z.string().min(8).max(255),
  events: z.array(z.enum(VALID_EVENTS)).min(1),
})

const updateSchema = z.object({
  url: z.url().optional(),
  secret: z.string().min(8).max(255).optional(),
  events: z.array(z.enum(VALID_EVENTS)).min(1).optional(),
  est_active: z.boolean().optional(),
})

// GET /api/webhooks
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const result = await query(
      `SELECT wc.id, wc.url, wc.events, wc.est_active, wc.created_at, wc.updated_at,
              (SELECT count(*) FROM webhook_delivery wd WHERE wd.webhook_id = wc.id)::int AS total_deliveries,
              (SELECT max(wd.last_attempt_at) FROM webhook_delivery wd WHERE wd.webhook_id = wc.id) AS last_delivery_at,
              (SELECT wd.statut FROM webhook_delivery wd WHERE wd.webhook_id = wc.id ORDER BY wd.created_at DESC LIMIT 1) AS last_statut
       FROM webhook_config wc
       WHERE wc.workspace_id = $1
       ORDER BY wc.created_at DESC`,
      [workspaceId]
    )
    sendSuccess(res, result.rows)
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/webhooks
router.post('/', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const data = createSchema.parse(req.body)
    const result = await query(
      `INSERT INTO webhook_config (workspace_id, url, secret, events)
       VALUES ($1, $2, $3, $4)
       RETURNING id, url, events, est_active, created_at`,
      [workspaceId, data.url, data.secret, data.events]
    )
    sendSuccess(res, result.rows[0], 201)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/webhooks/:id
router.patch('/:id', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const data = updateSchema.parse(req.body)

    const current = await query(
      `SELECT id FROM webhook_config WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (current.rows.length === 0) throw new NotFoundError('Webhook')

    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1
    if (data.url !== undefined)       { fields.push(`url = $${idx++}`);        values.push(data.url) }
    if (data.secret !== undefined)    { fields.push(`secret = $${idx++}`);     values.push(data.secret) }
    if (data.events !== undefined)    { fields.push(`events = $${idx++}`);     values.push(data.events) }
    if (data.est_active !== undefined){ fields.push(`est_active = $${idx++}`); values.push(data.est_active) }
    if (fields.length === 0) throw new AppError('Aucun champ à modifier', 'VALIDATION_ERROR', 400)

    fields.push(`updated_at = now()`)
    values.push(req.params.id)
    const result = await query(
      `UPDATE webhook_config SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, url, events, est_active, updated_at`,
      values
    )
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// DELETE /api/webhooks/:id
router.delete('/:id', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const result = await query(
      `DELETE FROM webhook_config WHERE id = $1 AND workspace_id = $2 RETURNING id`,
      [req.params.id, workspaceId]
    )
    if (result.rows.length === 0) throw new NotFoundError('Webhook')
    sendSuccess(res, { deleted: true })
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/webhooks/:id/deliveries — last 50 deliveries
router.get('/:id/deliveries', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const hookCheck = await query(
      `SELECT id FROM webhook_config WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (hookCheck.rows.length === 0) throw new NotFoundError('Webhook')

    const result = await query(
      `SELECT id, event_type, statut, attempts, response_code, last_attempt_at, created_at
       FROM webhook_delivery
       WHERE webhook_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.params.id]
    )
    sendSuccess(res, result.rows)
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/webhooks/:id/test — send ping event
router.post('/:id/test', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const hookCheck = await query(
      `SELECT id, url FROM webhook_config WHERE id = $1 AND workspace_id = $2 AND est_active = true`,
      [req.params.id, workspaceId]
    )
    if (hookCheck.rows.length === 0) throw new NotFoundError('Webhook actif')

    // Temporarily add 'ping' to events for test dispatch
    const tempHook = await query(
      `SELECT id, url, secret FROM webhook_config WHERE id = $1`,
      [req.params.id]
    )

    // Direct dispatch for test
    await dispatchWebhook(workspaceId, 'ping', {
      message: 'Test webhook depuis ImmoChecker',
      webhook_id: req.params.id,
    })

    sendSuccess(res, { sent: true, url: hookCheck.rows[0].url })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
