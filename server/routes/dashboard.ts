import { Router } from 'express'
import { query } from '../db/index.js'
import { verifyToken } from '../middleware/auth.js'
import { sendSuccess, sendError } from '../utils/response.js'

const router = Router()
router.use(verifyToken)

// GET /api/dashboard/stats — Dashboard stat cards
router.get('/stats', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const today = new Date().toISOString().split('T')[0]
    const firstOfMonth = `${today.slice(0, 7)}-01`
    const in7days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

    const result = await query(
      `SELECT
        (SELECT count(*) FROM edl_inventaire WHERE workspace_id = $1 AND created_at >= $2)::int as edl_month,
        (SELECT count(*) FROM mission m
         WHERE m.workspace_id = $1 AND m.statut IN ('planifiee', 'assignee')
           AND (
             NOT EXISTS (SELECT 1 FROM mission_technicien mt WHERE mt.mission_id = m.id)
             OR EXISTS (SELECT 1 FROM mission_technicien mt WHERE mt.mission_id = m.id AND mt.statut_invitation != 'accepte')
             OR m.statut_rdv = 'a_confirmer'
           )
        )::int as pending_actions,
        (SELECT count(*) FROM mission
         WHERE workspace_id = $1 AND statut IN ('planifiee', 'assignee')
           AND date_planifiee BETWEEN $3 AND $4
        )::int as upcoming_7d,
        (SELECT count(*) FROM mission
         WHERE workspace_id = $1 AND statut != 'annulee'
           AND date_planifiee::date = $3::date
        )::int as today,
        (SELECT count(*) FROM mission
         WHERE workspace_id = $1 AND statut = 'terminee'
           AND date_planifiee >= $2
        )::int as completed_month,
        (SELECT count(*) FROM mission
         WHERE workspace_id = $1 AND statut != 'annulee'
           AND date_planifiee >= $2
        )::int as total_month`,
      [workspaceId, firstOfMonth, today, in7days]
    )

    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/dashboard/month-summary — Mission counts per day for a month
router.get('/month-summary', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const yearRaw = parseInt(req.query.year as string)
    const monthRaw = parseInt(req.query.month as string)

    const now = new Date()
    const year = isNaN(yearRaw) ? now.getFullYear() : yearRaw
    const month = isNaN(monthRaw) ? now.getMonth() + 1 : monthRaw

    if (month < 1 || month > 12) {
      sendError(res, { status: 400, message: 'Mois invalide (1-12)', code: 'VALIDATION_ERROR' })
      return
    }
    if (year < 2000 || year > 2100) {
      sendError(res, { status: 400, message: 'Année invalide', code: 'VALIDATION_ERROR' })
      return
    }

    const firstDay = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0)
    const lastDayStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`

    const result = await query(
      `SELECT date_planifiee::date::text as day, count(*)::int as count
       FROM mission
       WHERE workspace_id = $1
         AND date_planifiee BETWEEN $2 AND $3
         AND statut != 'annulee'
       GROUP BY date_planifiee::date
       ORDER BY day`,
      [workspaceId, firstDay, lastDayStr]
    )

    const summary: Record<string, number> = {}
    for (const row of result.rows) {
      summary[row.day] = row.count
    }

    sendSuccess(res, summary)
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/dashboard/activity?range=7|30|90 — Chart data (daily, monthly, statuts)
router.get('/activity', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const rangeDays = Math.min(Math.max(parseInt(req.query.range as string) || 30, 7), 90)
    const dateFrom = new Date(Date.now() - rangeDays * 86400000).toISOString().slice(0, 10)

    // 1. Daily entrées/sorties for area chart
    const dailyResult = await query(
      `SELECT
        m.date_planifiee::date::text AS date,
        count(*) FILTER (WHERE ei.sens = 'entree')::int AS entrees,
        count(*) FILTER (WHERE ei.sens = 'sortie')::int AS sorties
      FROM mission m
      JOIN edl_inventaire ei ON ei.mission_id = m.id
      WHERE m.workspace_id = $1
        AND m.statut != 'annulee'
        AND m.date_planifiee >= $2
      GROUP BY m.date_planifiee::date
      ORDER BY 1`,
      [workspaceId, dateFrom]
    )

    // 2. Monthly trend last 6 months for line chart
    const monthlyResult = await query(
      `SELECT
        to_char(date_trunc('month', date_planifiee), 'Mon') AS month,
        count(*)::int AS planifiees,
        count(*) FILTER (WHERE statut = 'terminee')::int AS terminees
      FROM mission
      WHERE workspace_id = $1
        AND statut != 'annulee'
        AND date_planifiee >= date_trunc('month', now()) - INTERVAL '5 months'
      GROUP BY date_trunc('month', date_planifiee)
      ORDER BY date_trunc('month', date_planifiee)`,
      [workspaceId]
    )

    // 3. Statut breakdown (all non-archived) for donut pie
    const statutResult = await query(
      `SELECT statut, count(*)::int AS count
       FROM mission
       WHERE workspace_id = $1 AND est_archive = false
       GROUP BY statut`,
      [workspaceId]
    )

    const statuts: Record<string, number> = {}
    for (const row of statutResult.rows) statuts[row.statut] = row.count

    sendSuccess(res, {
      daily: dailyResult.rows,
      monthly: monthlyResult.rows,
      statuts,
    })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
