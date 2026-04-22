import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../db/index.js'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendSuccess, sendList, sendError } from '../utils/response.js'
import { NotFoundError, AppError } from '../utils/errors.js'

const router = Router()
router.use(verifyToken)

/* ── Recurring indispo expansion (US-823) ── */

const DAY_MAP: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 }

interface RecurrenceConfig {
  freq: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  byday?: string[]
  bymonthday?: number[]
  count?: number
  until?: string
  exdates?: string[]
}

function expandRecurringIndispo(row: any, rangeFrom: Date, rangeTo: Date): any[] {
  const config: RecurrenceConfig = row.recurrence_config || {}
  const occurrences: any[] = []

  const seriesStart = new Date(row.date_debut)
  const firstEnd = new Date(row.date_fin)
  const durationMs = firstEnd.getTime() - seriesStart.getTime()
  const exdates = new Set<string>((config.exdates || []))

  const untilMs = config.until
    ? Math.min(new Date(config.until + 'T23:59:59Z').getTime(), rangeTo.getTime())
    : rangeTo.getTime()
  const maxCount = config.count || 500
  let generated = 0

  if (config.byday && config.byday.length > 0 && (config.freq === 'weekly' || config.freq === 'biweekly')) {
    const periodDays = config.freq === 'biweekly' ? 14 : 7

    // Find the Monday of the week containing seriesStart
    const startDow = seriesStart.getDay()
    const mondayOffset = startDow === 0 ? -6 : 1 - startDow
    const anchor = new Date(seriesStart)
    anchor.setDate(anchor.getDate() + mondayOffset)
    anchor.setHours(seriesStart.getHours(), seriesStart.getMinutes(), seriesStart.getSeconds(), 0)

    while (anchor.getTime() <= untilMs && generated < maxCount) {
      for (const day of config.byday) {
        const dayNum = DAY_MAP[day] ?? 1
        const dayOffset = dayNum === 0 ? 6 : dayNum - 1 // Mon=0..Sun=6
        const occStart = new Date(anchor)
        occStart.setDate(anchor.getDate() + dayOffset)
        if (occStart < seriesStart) continue
        if (occStart.getTime() > untilMs) break

        const occEnd = new Date(occStart.getTime() + durationMs)
        const dateKey = occStart.toISOString().slice(0, 10)

        if (!exdates.has(dateKey) && occEnd >= rangeFrom && occStart <= rangeTo) {
          occurrences.push({ ...row, id: `${row.id}__${dateKey}`, date_debut: occStart.toISOString(), date_fin: occEnd.toISOString(), parent_id: row.id, is_occurrence: true })
          generated++
        }
        if (generated >= maxCount) break
      }
      anchor.setDate(anchor.getDate() + periodDays)
    }
  } else {
    let current = new Date(seriesStart)

    while (current.getTime() <= untilMs && generated < maxCount) {
      const occEnd = new Date(current.getTime() + durationMs)
      const dateKey = current.toISOString().slice(0, 10)

      if (!exdates.has(dateKey) && occEnd >= rangeFrom && current <= rangeTo) {
        occurrences.push({ ...row, id: `${row.id}__${dateKey}`, date_debut: current.toISOString(), date_fin: occEnd.toISOString(), parent_id: row.id, is_occurrence: true })
        generated++
      }

      // Advance
      const next = new Date(current)
      if (config.freq === 'daily') next.setDate(next.getDate() + 1)
      else if (config.freq === 'weekly') next.setDate(next.getDate() + 7)
      else if (config.freq === 'biweekly') next.setDate(next.getDate() + 14)
      else if (config.freq === 'monthly') next.setMonth(next.getMonth() + 1)
      else break
      current = next
    }
  }

  return occurrences
}

