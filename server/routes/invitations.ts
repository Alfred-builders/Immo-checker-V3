import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../db/index.js'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { ConflictError } from '../utils/errors.js'

const router = Router()
router.use(verifyToken)

// GET /api/invitations — List workspace invitations (admin only — settings page)
router.get('/', requireRole('admin'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const result = await query(
      `SELECT i.id, i.email, i.role, i.token, i.accepted_at, i.expires_at, i.created_at,
        u.nom as invited_by_nom, u.prenom as invited_by_prenom
       FROM invitation i
       LEFT JOIN utilisateur u ON u.id = i.invited_by
       WHERE i.workspace_id = $1 AND i.role != 'reset_password'
       ORDER BY i.created_at DESC`,
      [workspaceId]
    )
    sendSuccess(res, result.rows)
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/invitations/users — List workspace users (admin + gestionnaire — needed for pickers)
router.get('/users', requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { role } = req.query as { role?: string }
    const validRoles = ['admin', 'gestionnaire', 'technicien']

    const params: unknown[] = [workspaceId]
    let roleClause = ''
    if (role && validRoles.includes(role)) {
      params.push(role)
      roleClause = `AND wu.role = $2`
    }

    const result = await query(
      `SELECT u.id, u.email, u.nom, u.prenom, wu.role, wu.created_at
       FROM workspace_user wu
       JOIN utilisateur u ON u.id = wu.user_id
       WHERE wu.workspace_id = $1 ${roleClause}
       ORDER BY wu.created_at DESC`,
      params
    )
    sendSuccess(res, result.rows)
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/invitations — Send invitation (admin only)
const inviteSchema = z.object({
  email: z.email(),
  role: z.enum(['admin', 'gestionnaire', 'technicien']),
})

router.post('/', requireRole('admin'), validate(inviteSchema), async (req, res) => {
  try {
    const { workspaceId, userId } = req.user!
    const { email, role } = req.body

    // Check if already member
    const existing = await query(
      `SELECT wu.id FROM workspace_user wu
       JOIN utilisateur u ON u.id = wu.user_id
       WHERE u.email = $1 AND wu.workspace_id = $2`,
      [email.toLowerCase(), workspaceId]
    )
    if (existing.rows.length > 0) {
      throw new ConflictError('Cet utilisateur est déjà membre de ce workspace')
    }

    // Check if pending invitation exists
    const pendingInv = await query(
      `SELECT id FROM invitation
       WHERE email = $1 AND workspace_id = $2 AND accepted_at IS NULL AND expires_at > now() AND role != 'reset_password'`,
      [email.toLowerCase(), workspaceId]
    )
    if (pendingInv.rows.length > 0) {
      throw new ConflictError('Une invitation est déjà en attente pour cet email')
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const result = await query(
      `INSERT INTO invitation (workspace_id, email, role, invited_by, expires_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [workspaceId, email.toLowerCase(), role, userId, expiresAt]
    )

    // Send email via Resend
    const wsResult = await query(`SELECT nom FROM workspace WHERE id = $1`, [workspaceId])
    const wsName = wsResult.rows[0]?.nom || 'ImmoChecker'
    const { sendInvitationEmail } = await import('../services/email-service.js')
    await sendInvitationEmail(email.toLowerCase(), result.rows[0].token, wsName, role).catch(err => console.error('[email] Invitation email failed:', err))
    console.log(`[invite] Invitation sent to ${email} (role: ${role})`)

    sendSuccess(res, result.rows[0], 201)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/invitations/users/:userId/role — Change user role (admin only)
router.patch('/users/:userId/role', requireRole('admin'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { role } = req.body

    if (!['admin', 'gestionnaire', 'technicien'].includes(role)) {
      sendError(res, { status: 400, message: 'Rôle invalide', code: 'VALIDATION_ERROR' })
      return
    }

    const result = await query(
      `UPDATE workspace_user SET role = $1, updated_at = now()
       WHERE user_id = $2 AND workspace_id = $3 RETURNING *`,
      [role, req.params.userId, workspaceId]
    )

    if (result.rows.length === 0) {
      sendError(res, { status: 404, message: 'Utilisateur non trouvé', code: 'NOT_FOUND' })
      return
    }

    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/invitations/:id/resend — Resend invitation (admin only)
router.post('/:id/resend', requireRole('admin'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const result = await query(
      `UPDATE invitation SET expires_at = $1 WHERE id = $2 AND workspace_id = $3 AND accepted_at IS NULL
       RETURNING email, token, role`,
      [newExpiry, req.params.id, workspaceId]
    )

    if (result.rows.length === 0) {
      sendError(res, { status: 404, message: 'Invitation introuvable ou deja acceptee', code: 'NOT_FOUND' })
      return
    }

    const inv = result.rows[0]
    const wsResult = await query(`SELECT nom FROM workspace WHERE id = $1`, [workspaceId])
    const wsName = wsResult.rows[0]?.nom || 'ImmoChecker'
    const { sendInvitationEmail } = await import('../services/email-service.js')
    await sendInvitationEmail(inv.email, inv.token, wsName, inv.role).catch(err => console.error('[email] Resend failed:', err))

    console.log(`[invite] Invitation resent to ${inv.email}`)
    sendSuccess(res, { resent: true })
  } catch (error) {
    sendError(res, error)
  }
})

// DELETE /api/invitations/:id — Cancel invitation (admin only)
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const result = await query(
      `DELETE FROM invitation WHERE id = $1 AND workspace_id = $2 AND accepted_at IS NULL RETURNING id`,
      [req.params.id, workspaceId]
    )
    if (result.rows.length === 0) {
      sendError(res, { status: 404, message: 'Invitation introuvable', code: 'NOT_FOUND' })
      return
    }
    sendSuccess(res, { deleted: true })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
