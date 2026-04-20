import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api-client'
import type {
  SuperAdminWorkspaceRow,
  SuperAdminWorkspaceDetail,
  SuperAdminUserRow,
  SuperAdminUserDetail,
  AuditLogEntry,
  SuperAdminStats,
  SuperAdminTrends,
  WorkspaceStatut,
  WorkspaceType,
} from './types'

export function useSuperAdminStats() {
  return useQuery<SuperAdminStats>({
    queryKey: ['super-admin', 'stats'],
    queryFn: () => api('/super-admin/dashboard/stats'),
  })
}

export function useSuperAdminTrends() {
  return useQuery<SuperAdminTrends>({
    queryKey: ['super-admin', 'trends'],
    queryFn: () => api('/super-admin/dashboard/trends'),
  })
}

export function useSuperAdminWorkspaces(filters: { search?: string; type?: string; statut?: string } = {}) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.type) params.set('type', filters.type)
  if (filters.statut) params.set('statut', filters.statut)
  const qs = params.toString() ? `?${params.toString()}` : ''
  return useQuery<{ data: SuperAdminWorkspaceRow[]; total: number }>({
    queryKey: ['super-admin', 'workspaces', filters],
    queryFn: () => api(`/super-admin/workspaces${qs}`),
  })
}

export function useSuperAdminWorkspace(id: string | undefined) {
  return useQuery<SuperAdminWorkspaceDetail>({
    queryKey: ['super-admin', 'workspace', id],
    queryFn: () => api(`/super-admin/workspaces/${id}`),
    enabled: !!id,
  })
}

export interface CreateWorkspaceInput {
  nom: string
  type_workspace: WorkspaceType
  statut?: 'actif' | 'trial'
  admin_email: string
  siret?: string
  email?: string
  telephone?: string
  adresse?: string
  code_postal?: string
  ville?: string
}

export function useCreateWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) =>
      api<{ workspace: SuperAdminWorkspaceRow; invitation: { id: string; email: string } }>(
        '/super-admin/workspaces',
        { method: 'POST', body: JSON.stringify(input) }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['super-admin', 'workspaces'] })
      qc.invalidateQueries({ queryKey: ['super-admin', 'stats'] })
    },
  })
}

export function useUpdateWorkspaceStatut() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: WorkspaceStatut }) =>
      api(`/super-admin/workspaces/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ statut }),
      }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['super-admin', 'workspace', id] })
      qc.invalidateQueries({ queryKey: ['super-admin', 'workspaces'] })
    },
  })
}

export function useResendAdminInvite() {
  return useMutation({
    mutationFn: (workspaceId: string) =>
      api<{ message: string; email: string }>(
        `/super-admin/workspaces/${workspaceId}/resend-admin-invite`,
        { method: 'POST' }
      ),
  })
}

export function useSuperAdminUsers(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : ''
  return useQuery<{ data: SuperAdminUserRow[]; total: number }>({
    queryKey: ['super-admin', 'users', search],
    queryFn: () => api(`/super-admin/users${qs}`),
  })
}

export function useSuperAdminUser(id: string | undefined) {
  return useQuery<SuperAdminUserDetail>({
    queryKey: ['super-admin', 'user', id],
    queryFn: () => api(`/super-admin/users/${id}`),
    enabled: !!id,
  })
}

export function useUpdateUserSuperAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_super_admin }: { id: string; is_super_admin: boolean }) =>
      api(`/super-admin/users/${id}/super-admin`, {
        method: 'PATCH',
        body: JSON.stringify({ is_super_admin }),
      }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['super-admin', 'user', id] })
      qc.invalidateQueries({ queryKey: ['super-admin', 'users'] })
    },
  })
}

export function useAuditLog(filters: { action?: string; target_type?: string } = {}) {
  const params = new URLSearchParams()
  if (filters.action) params.set('action', filters.action)
  if (filters.target_type) params.set('target_type', filters.target_type)
  const qs = params.toString() ? `?${params.toString()}` : ''
  return useQuery<{ data: AuditLogEntry[] }>({
    queryKey: ['super-admin', 'audit', filters],
    queryFn: () => api(`/super-admin/audit-log${qs}`),
  })
}
