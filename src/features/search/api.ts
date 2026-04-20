import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { api } from 'src/lib/api-client'
import { useAuth } from 'src/hooks/use-auth'
import type { SearchResponse } from './types'

export function useGlobalSearch(query: string) {
  const { workspace } = useAuth()
  const trimmed = query.trim()
  const enabled = trimmed.length >= 1

  return useQuery({
    queryKey: ['global-search', workspace?.id, trimmed],
    queryFn: () => api<SearchResponse>(`/search?q=${encodeURIComponent(trimmed)}`),
    enabled,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    retry: false,
  })
}
