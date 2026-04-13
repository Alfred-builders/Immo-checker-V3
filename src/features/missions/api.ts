import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from 'src/lib/api-client'
import type {
  Mission, MissionDetail, MissionStats, EDLInventaire,
  CleMission, IndisponibiliteTechnicien, TechnicianConflicts,
  MissionStatut, StatutRdv, TypeCle, StatutCle, SensEDL, TypeEDL,
} from './types'

// ── Missions CRUD ──

interface ListMissionsParams {
  search?: string
  statut?: MissionStatut
  statut_rdv?: StatutRdv
  technicien_id?: string
  date_from?: string
  date_to?: string
  pending_actions?: boolean
  lot_id?: string
  cursor?: string
  limit?: number
}

interface ListResponse<T> {
  data: T[]
  meta: { cursor?: string; has_more: boolean; total?: number }
}

export function useMissions(params: ListMissionsParams = {}) {
  return useQuery({
    queryKey: ['missions', params],
    queryFn: () => {
      const sp = new URLSearchParams()
      if (params.search) sp.set('search', params.search)
      if (params.statut) sp.set('statut', params.statut)
      if (params.statut_rdv) sp.set('statut_rdv', params.statut_rdv)
      if (params.technicien_id) sp.set('technicien_id', params.technicien_id)
      if (params.date_from) sp.set('date_from', params.date_from)
      if (params.date_to) sp.set('date_to', params.date_to)
      if (params.pending_actions) sp.set('pending_actions', 'true')
      if (params.lot_id) sp.set('lot_id', params.lot_id)
      if (params.cursor) sp.set('cursor', params.cursor)
      if (params.limit) sp.set('limit', String(params.limit))
      const qs = sp.toString()
      return api<ListResponse<Mission>>(`/missions${qs ? `?${qs}` : ''}`)
    },
  })
}

export function useMissionStats() {
  return useQuery({
    queryKey: ['missions-stats'],
    queryFn: () => api<MissionStats>('/missions/stats'),
  })
}

export function useMissionDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['missions', id],
    queryFn: () => api<MissionDetail>(`/missions/${id}`),
    enabled: !!id,
  })
}

export function useCreateMission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      lot_id: string
      sens: SensEDL | 'entree_sortie'
      avec_inventaire: boolean
      date_planifiee: string
      heure_debut?: string
      heure_fin?: string
      technicien_id?: string
      commentaire?: string
      locataires?: Array<{ tiers_id: string; role_locataire: string }>
      type_bail?: string
    }) => api<Mission>('/missions', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['missions'] })
      qc.invalidateQueries({ queryKey: ['missions-stats'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useUpdateMission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; date_planifiee?: string; heure_debut?: string; heure_fin?: string; statut_rdv?: StatutRdv; commentaire?: string }) =>
      api<Mission>(`/missions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['missions'] })
      qc.invalidateQueries({ queryKey: ['missions', v.id] })
      qc.invalidateQueries({ queryKey: ['missions-stats'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useCancelMission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) =>
      api(`/missions/${id}/cancel`, { method: 'POST', body: JSON.stringify({ motif }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['missions'] })
      qc.invalidateQueries({ queryKey: ['missions-stats'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

// ── Technician Assignment (US-595) ──

export function useAssignTechnician() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ missionId, user_id }: { missionId: string; user_id: string }) =>
      api(`/missions/${missionId}/technician`, { method: 'POST', body: JSON.stringify({ user_id }) }),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['missions'] })
      qc.invalidateQueries({ queryKey: ['missions', v.missionId] })
      qc.invalidateQueries({ queryKey: ['missions-stats'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useUpdateInvitation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ missionId, statut_invitation }: { missionId: string; statut_invitation: 'accepte' | 'refuse' }) =>
      api(`/missions/${missionId}/technician`, { method: 'PATCH', body: JSON.stringify({ statut_invitation }) }),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['missions'] })
      qc.invalidateQueries({ queryKey: ['missions', v.missionId] })
      qc.invalidateQueries({ queryKey: ['missions-stats'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

// ── EDL (US-811, US-822) ──

export function useEDLDetail(edlId: string | undefined) {
  return useQuery({
    queryKey: ['edl', edlId],
    queryFn: () => api<EDLInventaire>(`/edl/${edlId}`),
    enabled: !!edlId,
  })
}

export function useUpdateEDL() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; statut?: string; code_acces?: string; commentaire?: string }) =>
      api(`/edl/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['missions'] })
      qc.invalidateQueries({ queryKey: ['edl'] })
      qc.invalidateQueries({ queryKey: ['missions-stats'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useAddEDLToMission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ missionId, ...data }: { missionId: string; type: TypeEDL; sens: SensEDL; locataires?: Array<{ tiers_id: string; role_locataire: string }> }) =>
      api(`/missions/${missionId}/edl`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['missions', v.missionId] }),
  })
}

// ── Keys / Cles (US-822) ──

export function useMissionCles(missionId: string | undefined) {
  return useQuery({
    queryKey: ['missions', missionId, 'cles'],
    queryFn: () => api<CleMission[]>(`/missions/${missionId}/cles`),
    enabled: !!missionId,
  })
}

export function useAddCle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ edlId, ...data }: { edlId: string; type_cle: TypeCle; quantite?: number; statut?: StatutCle; lieu_depot?: string; commentaire?: string }) =>
      api<CleMission>(`/edl/${edlId}/cles`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['missions'] }),
  })
}

export function useUpdateCle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ edlId, cleId, ...data }: { edlId: string; cleId: string; statut?: StatutCle; lieu_depot?: string; commentaire?: string }) =>
      api(`/edl/${edlId}/cles/${cleId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['missions'] }),
  })
}

// ── Indisponibilites (US-823) ──

export function useIndisponibilites(params?: { user_id?: string; date_from?: string; date_to?: string }) {
  const sp = new URLSearchParams()
  if (params?.user_id) sp.set('user_id', params.user_id)
  if (params?.date_from) sp.set('date_from', params.date_from)
  if (params?.date_to) sp.set('date_to', params.date_to)
  const qs = sp.toString()

  return useQuery({
    queryKey: ['indisponibilites', params],
    queryFn: () => api<IndisponibiliteTechnicien[]>(`/indisponibilites${qs ? `?${qs}` : ''}`),
    enabled: !!params,
    retry: false,
  })
}

export function useCreateIndisponibilite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { user_id: string; date_debut: string; date_fin: string; est_journee_entiere?: boolean; est_recurrent?: boolean; recurrence_config?: any; motif?: string }) =>
      api<IndisponibiliteTechnicien>('/indisponibilites', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['indisponibilites'] }),
  })
}

export function useUpdateIndisponibilite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; date_debut?: string; date_fin?: string; est_journee_entiere?: boolean; est_recurrent?: boolean; recurrence_config?: any; motif?: string }) =>
      api(`/indisponibilites/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['indisponibilites'] }),
  })
}

export function useDeleteIndisponibilite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api(`/indisponibilites/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['indisponibilites'] }),
  })
}

// ── Conflict Check (US-827) ──

export function useTechnicianConflicts(userId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ['tech-conflicts', userId, date],
    queryFn: () => api<TechnicianConflicts>(`/technicians/${userId}/conflicts?date=${date}`),
    enabled: !!userId && !!date,
  })
}

// ── Workspace Technicians (for pickers) ──

export function useWorkspaceTechnicians() {
  return useQuery({
    queryKey: ['workspace-technicians'],
    queryFn: () => api<Array<{ id: string; nom: string; prenom: string; email: string }>>('/invitations/users?role=technicien'),
    staleTime: 5 * 60 * 1000,
  })
}
