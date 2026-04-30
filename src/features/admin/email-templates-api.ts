import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from 'src/lib/api-client'

export interface EmailTemplateVariable {
  name: string
  description: string
  example: string
}

export interface EmailTemplateListItem {
  code: string
  label: string
  description: string
  sujet: string
  is_custom: boolean
  updated_at: string | null
  variables: EmailTemplateVariable[]
}

export interface EmailTemplateDetail {
  code: string
  label: string
  description: string
  sujet: string
  body_html: string
  source: 'workspace' | 'default'
  variables: EmailTemplateVariable[]
}

export interface EmailTemplatePreview {
  sujet: string
  body_html: string
}

export function useEmailTemplates() {
  return useQuery({
    queryKey: ['email-templates'],
    queryFn: () => api<EmailTemplateListItem[]>('/email-templates'),
  })
}

export function useEmailTemplate(code: string | null) {
  return useQuery({
    queryKey: ['email-template', code],
    queryFn: () => api<EmailTemplateDetail>(`/email-templates/${code}`),
    enabled: !!code,
  })
}

export function useUpdateEmailTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ code, sujet, body_html }: { code: string; sujet: string; body_html: string }) =>
      api(`/email-templates/${code}`, { method: 'PUT', body: JSON.stringify({ sujet, body_html }) }),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['email-templates'] })
      qc.invalidateQueries({ queryKey: ['email-template', v.code] })
    },
  })
}

export function useResetEmailTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => api(`/email-templates/${code}`, { method: 'DELETE' }),
    onSuccess: (_d, code) => {
      qc.invalidateQueries({ queryKey: ['email-templates'] })
      qc.invalidateQueries({ queryKey: ['email-template', code] })
    },
  })
}

/** Demande au serveur de rendre le template avec les valeurs de démo + le draft
 * en cours d'édition (sujet/body) — utilisé pour l'aperçu live. */
export async function previewEmailTemplate(
  code: string,
  payload: { draft_sujet?: string; draft_body_html?: string; variables?: Record<string, string> }
): Promise<EmailTemplatePreview> {
  return api<EmailTemplatePreview>(`/email-templates/${code}/preview`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