// GET /api/indisponibilites — List unavailabilities
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { user_id, date_from, date_to, cursor, limit: rawLimit } = req.query
    const limit = Math.min(parseInt(rawLimit as string) || 50, 100)

    let where = `it.workspace_id = $1`
    const params: unknown[] = [workspaceId]
    let paramIndex = 2

    if (user_id) {
      where += ` AND it.user_id = $${paramIndex}`
      params.push(user_id)
      paramIndex++
    }

    if (date_from && date_to) {
      // Non-recurring: normal overlap. Recurring: series starts before range ends (expand in JS).
      where += ` AND (
        (it.est_recurrent = false AND it.date_fin >= $${paramIndex} AND it.date_debut <= $${paramIndex + 1})
        OR
        (it.est_recurrent = true AND it.date_debut <= $${paramIndex + 1})
      )`
      params.push(date_from, date_to)
      paramIndex += 2
    } else if (date_from) {
      where += ` AND it.date_fin >= $${paramIndex}`
      params.push(date_from)
      paramIndex++
    } else if (date_to) {
      where += ` AND it.date_debut <= $${paramIndex}`
      params.push(date_to)
      paramIndex++
    }

    if (cursor) {
      where += ` AND it.id > $${paramIndex}`
      params.push(cursor)
      paramIndex++
    }

    const sql = `
      SELECT it.*,
        u.nom AS user_nom,
        u.prenom AS user_prenom,
        json_build_object('id', u.id, 'nom', u.nom, 'prenom', u.prenom, 'email', u.email) as technicien
      FROM indisponibilite_technicien it
      JOIN utilisateur u ON u.id = it.user_id
      WHERE ${where}
      ORDER BY it.date_debut ASC
      LIMIT $${paramIndex}
    `
    params.push(limit + 1)

    const result = await query(sql, params)

    // Expand recurring entries into virtual occurrences within the requested range
    const rangeFrom = date_from ? new Date(date_from as string) : new Date(0)
    const rangeTo = date_to ? new Date((date_to as string) + 'T23:59:59Z') : new Date(8640000000000000)

    const expanded: any[] = []
    for (const row of result.rows) {
      if (row.est_recurrent && row.recurrence_config) {
        expanded.push(...expandRecurringIndispo(row, rangeFrom, rangeTo))
      } else {
        expanded.push(row)
      }
    }

    expanded.sort((a, b) => new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime())

    const hasMore = expanded.length > limit
    const data = hasMore ? expanded.slice(0, limit) : expanded
    // Cursor only meaningful for non-virtual rows
    const lastRow = hasMore ? data[data.length - 1] : undefined
    const nextCursor = lastRow && !lastRow.is_occurrence ? lastRow.id : undefined

    sendList(res, data, { cursor: nextCursor, has_more: hasMore })
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/indisponibilites/:id — Get a single unavailability (parent record, not expanded)
router.get('/:id', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const result = await query(
      `SELECT it.*,
        json_build_object('id', u.id, 'nom', u.nom, 'prenom', u.prenom, 'email', u.email) as technicien
       FROM indisponibilite_technicien it
       JOIN utilisateur u ON u.id = it.user_id
       WHERE it.id = $1 AND it.workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (result.rows.length === 0) throw new NotFoundError('Indisponibilite')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/indisponibilites — Create unavailability
const createIndispoSchema = z.object({
  user_id: z.uuid(),
  date_debut: z.string().min(1),
  date_fin: z.string().min(1),
  est_journee_entiere: z.boolean().default(true),
  est_recurrent: z.boolean().default(false),
  recurrence_config: z.object({
    freq: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
    byday: z.array(z.string()).optional(),
    bymonthday: z.array(z.number().int()).optional(),
    count: z.number().int().positive().optional(),
    until: z.string().optional(),
    exdates: z.array(z.string()).optional(),
  }).optional(),
  motif: z.string().max(255).optional(),
})

router.post('/', requireRole('admin', 'gestionnaire', 'technicien'), validate(createIndispoSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const d = req.body

    // Validate user belongs to workspace
    const userCheck = await query(
      `SELECT id FROM workspace_user WHERE user_id = $1 AND workspace_id = $2`,
      [d.user_id, workspaceId]
    )
    if (userCheck.rows.length === 0) {
      throw new AppError('Utilisateur non membre de ce workspace', 'USER_NOT_IN_WORKSPACE', 400)
    }

    // Validate date_debut < date_fin
    if (new Date(d.date_debut) >= new Date(d.date_fin)) {
      throw new AppError('La date de debut doit etre anterieure a la date de fin', 'INVALID_DATE_RANGE', 400)
    }

    const result = await query(
      `INSERT INTO indisponibilite_technicien (user_id, workspace_id, date_debut, date_fin, est_journee_entiere, est_recurrent, recurrence_config, motif)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [d.user_id, workspaceId, d.date_debut, d.date_fin, d.est_journee_entiere, d.est_recurrent,
       d.recurrence_config ? JSON.stringify(d.recurrence_config) : null, d.motif ?? null]
    )

    sendSuccess(res, result.rows[0], 201)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/indisponibilites/:id — Update unavailability
const updateIndispoSchema = z.object({
  date_debut: z.string().min(1).optional(),
  date_fin: z.string().min(1).optional(),
  est_journee_entiere: z.boolean().optional(),
  est_recurrent: z.boolean().optional(),
  recurrence_config: z.object({
    freq: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
    byday: z.array(z.string()).optional(),
    bymonthday: z.array(z.number().int()).optional(),
    count: z.number().int().positive().optional(),
    until: z.string().optional(),
    exdates: z.array(z.string()).optional(),
  }).nullable().optional(),
  motif: z.string().max(255).optional(),
})

router.patch('/:id', requireRole('admin', 'gestionnaire', 'technicien'), validate(updateIndispoSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const allowedFields = ['date_debut', 'date_fin', 'est_journee_entiere', 'est_recurrent', 'recurrence_config', 'motif']

    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'recurrence_config') {
          fields.push(`${field} = $${idx++}`)
          values.push(req.body[field] ? JSON.stringify(req.body[field]) : null)
        } else {
          fields.push(`${field} = $${idx++}`)
          values.push(req.body[field])
        }
      }
    }

    if (fields.length === 0) {
      sendSuccess(res, { message: 'Aucune modification' })
      return
    }

    fields.push(`updated_at = now()`)
    values.push(req.params.id, workspaceId)

    const result = await query(
      `UPDATE indisponibilite_technicien SET ${fields.join(', ')} WHERE id = $${idx++} AND workspace_id = $${idx} RETURNING *`,
      values
    )

    if (result.rows.length === 0) throw new NotFoundError('Indisponibilite')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// DELETE /api/indisponibilites/:id — Delete unavailability
