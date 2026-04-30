import crypto from 'crypto'
import { query } from '../db/index.js'

export type WebhookEvent =
  | 'edl.signe'
  | 'edl.infructueux'
  | 'mission.creee'
  | 'mission.assignee'
  | 'mission.terminee'
  | 'mission.infructueuse'
  | 'mission.annulee'
  | 'cle.deposee'
  | 'ping'

/**
 * Dispatch a webhook event to all active configured endpoints for a workspace.
 * Fire-and-forget: does not block the caller.
 */
export async function dispatchWebhook(
  workspaceId: string,
  eventType: WebhookEvent,
  payload: object
): Promise<void> {
  try {
    const hooks = await query(
      `SELECT id, url, secret FROM webhook_config
       WHERE workspace_id = $1 AND est_active = true AND $2 = ANY(events)`,
      [workspaceId, eventType]
    )

    for (const hook of hooks.rows) {
      // Create delivery record
      const del = await query(
        `INSERT INTO webhook_delivery (webhook_id, event_type, payload)
         VALUES ($1, $2, $3) RETURNING id`,
        [hook.id, eventType, JSON.stringify(payload)]
      )

      // Fire async — setImmediate so it doesn't block the HTTP response
      setImmediate(() =>
        sendWithRetry(del.rows[0].id, hook.url, hook.secret, eventType, payload, 1)
      )
    }
  } catch (err) {
    console.error('[webhook] dispatch error:', err)
  }
}

async function sendWithRetry(
  deliveryId: string,
  url: string,
  secret: string,
  eventType: string,
  payload: object,
  attempt: number
): Promise<void> {
  const body = JSON.stringify({
    event: eventType,
    timestamp: new Date().toISOString(),
    data: payload,
  })

  const sig = crypto.createHmac('sha256', secret).update(body).digest('hex')

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ImmoChecker-Signature': `sha256=${sig}`,
        'X-ImmoChecker-Event': eventType,
        'X-ImmoChecker-Delivery': deliveryId,
      },
      body,
      signal: AbortSignal.timeout(8000),
    })

    const responseBody = await resp.text().catch(() => null)

    await query(
      `UPDATE webhook_delivery
       SET statut = $1, attempts = $2, last_attempt_at = now(), response_code = $3, response_body = $4
       WHERE id = $5`,
      [resp.ok ? 'success' : 'failed', attempt, resp.status, responseBody?.slice(0, 500) ?? null, deliveryId]
    )

    // Retry on non-2xx, up to 3 attempts (exponential: 60s, 300s, 1800s)
    if (!resp.ok && attempt < 3) {
      const delays = [0, 60_000, 300_000, 1_800_000]
      const delay = delays[attempt] ?? 60_000
      await query(
        `UPDATE webhook_delivery SET statut = 'retrying', attempts = $1, last_attempt_at = now() WHERE id = $2`,
        [attempt, deliveryId]
      )
      setTimeout(() => sendWithRetry(deliveryId, url, secret, eventType, payload, attempt + 1), delay)
    }

    // Auto-disable webhook after 10 consecutive failures
    if (!resp.ok && attempt >= 3) {
      await autoDisableIfConsecutiveFailed(deliveryId, url)
    }
  } catch (err) {
    console.error(`[webhook] delivery ${deliveryId} attempt ${attempt} failed:`, err)
    try {
      await query(
        `UPDATE webhook_delivery SET statut = $1, attempts = $2, last_attempt_at = now() WHERE id = $3`,
        [attempt < 3 ? 'retrying' : 'failed', attempt, deliveryId]
      )
    } catch {}

    if (attempt < 3) {
      const delays = [0, 60_000, 300_000, 1_800_000]
      const delay = delays[attempt] ?? 60_000
      setTimeout(() => sendWithRetry(deliveryId, url, secret, eventType, payload, attempt + 1), delay)
    } else {
      await autoDisableIfConsecutiveFailed(deliveryId, url)
    }
  }
}

async function autoDisableIfConsecutiveFailed(deliveryId: string, _url: string): Promise<void> {
  try {
    // Find the webhook_id from this delivery
    const d = await query(`SELECT webhook_id FROM webhook_delivery WHERE id = $1`, [deliveryId])
    if (d.rows.length === 0) return
    const webhookId = d.rows[0].webhook_id

    // Count how many of the last 10 deliveries are failed
    const check = await query(
      `SELECT count(*) AS cnt FROM (
         SELECT statut FROM webhook_delivery
         WHERE webhook_id = $1
         ORDER BY created_at DESC
         LIMIT 10
       ) sub
       WHERE statut = 'failed'`,
      [webhookId]
    )
    if (parseInt(check.rows[0].cnt) >= 10) {
      await query(`UPDATE webhook_config SET est_active = false WHERE id = $1`, [webhookId])
      console.warn(`[webhook] auto-disabled ${webhookId} after 10 consecutive failures`)
    }
  } catch (err) {
    console.error('[webhook] autoDisable check error:', err)
  }
}
