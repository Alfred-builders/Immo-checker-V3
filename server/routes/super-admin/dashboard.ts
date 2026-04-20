import { Router } from 'express'
import { query } from '../../db/index.js'
import { sendSuccess, sendError } from '../../utils/response.js'

const router = Router()

// GET /api/super-admin/dashboard/stats
router.get('/stats', async (_req, res) => {
  try {
    const result = await query(
      `SELECT
         (SELECT COUNT(*)::int FROM workspace) AS workspaces_total,
         (SELECT COUNT(*)::int FROM workspace WHERE statut = 'actif') AS workspaces_actifs,
         (SELECT COUNT(*)::int FROM workspace WHERE statut = 'suspendu') AS workspaces_suspendus,
         (SELECT COUNT(*)::int FROM workspace WHERE statut = 'trial') AS workspaces_trial,
         (SELECT COUNT(*)::int FROM utilisateur) AS users_total,
         (SELECT COUNT(*)::int FROM utilisateur WHERE last_login_at > now() - interval '30 days') AS users_mau,
         (SELECT COUNT(*)::int FROM utilisateur WHERE is_super_admin = true) AS super_admins_count,
         (SELECT COUNT(*)::int FROM invitation WHERE accepted_at IS NULL AND expires_at > now()) AS invitations_pending,
         (SELECT COUNT(*)::int FROM mission WHERE est_archive = false) AS missions_total,
         (SELECT COUNT(*)::int FROM edl_inventaire WHERE statut = 'signe') AS edl_signed_total,
         (SELECT COUNT(*)::int FROM workspace WHERE created_at > now() - interval '30 days') AS workspaces_created_30d,
         (SELECT COUNT(*)::int FROM utilisateur WHERE created_at > now() - interval '30 days') AS users_created_30d`
    )
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/super-admin/dashboard/trends — daily series for charts
router.get('/trends', async (_req, res) => {
  try {
    // 30-day daily series for workspaces + users created
    const series = await query(
      `WITH days AS (
         SELECT generate_series(
           (CURRENT_DATE - interval '29 days')::date,
           CURRENT_DATE,
           interval '1 day'
         )::date AS day
       ),
       ws AS (
         SELECT created_at::date AS day, COUNT(*)::int AS n
         FROM workspace
         WHERE created_at >= CURRENT_DATE - interval '29 days'
         GROUP BY created_at::date
       ),
       us AS (
         SELECT created_at::date AS day, COUNT(*)::int AS n
         FROM utilisateur
         WHERE created_at >= CURRENT_DATE - interval '29 days'
         GROUP BY created_at::date
       )
       SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
              COALESCE(ws.n, 0) AS workspaces,
              COALESCE(us.n, 0) AS users
       FROM days d
       LEFT JOIN ws ON ws.day = d.day
       LEFT JOIN us ON us.day = d.day
       ORDER BY d.day`
    )

    // Distribution by workspace type
    const byType = await query(
      `SELECT type_workspace, COUNT(*)::int AS count
       FROM workspace
       GROUP BY type_workspace
       ORDER BY count DESC`
    )

    // Distribution by workspace statut
    const byStatut = await query(
      `SELECT statut, COUNT(*)::int AS count
       FROM workspace
       GROUP BY statut
       ORDER BY count DESC`
    )

    // Top 5 active workspaces by mission count
    const topActive = await query(
      `SELECT w.id, w.nom, w.type_workspace,
              COUNT(m.id)::int AS missions_count
       FROM workspace w
       LEFT JOIN mission m ON m.workspace_id = w.id AND m.created_at > now() - interval '30 days'
       GROUP BY w.id, w.nom, w.type_workspace
       ORDER BY missions_count DESC
       LIMIT 5`
    )

    sendSuccess(res, {
      daily: series.rows,
      by_type: byType.rows,
      by_statut: byStatut.rows,
      top_active: topActive.rows,
    })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
