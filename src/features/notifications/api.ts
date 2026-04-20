import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { api } from '../../lib/api-client'

export type NotificationType =
  | 'edl_signed'
  | 'edl_infructueux'
  | 'mission_created'
  | 'mission_cancelled'
  | 'mission_completed'
  | 'technicien_accepted'
  | 'technicien_refused'
  | 'invitation_accepted'
  | 'invitation_expired'
  | 'password_changed'
  | 'user_deactivated'

export interface Notification {
  id: string
  type: NotificationType | string
  titre: string
  message: string | null
  lien: string | null
  est_lu: boolean
  created_at: string
  read_at: string | null
}

interface ListResponse {
  data: Notification[]
  meta: { cursor?: string; has_more: boolean }
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api<{ count: number }>('/notifications/unread-count'),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  })
}

export function useRecentNotifications(limit = 10) {
  return useQuery({
    queryKey: ['notifications', 'recent', limit],
    queryFn: () => api<ListResponse>(`/notifications?limit=${limit}`),
    refetchInterval: 60_000,
    staleTime: 20_000,
  })
}

export function useNotificationsList(unreadOnly: boolean) {
  return useInfiniteQuery({
    queryKey: ['notifications', 'list', unreadOnly],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams()
      params.set('limit', '20')
      if (unreadOnly) params.set('unread_only', 'true')
      if (pageParam) params.set('cursor', pageParam as string)
      return api<ListResponse>(`/notifications?${params.toString()}`)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.meta.has_more ? last.meta.cursor : undefined),
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api(`/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api<{ marked_read: number }>('/notifications/mark-all-read', { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useDismissNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api(`/notifications/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
