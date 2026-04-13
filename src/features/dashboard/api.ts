import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api-client'

export interface DashboardStats {
  edl_month: number
  pending_actions: number
  upcoming_7d: number
  today: number
  completed_month: number
  total_month: number
}

export interface DashboardActivity {
  daily: Array<{ date: string; entrees: number; sorties: number }>
  monthly: Array<{ month: string; planifiees: number; terminees: number }>
  statuts: Record<string, number>
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api<DashboardStats>('/dashboard/stats'),
    refetchInterval: 30_000,
    retry: false,
  })
}

export function useDashboardActivity(range: '7j' | '30j' | '90j' = '30j') {
  const days = range === '7j' ? 7 : range === '90j' ? 90 : 30
  return useQuery({
    queryKey: ['dashboard-activity', range],
    queryFn: () => api<DashboardActivity>(`/dashboard/activity?range=${days}`),
    staleTime: 2 * 60_000,
    retry: false,
  })
}

export function useMonthSummary(year: number, month: number) {
  return useQuery({
    queryKey: ['dashboard-month-summary', year, month],
    queryFn: () => api<Record<string, number>>(`/dashboard/month-summary?year=${year}&month=${month}`),
    retry: false,
  })
}
