import { query } from '../db/index.js'

export type AuditAction =
  | 'workspace.created'
  | 'workspace.updated'
  | 'workspace.suspended'
  | 'workspace.reactivated'
  | 'workspace.status_changed'
  | 'workspace.admin_invite_resent'
  | 'user.promoted_super_admin'
  | 'user.demoted_super_admin'
  | 'user.deactivated'
  | 'user.reactivated'
  | 'user.force_password_reset'
  | 'user.sessions_revoked'

export type AuditTargetType = 'workspace' | 'user' | 'invitation'

export async function logAudit(
  superAdminUserId: string,
  action: AuditAction,
  targetType: AuditTargetType,
  targetId: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  await query(
    `INSERT INTO audit_log (super_admin_user_id, action, target_type, target_id, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [superAdminUserId, action, targetType, targetId, metadata]
  )
}
