import { Router } from 'express'
import { query } from '../../db/index.js'
import { sendSuccess, sendError } from '../../utils/response.js'
import { NotFoundError } from '../../utils/errors.js'
import { encodeCursor, decodeCursor } from '../../utils/cursor.js'
import { resolveId } from '../../utils/resolve-id.js'

const router = Router()

// GET /api/v1/batiments
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const { search, cursor, limit: rawLimit, address_rue, address_cp, address_ville } =
      req.query as Record<string, string>
    const limit = Math.min(parseInt(rawLimit) || 25, 100)

    const params: unknown[] = [workspaceId]
    let where = 'WHERE b.workspace_id = $1 AND b.est_archive = false'
    let idx = 2

    if (search) {
      where += ` AND (b.designation ILIKE $${idx} OR b.num_batiment ILIKE $${idx})`
      params.push(`%${search}%`); idx++
    }

    // Address-first picker: list buildings already at this exact address.
    if (address_rue && address_cp && address_ville) {
      where += ` AND EXISTS (
        SELECT 1 FROM adresse_batiment ab2
        WHERE ab2.batiment_id = b.id
          AND ab2.type = 'principale'
          AND lower(trim(ab2.rue)) = lower(trim($${idx}))
          AND trim(ab2.code_postal) = trim($${idx + 1})
          AND lower(trim(ab2.ville)) = lower(trim($${idx + 2}))
      )`
      params.push(address_rue, address_cp, address_ville); idx += 3
    }

    if (cursor) {
      const c = decodeCursor(cursor)
      if (c) {
        where += ` AND (COALESCE(b.designation, ''), b.id) > ($${idx}, $${idx + 1})`
        params.push(c.orderKey, c.id); idx += 2
      }
    }

    params.push(limit + 1)
    const result = await query(
      `SELECT b.id, b.designation, b.type, b.num_batiment, b.nb_etages, b.annee_construction,
              b.reference_interne, b.created_at,
              ab.rue, ab.code_postal, ab.ville, ab.latitude, ab.longitude,
              (SELECT count(*) FROM lot l WHERE l.batiment_id = b.id AND l.est_archive = false)::int AS nb_lots
       FROM batiment b
       LEFT JOIN adresse_batiment ab ON ab.batiment_id = b.id AND ab.type = 'principale'
       ${where}
       ORDER BY b.num_batiment ASC NULLS LAST, b.designation ASC NULLS LAST, b.id
       LIMIT $${idx}`,
      params
    )

    const has_more = result.rows.length > limit
    const rows = has_more ? result.rows.slice(0, limit) : result.rows
    const last = rows[rows.length - 1]
    const nextCursor = has_more && last ? encodeCursor(last.designation ?? '', last.id) : null
    sendSuccess(res, { data: rows, meta: { cursor: nextCursor, has_more } })
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/v1/batiments/:id — accepts UUID or `reference_interne`
router.get('/:id', async (req, res) => {
  try {
    const workspaceId = req.workspaceId!
    const batimentId = await resolveId({
      table: 'batiment',
      alternateColumn: 'reference_interne',
      identifier: String(req.params.id),
      workspaceId,
      entityName: 'Bâtiment',
    })
    const result = await query(
      `SELECT b.id, b.designation, b.type, b.nb_etages, b.annee_construction,
              b.reference_interne, b.commentaire, b.created_at,
              ab.rue, ab.complement, ab.code_postal, ab.ville, ab.latitude, ab.longitude
       FROM batiment b
       LEFT JOIN adresse_batiment ab ON ab.batiment_id = b.id AND ab.type = 'principale'
       WHERE b.id = $1 AND b.workspace_id = $2`,
      [batimentId, workspaceId]
    )
    if (result.rows.length === 0) throw new NotFoundError('Bâtiment')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

export default router
