import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api-client'

export interface DashboardStats {
  edl_month: number
  pending_actions: number
  upcoming_7d: number
  today: number
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api<DashboardStats>('/dashboard/stats'),
    refetchInterval: 30_000,
  })
}

export function useMonthSummary(year: number, month: number) {
  return useQuery({
    queryKey: ['dashboard-month-summary', year, month],
    queryFn: () => api<Record<string, number>>(`/dashboard/month-summary?year=${year}&month=${month}`),
  })
}
