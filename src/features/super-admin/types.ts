export type WorkspaceType = 'societe_edl' | 'bailleur' | 'agence'
export type WorkspaceStatut = 'actif' | 'suspendu' | 'trial'

export interface SuperAdminWorkspaceRow {
  id: string
  nom: string
  type_workspace: WorkspaceType
  statut: WorkspaceStatut
  siret: string | null
  email: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
  members_count: number
  missions_count: number
  batiments_count: number
}

export interface WorkspaceMember {
  id: string
  email: string
  nom: string
  prenom: string
  last_login_at: string | null
  role: 'admin' | 'gestionnaire' | 'technicien'
  est_actif: boolean
  joined_at: string
}

export interface PendingInvitation {
  id: string
  email: string
  role: string
  created_at: string
  expires_at: string
  accepted_at: string | null
}

export interface SuperAdminWorkspaceDetail extends SuperAdminWorkspaceRow {
  telephone: string | null
  adresse: string | null
  code_postal: string | null
  ville: string | null
  couleur_primaire: string | null
  suspended_reason: string | null
  suspended_at: string | null
  lots_count: number
  edl_signed_count: number
  members: WorkspaceMember[]
  pending_invitations: PendingInvitation[]
}

export interface SuperAdminUserRow {
  id: string
  email: string
  nom: string
  prenom: string
  is_super_admin: boolean
  est_actif: boolean
  last_login_at: string | null
  created_at: string
  memberships: Array<{
    workspace_id: string
    workspace_nom: string
    role: string
    est_actif: boolean
  }> | null
}

export interface SuperAdminUserDetail extends SuperAdminUserRow {
  tel: string | null
  avatar_url: string | null
  deactivated_at: string | null
  memberships: Array<{
    workspace_id: string
    workspace_nom: string
    type_workspace: WorkspaceType
    role: string
    est_actif: boolean
    joined_at: string
  }> | null
}

export interface AuditLogEntry {
  id: string
  action: string
  target_type: string
  target_id: string
  metadata: Record<string, unknown>
  created_at: string
  super_admin: { id: string; email: string; nom: string; prenom: string }
}

export interface SuperAdminStats {
  workspaces_total: number
  workspaces_actifs: number
  workspaces_suspendus: number
  workspaces_trial: number
  users_total: number
  users_mau: number
  super_admins_count: number
  invitations_pending: number
  missions_total: number
  edl_signed_total: number
  workspaces_created_30d: number
  users_created_30d: number
}

export interface SuperAdminTrends {
  daily: Array<{ day: string; workspaces: number; users: number }>
  by_type: Array<{ type_workspace: string; count: number }>
  by_statut: Array<{ statut: string; count: number }>
  top_active: Array<{ id: string; nom: string; type_workspace: string; missions_count: number }>
}
