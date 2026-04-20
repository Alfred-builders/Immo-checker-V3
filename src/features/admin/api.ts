import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api-client'

// ── Types ──

export interface WorkspaceUser {
  id: string
  email: string
  nom: string
  prenom: string
  tel: string | null
  role: 'admin' | 'gestionnaire' | 'technicien'
  est_actif: boolean
  created_at: string
  deactivated_at: string | null
}

export interface Invitation {
  id: string
  email: string
  role: 'admin' | 'gestionnaire' | 'technicien'
  token: string
  accepted_at: string | null
  expires_at: string
  created_at: string
  invited_by_nom?: string
  invited_by_prenom?: string
}

// ── Workspace details ──

export interface WorkspaceDetails {
  id: string
  nom: string
  type_workspace: string
  statut: string
  siret: string | null
  email: string | null
  telephone: string | null
  adresse: string | null
  code_postal: string | null
  ville: string | null
  logo_url: string | null
  couleur_primaire: string | null
  couleur_fond: string | null
  fond_style: string | null
  created_at: string
  updated_at: string
}

export function useWorkspaceDetails() {
  return useQuery({
    queryKey: ['workspace-details'],
    queryFn: () => api<WorkspaceDetails>('/workspaces/current'),
  })
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<WorkspaceDetails>) =>
      api<WorkspaceDetails>('/workspaces/current', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-details'] })
    },
  })
}

// ── Workspace Users ──

export function useWorkspaceUsers() {
  return useQuery({
    queryKey: ['workspace-users'],
    queryFn: () => api<WorkspaceUser[]>('/invitations/users'),
  })
}

// ── Invitations ──

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: () => api<Invitation[]>('/invitations'),
  })
}

// ── Send Invitation ──

interface SendInvitationInput {
  email: string
  role: 'admin' | 'gestionnaire' | 'technicien'
}

export function useSendInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SendInvitationInput) =>
      api<Invitation>('/invitations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
    },
  })
}

// ── Change Role ──

interface ChangeRoleInput {
  userId: string
  role: 'admin' | 'gestionnaire' | 'technicien'
}

export function useChangeRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: ChangeRoleInput) =>
      api<void>(`/invitations/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-users'] })
    },
  })
}

// ── Resend Invitation ──

export function useResendInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/invitations/${id}/resend`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
    },
  })
}

// ── Cancel Invitation ──

export function useCancelInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/invitations/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
    },
  })
}

// ── User Status (deactivate/reactivate) ──

export function useSetUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, est_actif }: { userId: string; est_actif: boolean }) =>
      api(`/invitations/users/${userId}/status`, { method: 'PATCH', body: JSON.stringify({ est_actif }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workspace-users'] }) },
  })
}

// ── Profile & Password ──

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: { nom?: string; prenom?: string; tel?: string | null }) =>
      api<{ id: string; nom: string; prenom: string; tel: string | null }>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      api<{ changed: boolean }>('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  })
}

// ── API Keys ──

export interface ApiKey {
  id: string
  name: string
  key_prefix: string
  scope: 'read' | 'write'
  est_active: boolean
  last_used_at: string | null
  expires_at: string | null
  created_at: string
}

export interface CreateApiKeyResult extends ApiKey {
  key: string // raw key shown ONCE
}

export function useApiKeys() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api<ApiKey[]>('/api-keys'),
  })
}

export function useCreateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; scope: 'read' | 'write'; expires_at?: string }) =>
      api<CreateApiKeyResult>('/api-keys', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
  })
}

export function useUpdateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; scope?: 'read' | 'write'; est_active?: boolean }) =>
      api<ApiKey>(`/api-keys/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
  })
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/api-keys/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
  })
}

// ── Webhooks ──

export type WebhookEvent =
  | 'edl.signe'
  | 'edl.infructueux'
  | 'mission.creee'
  | 'mission.assignee'
  | 'mission.terminee'
  | 'mission.annulee'
  | 'cle.deposee'

export interface WebhookConfig {
  id: string
  url: string
  events: WebhookEvent[]
  est_active: boolean
  created_at: string
  total_deliveries?: number
  success_deliveries?: number
}

export interface WebhookDelivery {
  id: string
  event_type: string
  statut: 'pending' | 'success' | 'failed' | 'retrying'
  attempts: number
  response_code: number | null
  last_attempt_at: string | null
  created_at: string
}

export function useWebhooks() {
  return useQuery({
    queryKey: ['webhooks'],
    queryFn: () => api<WebhookConfig[]>('/webhooks'),
  })
}

export function useCreateWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { url: string; secret: string; events: WebhookEvent[] }) =>
      api<WebhookConfig>('/webhooks', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
    },
  })
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; url?: string; events?: WebhookEvent[]; est_active?: boolean }) =>
      api<WebhookConfig>(`/webhooks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
    },
  })
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/webhooks/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
    },
  })
}

export function useTestWebhook() {
  return useMutation({
    mutationFn: (id: string) => api<{ queued: boolean }>(`/webhooks/${id}/test`, { method: 'POST' }),
  })
}

export function useWebhookDeliveries(webhookId: string | null) {
  return useQuery({
    queryKey: ['webhook-deliveries', webhookId],
    queryFn: () => api<WebhookDelivery[]>(`/webhooks/${webhookId}/deliveries`),
    enabled: !!webhookId,
  })
}
