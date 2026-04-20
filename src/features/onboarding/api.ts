import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api-client'

export interface OnboardingStatus {
  completed_at: string | null
  current_step: number
  skipped_steps: string[]
  can_skip_express: boolean
}

export function useOnboardingStatus() {
  return useQuery<OnboardingStatus>({
    queryKey: ['onboarding', 'status'],
    queryFn: () => api('/users/me/onboarding-status'),
  })
}

type UpdatePayload =
  | { action: 'advance'; step: number }
  | { action: 'skip'; skipped_step: number }
  | { action: 'complete' }
  | { action: 'reset' }

export function useUpdateOnboarding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdatePayload) =>
      api<OnboardingStatus>('/users/me/onboarding', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onboarding'] })
    },
  })
}
