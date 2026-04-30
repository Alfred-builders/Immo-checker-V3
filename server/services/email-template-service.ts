// Service de rendu et d'envoi des templates d'email transactionnels.
// - Lit le template du workspace en DB (table email_template)
// - Fallback sur DEFAULT_TEMPLATES (defaults codés en TS) si aucun custom
// - Substitue les variables {{xxx}} (escape HTML par défaut)
// - Wrap dans le shell email-safe partagé (header + footer)
// - Envoie via Resend si configuré, sinon log
//
// Toute erreur d'envoi est attrapée et logguée — un mail qui échoue ne doit
// jamais bloquer la transaction métier (création/modif mission).

import { Resend } from 'resend'
import { query } from '../db/index.js'
import { DEFAULT_TEMPLATES, type EmailTemplateCode, type DefaultTemplate } from './email-templates.js'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL = process.env.FROM_EMAIL || 'ImmoChecker <onboarding@resend.dev>'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const BRAND = {
  primary: '#2d526c',
  primaryDark: '#1a3344',
  bg: '#FAF8F5',
  card: '#FFFFFF',
  border: '#EAE6E0',
  text: '#1a1a1a',
  subtle: '#8a8680',
} as const

export interface RenderedTemplate {
  sujet: string
  body_html: string
}

export interface ResolvedTemplate extends DefaultTemplate {
  source: 'workspace' | 'default'
  /** Si workspace : id de la ligne email_template. */
  template_id?: string
}

/* ── Resolve : DB workspace > default codé en TS ── */
export async function resolveTemplate(workspaceId: string, code: EmailTemplateCode): Promise<ResolvedTemplate> {
  const row = await query(
    `SELECT id, sujet, body_html FROM email_template
     WHERE workspace_id = $1 AND code = $2 LIMIT 1`,
    [workspaceId, code]
  )
  const fallback = DEFAULT_TEMPLATES[code]
  if (row.rows.length === 0) {
    return { ...fallback, source: 'default' }
  }
  return {
    ...fallback,
    sujet: row.rows[0].sujet,
    body_html: row.rows[0].body_html,
    source: 'workspace',
    template_id: row.rows[0].id,
  }
}

/* ── Substitution {{var}} avec escape HTML par défaut ── */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/** Substitue {{var}} dans une string. Les valeurs string sont HTML-escaped. */
function substitute(template: string, vars: Record<string, string | undefined | null>, opts: { escape: boolean }): string {
  return template.replace(/\{\{\s*([\w_]+)\s*\}\}/g, (_, name) => {
    const raw = vars[name]
    if (raw === undefined || raw === null) return ''
    return opts.escape ? escapeHtml(String(raw)) : String(raw)
  })
}

/** Rend sujet + HTML complet (avec shell) pour un template, en utilisant les
 * variables fournies. Le sujet est en plain-text (pas d'escape HTML), le body
 * subit l'escape sur les valeurs interpolées. */
export async function renderTemplate(
  workspaceId: string,
  code: EmailTemplateCode,
  vars: Record<string, string | undefined | null>,
): Promise<RenderedTemplate> {
  const t = await resolveTemplate(workspaceId, code)
  const sujet = substitute(t.sujet, vars, { escape: false })
  const body = substitute(t.body_html, vars, { escape: true })
  const html = renderShell({
    preheader: sujet,
    body: `<div style="color:${BRAND.text};font-size:15px;line-height:1.6;">${body}</div>`,
  })
  return { sujet, body_html: html }
}

/** Envoie un mail templaté. Catch silencieux : retourne false en cas d'échec
 * (toujours fire-and-forget côté appelant). */
export async function sendTemplated(
  workspaceId: string,
  code: EmailTemplateCode,
  to: string | string[],
  vars: Record<string, string | undefined | null>,
): Promise<boolean> {
  try {
    const { sujet, body_html } = await renderTemplate(workspaceId, code, vars)
    if (!resend) {
      console.log(`[email] (Resend not configured) ${code} → ${Array.isArray(to) ? to.join(', ') : to} — "${sujet}"`)
      return true
    }
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: sujet,
      html: body_html,
    })
    return true
  } catch (err) {
    console.error(`[email] sendTemplated ${code} failed:`, err)
    return false
  }
}

/* ── Helpers de variables (formatage standardisé) ── */
export function formatDateLong(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch { return '' }
}

export function formatHeure(t: string | null | undefined): string {
  if (!t) return ''
  return t.slice(0, 5) // "HH:MM:SS" → "HH:MM"
}

/* ── Shell email-safe (mêmes tokens que email-service.ts pour cohérence) ── */
function renderShell({ preheader, body }: { preheader: string; body: string }): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light only">
<title>ImmoChecker</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:'Nunito Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${BRAND.text};-webkit-font-smoothing:antialiased;">
<span style="display:none!important;visibility:hidden;mso-hide:all;font-size:1px;color:${BRAND.bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bg};">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;">

<tr><td style="background:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.primaryDark} 100%);background-color:${BRAND.primary};padding:28px 40px;border-radius:16px 16px 0 0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.015em;">ImmoChecker</td></tr>

<tr><td style="background-color:${BRAND.card};padding:32px 40px;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};">
${body}
</td></tr>

<tr><td style="background-color:${BRAND.card};padding:0 40px 28px;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};border-bottom:1px solid ${BRAND.border};border-radius:0 0 16px 16px;">
<div style="border-top:1px solid ${BRAND.border};padding-top:20px;color:${BRAND.subtle};font-size:12px;line-height:18px;">
© ${new Date().getFullYear()} ImmoChecker — Gérez vos états des lieux en toute simplicité.<br>
Si vous n'attendiez pas cet email, vous pouvez l'ignorer en toute sécurité.
</div>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}
