import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { api } from '../../lib/api-client'
import type {
  SuperAdminWorkspaceRow,
  SuperAdminWorkspaceDetail,
  SuperAdminUserRow,
  SuperAdminUserDetail,
  AuditLogEntry,
  SuperAdminStats,
  SuperAdminTrends,
  WorkspaceType,
} from './types'

interface PaginatedResponse<T> {
  data: T[]
  meta: { cursor?: string; has_more: boolean; total?: number }
}

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
  return useInfiniteQuery({
    queryKey: ['super-admin', 'workspaces', filters],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.type) params.set('type', filters.type)
      if (filters.statut) params.set('statut', filters.statut)
      if (pageParam) params.set('cursor', pageParam as string)
      const qs = params.toString() ? `?${params.toString()}` : ''
      return api<PaginatedResponse<SuperAdminWorkspaceRow>>(`/super-admin/workspaces${qs}`)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.meta.has_more ? last.meta.cursor : undefined),
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

export interface UpdateWorkspaceInput {
  nom?: string
  type_workspace?: WorkspaceType
  siret?: string | null
  email?: string | null
  telephone?: string | null
  adresse?: string | null
  code_postal?: string | null
  ville?: string | null
}

export function useUpdateWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & UpdateWorkspaceInput) =>
      api<SuperAdminWorkspaceDetail>(`/super-admin/workspaces/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['super-admin', 'workspace', id] })
      qc.invalidateQueries({ queryKey: ['super-admin', 'workspaces'] })
    },
  })
}

export function useSuspendWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api<SuperAdminWorkspaceDetail>(`/super-admin/workspaces/${id}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['super-admin', 'workspace', id] })
      qc.invalidateQueries({ queryKey: ['super-admin', 'workspaces'] })
      qc.invalidateQueries({ queryKey: ['super-admin', 'audit'] })
    },
  })
}

export function useReactivateWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api<SuperAdminWorkspaceDetail>(`/super-admin/workspaces/${id}/reactivate`, {
        method: 'POST',
      }),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['super-admin', 'workspace', id] })
      qc.invalidateQueries({ queryKey: ['super-admin', 'workspaces'] })
      qc.invalidateQueries({ queryKey: ['super-admin', 'audit'] })
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
  return useInfiniteQuery({
    queryKey: ['super-admin', 'users', search],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (pageParam) params.set('cursor', pageParam as string)
      const qs = params.toString() ? `?${params.toString()}` : ''
      return api<PaginatedResponse<SuperAdminUserRow>>(`/super-admin/users${qs}`)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.meta.has_more ? last.meta.cursor : undefined),
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

export function useToggleUserActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, est_actif }: { id: string; est_actif: boolean }) =>
      api<{ id: string; email: string; est_actif: boolean }>(
        `/super-admin/users/${id}/status`,
        { method: 'PATCH', body: JSON.stringify({ est_actif }) }
      ),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['super-admin', 'user', id] })
      qc.invalidateQueries({ queryKey: ['super-admin', 'users'] })
      qc.invalidateQueries({ queryKey: ['super-admin', 'audit'] })
    },
  })
}

export function useForcePasswordReset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api<{ message: string; email: string }>(
        `/super-admin/users/${id}/force-password-reset`,
        { method: 'POST' }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['super-admin', 'audit'] })
    },
  })
}

export function useRevokeUserSessions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api<{ revoked: number }>(`/super-admin/users/${id}/revoke-sessions`, {
        method: 'POST',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['super-admin', 'audit'] })
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
