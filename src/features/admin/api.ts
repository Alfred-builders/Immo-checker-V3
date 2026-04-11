import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api-client'

// ── Types ──

export interface WorkspaceUser {
  id: string
  email: string
  nom: string
  prenom: string
  role: 'admin' | 'gestionnaire' | 'technicien'
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