router.delete('/:id', requireRole('admin', 'gestionnaire', 'technicien'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId

    const result = await query(
      `DELETE FROM indisponibilite_technicien WHERE id = $1 AND workspace_id = $2 RETURNING id`,
      [req.params.id, workspaceId]
    )

    if (result.rows.length === 0) throw new NotFoundError('Indisponibilite')
    sendSuccess(res, { deleted: true })
  } catch (error) {
    sendError(res, error)
  }
})

// ── Technician conflict routes (mounted at /api/technicians) ──

const technicianConflictRouter = Router()
technicianConflictRouter.use(verifyToken)

// GET /api/technicians/:userId/conflicts — Check planning conflicts for a date (US-827)
technicianConflictRouter.get('/:userId/conflicts', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { date } = req.query

    if (!date) {
      throw new AppError('Parametre date requis (YYYY-MM-DD)', 'VALIDATION_ERROR', 400)
    }

    // Missions on the same day (not cancelled)
    const missions = await query(
      `SELECT m.id, m.reference, m.date_planifiee, m.heure_debut, m.heure_fin, m.statut,
        json_build_object('id', l.id, 'designation', l.designation) as lot
       FROM mission m
       JOIN mission_technicien mt ON mt.mission_id = m.id
       JOIN lot l ON l.id = m.lot_id
       WHERE mt.user_id = $1
         AND m.workspace_id = $2
         AND m.date_planifiee = $3
         AND m.statut NOT IN ('annulee')
       ORDER BY m.heure_debut ASC NULLS LAST`,
      [req.params.userId, workspaceId, date]
    )

    // Overlapping unavailabilities
    const indisponibilites = await query(
      `SELECT id, date_debut, date_fin, est_journee_entiere, motif
       FROM indisponibilite_technicien
       WHERE user_id = $1
         AND workspace_id = $2
         AND date_debut::date <= $3::date
         AND date_fin::date >= $3::date`,
      [req.params.userId, workspaceId, date]
    )

    sendSuccess(res, {
      missions: missions.rows,
      indisponibilites: indisponibilites.rows,
    })
  } catch (error) {
    sendError(res, error)
  }
})

export { technicianConflictRouter }
export default router
