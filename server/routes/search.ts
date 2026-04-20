import { Router } from 'express'
import { query } from '../db/index.js'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { AppError } from '../utils/errors.js'

const router = Router()
router.use(verifyToken)
router.use(requireRole('admin', 'gestionnaire'))

const PER_CATEGORY_LIMIT = 5

// Escape LIKE wildcards in user input so `50%` doesn't behave as a pattern.
function escapeLikePattern(raw: string): string {
  return raw.replace(/[\\%_]/g, (c) => `\\${c}`)
}

// GET /api/search?q=...
// Returns at most PER_CATEGORY_LIMIT results per category (batiments, lots, tiers, missions).
// Cross-entity: tiers matches propagate to lots/missions via their relations.
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const raw = typeof req.query.q === 'string' ? req.query.q.trim() : ''

    if (raw.length < 1) {
      throw new AppError('La recherche ne peut pas être vide', 'SEARCH_QUERY_EMPTY', 400)
    }
    if (raw.length > 100) {
      throw new AppError('Recherche trop longue (100 caractères max)', 'SEARCH_QUERY_TOO_LONG', 400)
    }

    const pattern = `%${escapeLikePattern(raw)}%`
    const fetchLimit = PER_CATEGORY_LIMIT + 1 // +1 to detect has_more

    const sql = `
      WITH
        b AS (
          SELECT b.id, b.designation, b.type,
                 ab.rue || ', ' || ab.code_postal || ' ' || ab.ville AS adresse,
                 (SELECT count(*)::int FROM lot l WHERE l.batiment_id = b.id AND l.est_archive = false) AS nb_lots
          FROM batiment b
          LEFT JOIN adresse_batiment ab ON ab.batiment_id = b.id AND ab.type = 'principale'
          WHERE b.workspace_id = $1
            AND b.est_archive = false
            AND (b.designation ILIKE $2 ESCAPE '\\'
              OR ab.rue ILIKE $2 ESCAPE '\\'
              OR ab.ville ILIKE $2 ESCAPE '\\'
              OR ab.code_postal ILIKE $2 ESCAPE '\\')
          ORDER BY b.designation
          LIMIT $3
        ),
        l AS (
          SELECT l.id, l.designation, l.type_bien, l.etage,
                 bb.designation AS batiment_designation
          FROM lot l
          JOIN batiment bb ON bb.id = l.batiment_id
          WHERE l.workspace_id = $1
            AND l.est_archive = false
            AND (l.designation ILIKE $2 ESCAPE '\\'
              OR l.reference_interne ILIKE $2 ESCAPE '\\'
              OR bb.designation ILIKE $2 ESCAPE '\\'
              OR EXISTS (
                SELECT 1 FROM lot_proprietaire lp
                JOIN tiers tp ON tp.id = lp.tiers_id
                WHERE lp.lot_id = l.id
                  AND (tp.nom ILIKE $2 ESCAPE '\\'
                    OR tp.prenom ILIKE $2 ESCAPE '\\'
                    OR tp.raison_sociale ILIKE $2 ESCAPE '\\')
              )
              OR EXISTS (
                SELECT 1 FROM tiers tm
                WHERE tm.id = l.mandataire_id
                  AND (tm.nom ILIKE $2 ESCAPE '\\'
                    OR tm.prenom ILIKE $2 ESCAPE '\\'
                    OR tm.raison_sociale ILIKE $2 ESCAPE '\\')
              ))
          ORDER BY l.designation
          LIMIT $3
        ),
        t AS (
          SELECT t.id, t.nom, t.prenom, t.raison_sociale, t.type_personne, t.email
          FROM tiers t
          WHERE t.workspace_id = $1
            AND t.est_archive = false
            AND (t.nom ILIKE $2 ESCAPE '\\'
              OR t.prenom ILIKE $2 ESCAPE '\\'
              OR t.raison_sociale ILIKE $2 ESCAPE '\\'
              OR t.email ILIKE $2 ESCAPE '\\'
              OR t.tel ILIKE $2 ESCAPE '\\')
          ORDER BY t.nom, t.prenom NULLS FIRST
          LIMIT $3
        ),
        m AS (
          SELECT m.id, m.reference, m.date_planifiee, m.statut,
                 l2.designation AS lot_designation
          FROM mission m
          JOIN lot l2 ON l2.id = m.lot_id
          WHERE m.workspace_id = $1
            AND m.est_archive = false
            AND m.statut != 'annulee'
            AND (m.reference ILIKE $2 ESCAPE '\\'
              OR l2.designation ILIKE $2 ESCAPE '\\'
              OR EXISTS (
                SELECT 1 FROM lot_proprietaire lp
                JOIN tiers tp ON tp.id = lp.tiers_id
                WHERE lp.lot_id = l2.id
                  AND (tp.nom ILIKE $2 ESCAPE '\\'
                    OR tp.prenom ILIKE $2 ESCAPE '\\'
                    OR tp.raison_sociale ILIKE $2 ESCAPE '\\')
              )
              OR EXISTS (
                SELECT 1 FROM edl_inventaire ei
                JOIN edl_locataire el ON el.edl_id = ei.id
                JOIN tiers tl ON tl.id = el.tiers_id
                WHERE ei.mission_id = m.id
                  AND (tl.nom ILIKE $2 ESCAPE '\\'
                    OR tl.prenom ILIKE $2 ESCAPE '\\'
                    OR tl.raison_sociale ILIKE $2 ESCAPE '\\')
              )
              OR EXISTS (
                SELECT 1 FROM tiers tma
                WHERE tma.id = l2.mandataire_id
                  AND (tma.nom ILIKE $2 ESCAPE '\\'
                    OR tma.prenom ILIKE $2 ESCAPE '\\'
                    OR tma.raison_sociale ILIKE $2 ESCAPE '\\')
              ))
          ORDER BY m.date_planifiee DESC NULLS LAST
          LIMIT $3
        )
      SELECT
        COALESCE((SELECT json_agg(row_to_json(b.*)) FROM b), '[]'::json) AS batiments,
        COALESCE((SELECT json_agg(row_to_json(l.*)) FROM l), '[]'::json) AS lots,
        COALESCE((SELECT json_agg(row_to_json(t.*)) FROM t), '[]'::json) AS tiers,
        COALESCE((SELECT json_agg(row_to_json(m.*)) FROM m), '[]'::json) AS missions
    `

    const result = await query(sql, [workspaceId, pattern, fetchLimit])
    const row = result.rows[0] ?? { batiments: [], lots: [], tiers: [], missions: [] }

    const batiments = (row.batiments as any[]) ?? []
    const lots = (row.lots as any[]) ?? []
    const tiers = (row.tiers as any[]) ?? []
    const missions = (row.missions as any[]) ?? []

    const hasMore = {
      batiments: batiments.length > PER_CATEGORY_LIMIT,
      lots: lots.length > PER_CATEGORY_LIMIT,
      tiers: tiers.length > PER_CATEGORY_LIMIT,
      missions: missions.length > PER_CATEGORY_LIMIT,
    }

    const trimmed = {
      batiments: batiments.slice(0, PER_CATEGORY_LIMIT),
      lots: lots.slice(0, PER_CATEGORY_LIMIT),
      tiers: tiers.slice(0, PER_CATEGORY_LIMIT),
      missions: missions.slice(0, PER_CATEGORY_LIMIT),
    }

    sendSuccess(res, {
      query: raw,
      results: trimmed,
      meta: {
        total_returned:
          trimmed.batiments.length + trimmed.lots.length + trimmed.tiers.length + trimmed.missions.length,
        has_more: hasMore,
      },
    })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
