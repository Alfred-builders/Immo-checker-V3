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
        )::int as upcoming_7d`,
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
    const year = parseInt(req.query.year as string) || new Date().getFullYear()
    const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1)

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

export default router
