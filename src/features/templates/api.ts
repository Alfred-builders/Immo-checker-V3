import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from 'src/lib/api-client'
import type {
  TypePiece, CatalogueItem, CatalogueItemDetail,
  TemplatePieceItem, ConfigCritereCategorie, ConfigCritereItem,
  ValeurReferentiel, CatalogueContexte, CatalogueCategorie,
  NiveauExigence, CritereEvaluation,
} from './types'

// ── Type Pieces (US-832) ──

export function useTypePieces() {
  return useQuery({
    queryKey: ['type-pieces'],
    queryFn: () => api<TypePiece[]>('/type-pieces'),
  })
}

export function useTypePieceDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['type-pieces', id],
    queryFn: () => api<TypePiece & { items: (TemplatePieceItem & { item: CatalogueItem })[] }>(`/type-pieces/${id}`),
    enabled: !!id,
  })
}

export function useCreateTypePiece() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { nom: string; categorie_piece: string; icon: string }) =>
      api<TypePiece>('/type-pieces', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['type-pieces'] }),
  })
}

export function useUpdateTypePiece() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; nom?: string; icon?: string; ordre_affichage?: number }) =>
      api<TypePiece>(`/type-pieces/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['type-pieces'] }),
  })
}

export function useArchiveTypePiece() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api(`/type-pieces/${id}/archive`, { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['type-pieces'] }),
  })
}

// ── Catalogue Items (US-835) ──

export function useCatalogueItems(params?: { contexte?: CatalogueContexte; categorie?: CatalogueCategorie; search?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.contexte) searchParams.set('contexte', params.contexte)
  if (params?.categorie) searchParams.set('categorie', params.categorie)
  if (params?.search) searchParams.set('search', params.search)
  const qs = searchParams.toString()

  return useQuery({
    queryKey: ['catalogue-items', params],
    queryFn: () => api<CatalogueItem[]>(`/catalogue-items${qs ? `?${qs}` : ''}`),
  })
}

export function useCatalogueItemDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['catalogue-items', id],
    queryFn: () => api<CatalogueItemDetail>(`/catalogue-items/${id}`),
    enabled: !!id,
  })
}

export function useCreateCatalogueItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { nom: string; categorie: CatalogueCategorie; contexte: CatalogueContexte; parent_item_id?: string; aide_contextuelle?: string }) =>
      api<CatalogueItem>('/catalogue-items', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalogue-items'] }),
  })
}

export function useUpdateCatalogueItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; nom?: string; aide_contextuelle?: string; ordre_affichage?: number }) =>
      api<CatalogueItem>(`/catalogue-items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalogue-items'] }),
  })
}

export function useArchiveCatalogueItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api(`/catalogue-items/${id}/archive`, { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalogue-items'] }),
  })
}

// ── Valeur Referentiel / Tags (US-835) ──

export function useItemValeurs(itemId: string | undefined) {
  return useQuery({
    queryKey: ['catalogue-items', itemId, 'valeurs'],
    queryFn: () => api<ValeurReferentiel[]>(`/catalogue-items/${itemId}/valeurs`),
    enabled: !!itemId,
  })
}

export function useAddItemValeur() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, ...data }: { itemId: string; critere: string; valeur: string }) =>
      api<ValeurReferentiel>(`/catalogue-items/${itemId}/valeurs`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['catalogue-items', vars.itemId] }),
  })
}

export function useRemoveItemValeur() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, valeurId }: { itemId: string; valeurId: string }) =>
      api(`/catalogue-items/${itemId}/valeurs/${valeurId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalogue-items'] }),
  })
}

// ── Template Piece-Items (US-833) ──

export function useTemplatePieceItems(typePieceId: string | undefined) {
  return useQuery({
    queryKey: ['template-items', typePieceId],
    queryFn: () => api<(TemplatePieceItem & { item: CatalogueItem })[]>(`/templates/pieces/${typePieceId}/items`),
    enabled: !!typePieceId,
  })
}

export function useLinkPieceItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ typePieceId, ...data }: { typePieceId: string; catalogue_item_id: string; quantite_defaut?: number; labels_defaut?: string[] }) =>
      api(`/templates/pieces/${typePieceId}/items`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['template-items', vars.typePieceId] }),
  })
}

export function useUpdatePieceItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ typePieceId, itemId, ...data }: { typePieceId: string; itemId: string; quantite_defaut?: number; labels_defaut?: string[]; ordre_affichage?: number }) =>
      api(`/templates/pieces/${typePieceId}/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['template-items', vars.typePieceId] }),
  })
}

export function useUnlinkPieceItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ typePieceId, itemId }: { typePieceId: string; itemId: string }) =>
      api(`/templates/pieces/${typePieceId}/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['template-items', vars.typePieceId] }),
  })
}

// ── Config Criteres (US-834) ──

export function useConfigCriteres(contexte?: CatalogueContexte) {
  return useQuery({
    queryKey: ['config-criteres', contexte],
    queryFn: () => api<ConfigCritereCategorie[]>(`/templates/criteres${contexte ? `?contexte=${contexte}` : ''}`),
  })
}

export function useUpdateConfigCritere() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ categorie, contexte, ...data }: { categorie: CatalogueCategorie; contexte: CatalogueContexte } & Partial<Record<CritereEvaluation, NiveauExigence>>) =>
      api(`/templates/criteres/${categorie}`, { method: 'PATCH', body: JSON.stringify({ contexte, ...data }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['config-criteres'] }),
  })
}

export function useItemCritereOverrides(itemId: string | undefined) {
  return useQuery({
    queryKey: ['config-criteres', 'items', itemId],
    queryFn: () => api<ConfigCritereItem[]>(`/templates/criteres/items/${itemId}`),
    enabled: !!itemId,
  })
}

export function useSetItemCritereOverride() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, critere, niveau_exigence }: { itemId: string; critere: CritereEvaluation; niveau_exigence: NiveauExigence }) =>
      api(`/templates/criteres/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ critere, niveau_exigence }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['config-criteres'] }),
  })
}

export function useResetItemCritereOverride() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, critere }: { itemId: string; critere: CritereEvaluation }) =>
      api(`/templates/criteres/items/${itemId}/${critere}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['config-criteres'] }),
  })
}
