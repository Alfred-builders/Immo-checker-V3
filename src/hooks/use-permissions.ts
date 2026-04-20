import { useAuth } from './use-auth'
import type { Role } from './use-auth'

export interface Permissions {
  role: Role | null
  isAdmin: boolean
  isGestionnaire: boolean
  isTechnicien: boolean
  // Back-office sections
  canAccessBackoffice: boolean
  canAccessSettings: boolean
  canManageWorkspace: boolean
  canManageUsers: boolean
  canManageApiKeys: boolean
  canManageTemplates: boolean
  // Business entities
  canEditPatrimoine: boolean
  canEditTiers: boolean
  canEditMissions: boolean
  canEditEdl: boolean
  // Workspace type visibility
  showMandataire: boolean
}

export function usePermissions(): Permissions {
  const { user, workspace } = useAuth()
  const role = (user?.role ?? null) as Role | null

  const isAdmin = role === 'admin'
  const isGestionnaire = role === 'gestionnaire'
  const isTechnicien = role === 'technicien'
  const isBackoffice = isAdmin || isGestionnaire

  return {
    role,
    isAdmin,
    isGestionnaire,
    isTechnicien,
    canAccessBackoffice: isBackoffice,
    canAccessSettings: isBackoffice,
    canManageWorkspace: isAdmin,
    canManageUsers: isAdmin,
    canManageApiKeys: isAdmin,
    canManageTemplates: isBackoffice,
    canEditPatrimoine: isBackoffice,
    canEditTiers: isBackoffice,
    canEditMissions: isBackoffice,
    canEditEdl: isBackoffice,
    showMandataire: workspace?.type_workspace !== 'agence',
  }
}
