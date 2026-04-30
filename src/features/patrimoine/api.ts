import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { api } from '../../lib/api-client'
import type { Batiment, BatimentDetail, Lot, LotDetail, ListResponse } from './types'

// ── List batiments ──
interface ListBatimentsParams {
  search?: string
  type?: string
  archived?: boolean
  cursor?: string
  limit?: number
  sort?: 'recent'
}

async function fetchBatiments(params: ListBatimentsParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.search) searchParams.set('search', params.search)
  if (params.type) searchParams.set('type', params.type)
  if (params.archived) searchParams.set('archived', 'true')
  if (params.cursor) searchParams.set('cursor', params.cursor)
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.sort) searchParams.set('sort', params.sort)
  const qs = searchParams.toString()
  return api<ListResponse<Batiment>>(`/batiments${qs ? `?${qs}` : ''}`)
}

export function useBatiments(params: ListBatimentsParams = {}) {
  return useQuery({
    queryKey: ['batiments', params],
    queryFn: () => fetchBatiments(params),
  })
}

export function useBatimentsInfinite(params: Omit<ListBatimentsParams, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: ['batiments', 'infinite', params],
    queryFn: ({ pageParam }) => fetchBatiments({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.meta.has_more ? last.meta.cursor : undefined),
  })
}


// ── Batiment detail ──
export function useBatimentDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['batiment', id],
    queryFn: () => api<BatimentDetail>(`/batiments/${id}`),
    enabled: !!id,
  })
}

// ── Lots for a building (drill-down) ──
export function useBatimentLots(batimentId: string | undefined) {
  return useQuery({
    queryKey: ['batiment-lots', batimentId],
    queryFn: () => api<Lot[]>(`/batiments/${batimentId}/lots`),
    enabled: !!batimentId,
  })
}

// ── Lot detail ──
export function useLotDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['lot', id],
    queryFn: () => api<LotDetail>(`/lots/${id}`),
    enabled: !!id,
  })
}

// ── Create batiment ──
export function useCreateBatiment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api<Batiment>('/batiments', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batiments'] })
    },
  })
}

// ── Update batiment ──
export function useUpdateBatiment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api<Batiment>(`/batiments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batiments'] })
      queryClient.invalidateQueries({ queryKey: ['batiment', variables.id] })
    },
  })
}

// ── Create lot ──
export function useCreateLot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api<Lot>('/lots', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batiments'] })
      queryClient.invalidateQueries({ queryKey: ['batiment-lots'] })
    },
  })
}

// ── Update lot ──
export function useUpdateLot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api<Lot>(`/lots/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batiments'] })
      queryClient.invalidateQueries({ queryKey: ['batiment-lots'] })
      queryClient.invalidateQueries({ queryKey: ['lot', variables.id] })
    },
  })
}

// ── Update address ──
export function useUpdateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ batimentId, adresseId, ...data }: { batimentId: string; adresseId: string; type?: string; rue?: string; complement?: string; code_postal?: string; ville?: string; latitude?: number; longitude?: number }) =>
      api(`/batiments/${batimentId}/adresses/${adresseId}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (_d, v) => {
      queryClient.invalidateQueries({ queryKey: ['batiment', v.batimentId] })
      queryClient.invalidateQueries({ queryKey: ['batiments'] })
    },
  })
}

// ── Add address ──
export function useAddAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ batimentId, ...data }: { batimentId: string } & Record<string, unknown>) =>
      api(`/batiments/${batimentId}/adresses`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batiment'] })
      queryClient.invalidateQueries({ queryKey: ['batiments'] })
    },
  })
}

// ── Delete address ──
export function useDeleteAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ batimentId, adresseId }: { batimentId: string; adresseId: string }) =>
      api(`/batiments/${batimentId}/adresses/${adresseId}`, { method: 'DELETE' }),
    onSuccess: (_d, v) => {
      queryClient.invalidateQueries({ queryKey: ['batiment', v.batimentId] })
      queryClient.invalidateQueries({ queryKey: ['batiments'] })
    },
  })
}

// ── Search tiers ──
export function useSearchTiers(q: string) {
  return useQuery({
    queryKey: ['search-tiers', q],
    queryFn: () => api<Array<{ id: string; nom: string; prenom?: string; raison_sociale?: string; type_personne: string; email?: string }>>(`/lots/search-tiers?q=${encodeURIComponent(q)}`),
    enabled: q.length >= 1,
  })
}

// ── Link proprietaire ──
export function useLinkProprietaire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ lotId, tiersId, estPrincipal }: { lotId: string; tiersId: string; estPrincipal?: boolean }) =>
      api(`/lots/${lotId}/proprietaires`, { method: 'POST', body: JSON.stringify({ tiers_id: tiersId, est_principal: estPrincipal ?? false }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lot'] })
      queryClient.invalidateQueries({ queryKey: ['batiment-lots'] })
    },
  })
}

// ── Unlink proprietaire ──
export function useUnlinkProprietaire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ lotId, tiersId }: { lotId: string; tiersId: string }) =>
      api(`/lots/${lotId}/proprietaires/${tiersId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lot'] })
      queryClient.invalidateQueries({ queryKey: ['batiment-lots'] })
    },
  })
}
