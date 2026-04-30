import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { api } from '../../lib/api-client'
import type { Tiers, TiersDetail, TiersStats, ListResponse } from './types'

interface ListTiersParams {
  search?: string
  type_personne?: string
  role?: string
  archived?: boolean
}

function buildTiersQuery(params: ListTiersParams, cursor?: string) {
  const sp = new URLSearchParams()
  if (params.search) sp.set('search', params.search)
  if (params.type_personne) sp.set('type_personne', params.type_personne)
  if (params.role) sp.set('role', params.role)
  if (params.archived) sp.set('archived', 'true')
  if (cursor) sp.set('cursor', cursor)
  return sp.toString()
}

export function useTiers(params: ListTiersParams = {}) {
  return useQuery({
    queryKey: ['tiers', params],
    queryFn: () => {
      const qs = buildTiersQuery(params)
      return api<ListResponse<Tiers>>(`/tiers${qs ? `?${qs}` : ''}`)
    },
  })
}

export function useTiersInfinite(params: ListTiersParams = {}) {
  return useInfiniteQuery({
    queryKey: ['tiers', 'infinite', params],
    queryFn: ({ pageParam }) => {
      const qs = buildTiersQuery(params, pageParam as string | undefined)
      return api<ListResponse<Tiers>>(`/tiers${qs ? `?${qs}` : ''}`)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.meta.has_more ? last.meta.cursor : undefined),
  })
}

export function useTiersDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['tiers-detail', id],
    queryFn: () => api<TiersDetail>(`/tiers/${id}`),
    enabled: !!id,
  })
}

export function useTiersStats() {
  return useQuery({
    queryKey: ['tiers-stats'],
    queryFn: () => api<TiersStats>('/tiers/stats/counts'),
  })
}

export function useCreateTiers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api<Tiers>('/tiers', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiers'] })
      queryClient.invalidateQueries({ queryKey: ['tiers-stats'] })
      queryClient.invalidateQueries({ queryKey: ['search-tiers'] })
    },
  })
}

export function useUpdateTiers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api<Tiers>(`/tiers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tiers'] })
      queryClient.invalidateQueries({ queryKey: ['tiers-detail', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['tiers-stats'] })
    },
  })
}

// ── US-589: TiersOrganisation CRUD ──

export function useLinkOrganisation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tiersId, ...data }: { tiersId: string; organisation_id: string; fonction?: string; est_principal?: boolean }) =>
      api(`/tiers/${tiersId}/organisations`, { method: 'POST', body: JSON.stringify(data) }),
    // Invalidate BOTH sides: the contact's detail and the organisation's detail.
    // The server may have updated the morale's representant_nom on est_principal=true,
    // so the morale's detail must refetch.
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['tiers-detail', v.tiersId] })
      qc.invalidateQueries({ queryKey: ['tiers-detail', v.organisation_id] })
      qc.invalidateQueries({ queryKey: ['tiers'] })
    },
  })
}

export function useUnlinkOrganisation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tiersId, orgId }: { tiersId: string; orgId: string }) =>
      api(`/tiers/${tiersId}/organisations/${orgId}`, { method: 'DELETE' }),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['tiers-detail', v.tiersId] })
      qc.invalidateQueries({ queryKey: ['tiers-detail', v.orgId] })
      qc.invalidateQueries({ queryKey: ['tiers'] })
    },
  })
}

// ── US-806/807/809: Enhanced detail data ──

export function useTiersLots(id: string | undefined) {
  return useQuery({
    queryKey: ['tiers-lots', id],
    queryFn: () => api<{ proprietaire: any[]; mandataire: any[] }>(`/tiers/${id}/lots`),
    enabled: !!id,
  })
}

export function useTiersMissions(id: string | undefined) {
  return useQuery({
    queryKey: ['tiers-missions', id],
    queryFn: () => api<any[]>(`/tiers/${id}/missions`),
    enabled: !!id,
  })
}

export function useTiersEdlHistory(id: string | undefined) {
  return useQuery({
    queryKey: ['tiers-edl', id],
    queryFn: () => api<any[]>(`/tiers/${id}/edl-history`),
    enabled: !!id,
  })
}

export function useSearchTiers(q: string) {
  return useQuery({
    queryKey: ['tiers-search', q],
    queryFn: () => api<ListResponse<Tiers>>(`/tiers?search=${encodeURIComponent(q)}&limit=10`),
    enabled: q.length >= 2,
  })
}
