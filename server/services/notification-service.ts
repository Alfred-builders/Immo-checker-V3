import { query } from '../db/index.js'

export type NotificationType =
  | 'edl_signed'
  | 'edl_infructueux'
  | 'mission_created'
  | 'mission_cancelled'
  | 'mission_completed'
  | 'technicien_accepted'
  | 'technicien_refused'
  | 'invitation_accepted'
  | 'invitation_expired'
  | 'password_changed'
  | 'user_deactivated'

export interface NotificationPayload {
  user_id: string
  workspace_id: string
  type: NotificationType
  titre: string
  message?: string | null
  lien?: string | null
}

export async function publishNotification(payload: NotificationPayload): Promise<void> {
  try {
    await query(
      `INSERT INTO notification (user_id, workspace_id, type, titre, message, lien)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        payload.user_id,
        payload.workspace_id,
        payload.type,
        payload.titre,
        payload.message ?? null,
        payload.lien ?? null,
      ]
    )
  } catch (err) {
    console.error('[notification] Failed to publish:', err, payload)
  }
}

type Role = 'admin' | 'gestionnaire' | 'technicien'

export async function publishToRoles(
  workspaceId: string,
  roles: Role[],
  payload: Omit<NotificationPayload, 'user_id' | 'workspace_id'>,
  excludeUserId?: string
): Promise<void> {
  try {
    const { rows } = await query(
      `SELECT user_id FROM workspace_user
       WHERE workspace_id = $1 AND role = ANY($2::text[]) AND est_actif = true`,
      [workspaceId, roles]
    )
    const recipients = rows
      .map((r) => r.user_id as string)
      .filter((id) => id !== excludeUserId)
    if (recipients.length === 0) return

    const values: string[] = []
    const params: unknown[] = []
    let i = 1
    for (const uid of recipients) {
      values.push(`($${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++})`)
      params.push(
        uid,
        workspaceId,
        payload.type,
        payload.titre,
        payload.message ?? null,
        payload.lien ?? null
      )
    }
    await query(
      `INSERT INTO notification (user_id, workspace_id, type, titre, message, lien)
       VALUES ${values.join(', ')}`,
      params
    )
  } catch (err) {
    console.error('[notification] Failed to publish to roles:', err, { workspaceId, roles, payload })
  }
}
