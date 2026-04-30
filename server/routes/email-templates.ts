// API admin pour personnaliser les templates d'emails par workspace.
// Cadrage FC §6 — page "Modèles d'emails" dans Paramètres.
//
// GET    /api/email-templates              — liste les 4 templates avec leur
//                                            statut (default ou personnalisé)
// GET    /api/email-templates/:code        — détail d'un template (résolu)
// PUT    /api/email-templates/:code        — enregistre un override workspace
// DELETE /api/email-templates/:code        — supprime l'override (revient au default)
// POST   /api/email-templates/:code/preview — rend le template avec valeurs démo

import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../db/index.js'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { AppError } from '../utils/errors.js'
import { DEFAULT_TEMPLATES, TEMPLATE_CODES, type EmailTemplateCode } from '../services/email-templates.js'
import { renderTemplate, resolveTemplate } from '../services/email-template-service.js'

const router = Router()
router.use(verifyToken)
router.use(requireRole('admin'))

function isValidCode(code: string): code is EmailTemplateCode {
  return (TEMPLATE_CODES as readonly string[]).includes(code)
}

// GET /api/email-templates — liste tous les templates avec source (default/workspace)
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const overrides = await query(
      `SELECT code, sujet, body_html, updated_at FROM email_template WHERE workspace_id = $1`,
      [workspaceId]
    )
    const overrideMap = new Map<string, { sujet: string; body_html: string; updated_at: string }>()
    for (const r of overrides.rows) overrideMap.set(r.code, r)

    const list = TEMPLATE_CODES.map((code) => {
      const def = DEFAULT_TEMPLATES[code]
      const ov = overrideMap.get(code)
      return {
        code,
        label: def.label,
        description: def.description,
        sujet: ov?.sujet ?? def.sujet,
        is_custom: !!ov,
        updated_at: ov?.updated_at ?? null,
        variables: def.variables,
      }
    })
    sendSuccess(res, list)
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/email-templates/:code — détail (résolu = workspace si custom, sinon default)
router.get('/:code', async (req, res) => {
  try {
    const code = req.params.code as string
    if (!isValidCode(code)) throw new AppError('Code template inconnu', 'INVALID_CODE', 404)
    const workspaceId = req.user!.workspaceId
    const t = await resolveTemplate(workspaceId, code)
    sendSuccess(res, {
      code: t.code,
      label: t.label,
      description: t.description,
      sujet: t.sujet,
      body_html: t.body_html,
      source: t.source,
      variables: t.variables,
    })
  } catch (error) {
    sendError(res, error)
  }
})

// PUT /api/email-templates/:code — upsert override workspace
const upsertSchema = z.object({
  sujet: z.string().min(1, 'Sujet requis').max(255),
  body_html: z.string().min(1, 'Contenu requis'),
})

router.put('/:code', validate(upsertSchema), async (req, res) => {
  try {
    const code = req.params.code as string
    if (!isValidCode(code)) throw new AppError('Code template inconnu', 'INVALID_CODE', 404)
    const workspaceId = req.user!.workspaceId
    const { sujet, body_html } = req.body
    const def = DEFAULT_TEMPLATES[code]

    const r = await query(
      `INSERT INTO email_template (workspace_id, code, sujet, body_html, variables_dispo)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       ON CONFLICT (workspace_id, code) DO UPDATE
         SET sujet = EXCLUDED.sujet,
             body_html = EXCLUDED.body_html,
             updated_at = now()
       RETURNING id, sujet, body_html, updated_at`,
      [workspaceId, code, sujet, body_html, JSON.stringify(def.variables.map((v) => v.name))]
    )
    sendSuccess(res, r.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// DELETE /api/email-templates/:code — supprime l'override → revient au default
router.delete('/:code', async (req, res) => {
  try {
    const code = req.params.code as string
    if (!isValidCode(code)) throw new AppError('Code template inconnu', 'INVALID_CODE', 404)
    const workspaceId = req.user!.workspaceId
    await query(`DELETE FROM email_template WHERE workspace_id = $1 AND code = $2`, [workspaceId, code])
    sendSuccess(res, { reset: true })
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/email-templates/:code/preview — rendu avec variables (de démo ou
// fournies) pour aperçu live dans l'éditeur.
const previewSchema = z.object({
  // Optionnel : valeurs custom pour l'aperçu. Sinon on prend les exemples du défaut.
  variables: z.record(z.string(), z.string()).optional(),
  // Optionnel : sujet/body en cours d'édition (pas encore sauvegardé).
  draft_sujet: z.string().optional(),
  draft_body_html: z.string().optional(),
})

router.post('/:code/preview', validate(previewSchema), async (req, res) => {
  try {
    const code = req.params.code as string
    if (!isValidCode(code)) throw new AppError('Code template inconnu', 'INVALID_CODE', 404)
    const workspaceId = req.user!.workspaceId
    const def = DEFAULT_TEMPLATES[code]

    // Variables de démo : exemples du défaut, écrasés par celles fournies.
    const exampleVars: Record<string, string> = {}
    for (const v of def.variables) exampleVars[v.name] = v.example
    const finalVars = { ...exampleVars, ...(req.body.variables ?? {}) }

    // Si l'admin fournit un draft, on l'enregistre temporairement en mémoire pour
    // le render — pas de persistance. Sinon on lit le résolu.
    if (req.body.draft_sujet || req.body.draft_body_html) {
      const t = await resolveTemplate(workspaceId, code)
      const tempT = {
        ...t,
        sujet: req.body.draft_sujet ?? t.sujet,
        body_html: req.body.draft_body_html ?? t.body_html,
      }
      // Render manuel via une closure pour ne pas écrire en DB
      // On ré-utilise la logique de renderTemplate mais avec valeurs forcées.
      const subst = (s: string, escape: boolean) =>
        s.replace(/\{\{\s*([\w_]+)\s*\}\}/g, (_, n) => {
          const raw = finalVars[n]
          if (raw === undefined) return ''
          return escape
            ? String(raw).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
            : String(raw)
        })
      const renderedSujet = subst(tempT.sujet, false)
      const renderedBody = subst(tempT.body_html, true)
      // On ne wrap pas dans le shell pour l'aperçu — l'admin voit le contenu pur.
      sendSuccess(res, { sujet: renderedSujet, body_html: renderedBody })
      return
    }

    // Pas de draft : render via le service standard (avec shell complet).
    const out = await renderTemplate(workspaceId, code, finalVars)
    sendSuccess(res, out)
  } catch (error) {
    sendError(res, error)
  }
})

export default router
