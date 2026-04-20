import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../../db/index.js'
import { validate } from '../../middleware/validate.js'
import { sendSuccess, sendError } from '../../utils/response.js'
import { AppError, NotFoundError } from '../../utils/errors.js'
import { logAudit } from '../../services/audit-service.js'
import { sendInvitationEmail } from '../../services/email-service.js'

const router = Router()

// GET /api/super-admin/workspaces
router.get('/', async (req, res) => {
  try {
    const { search, type, statut } = req.query
    const filters: string[] = []
    const params: unknown[] = []
    let i = 1
    if (search) {
      filters.push(`(w.nom ILIKE $${i} OR w.siret ILIKE $${i} OR w.email ILIKE $${i})`)
      params.push(`%${search}%`)
      i++
    }
    if (type) { filters.push(`w.type_workspace = $${i}`); params.push(type); i++ }
    if (statut) { filters.push(`w.statut = $${i}`); params.push(statut); i++ }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

    const result = await query(
      `SELECT w.id, w.nom, w.type_workspace, w.statut, w.siret, w.email, w.logo_url,
              w.created_at, w.updated_at,
              (SELECT COUNT(*)::int FROM workspace_user wu WHERE wu.workspace_id = w.id AND wu.est_actif = true) AS members_count,
              (SELECT COUNT(*)::int FROM mission m WHERE m.workspace_id = w.id AND m.est_archive = false) AS missions_count,
              (SELECT COUNT(*)::int FROM batiment b WHERE b.workspace_id = w.id AND b.est_archive = false) AS batiments_count
       FROM workspace w ${where}
       ORDER BY w.created_at DESC
       LIMIT 200`,
      params
    )
    sendSuccess(res, { data: result.rows, total: result.rows.length })
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/super-admin/workspaces/:id
router.get('/:id', async (req, res) => {
  try {
    const wsResult = await query(
      `SELECT w.*,
              (SELECT COUNT(*)::int FROM workspace_user wu WHERE wu.workspace_id = w.id AND wu.est_actif = true) AS members_count,
              (SELECT COUNT(*)::int FROM mission m WHERE m.workspace_id = w.id) AS missions_count,
              (SELECT COUNT(*)::int FROM batiment b WHERE b.workspace_id = w.id) AS batiments_count,
              (SELECT COUNT(*)::int FROM lot l WHERE l.workspace_id = w.id) AS lots_count,
              (SELECT COUNT(*)::int FROM edl_inventaire e WHERE e.workspace_id = w.id AND e.statut = 'signe') AS edl_signed_count
       FROM workspace w WHERE w.id = $1`,
      [req.params.id]
    )
    if (wsResult.rows.length === 0) throw new NotFoundError('Workspace')
    const members = await query(
      `SELECT u.id, u.email, u.nom, u.prenom, u.last_login_at, wu.role, wu.est_actif, wu.created_at AS joined_at
       FROM workspace_user wu
       JOIN utilisateur u ON u.id = wu.user_id
       WHERE wu.workspace_id = $1
       ORDER BY wu.role, u.nom`,
      [req.params.id]
    )
    const pendingInvites = await query(
      `SELECT id, email, role, created_at, expires_at, accepted_at
       FROM invitation
       WHERE workspace_id = $1 AND accepted_at IS NULL AND expires_at > now()
       ORDER BY created_at DESC`,
      [req.params.id]
    )
    sendSuccess(res, {
      ...wsResult.rows[0],
      members: members.rows,
      pending_invitations: pendingInvites.rows,
    })
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/super-admin/workspaces — create workspace + send admin invite
const createSchema = z.object({
  nom: z.string().min(1).max(255),
  type_workspace: z.enum(['societe_edl', 'bailleur', 'agence']),
  statut: z.enum(['actif', 'trial']).optional().default('actif'),
  admin_email: z.string().email(),
  siret: z.string().optional(),
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  code_postal: z.string().optional(),
  ville: z.string().optional(),
})

router.post('/', validate(createSchema), async (req, res) => {
  try {
    const d = req.body as z.infer<typeof createSchema>
    const superAdminId = req.user!.userId

    const wsResult = await query(
      `INSERT INTO workspace (nom, type_workspace, statut, siret, email, telephone, adresse, code_postal, ville)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [d.nom, d.type_workspace, d.statut, d.siret ?? null, d.email ?? null,
       d.telephone ?? null, d.adresse ?? null, d.code_postal ?? null, d.ville ?? null]
    )
    const workspace = wsResult.rows[0]

    // Create admin invitation (7d expiry)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const invResult = await query(
      `INSERT INTO invitation (workspace_id, email, role, invited_by, expires_at)
       VALUES ($1, $2, 'admin', $3, $4)
       RETURNING id, token`,
      [workspace.id, d.admin_email.toLowerCase().trim(), superAdminId, expiresAt]
    )
    const invitation = invResult.rows[0]

    try {
      await sendInvitationEmail(d.admin_email, invitation.token, workspace.nom, 'admin')
    } catch (e) {
      console.error('[super-admin] Failed to send invite email:', e)
    }

    await logAudit(superAdminId, 'workspace.created', 'workspace', workspace.id, {
      admin_email: d.admin_email,
      type: d.type_workspace,
    })

    sendSuccess(res, { workspace, invitation: { id: invitation.id, email: d.admin_email } }, 201)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/super-admin/workspaces/:id — update statut
const updateStatutSchema = z.object({
  statut: z.enum(['actif', 'suspendu', 'trial']),
})
router.patch('/:id', validate(updateStatutSchema), async (req, res) => {
  try {
    const { statut } = req.body as z.infer<typeof updateStatutSchema>
    const result = await query(
      `UPDATE workspace SET statut = $1, updated_at = now() WHERE id = $2 RETURNING *`,
      [statut, req.params.id]
    )
    if (result.rows.length === 0) throw new NotFoundError('Workspace')
    const action = statut === 'suspendu' ? 'workspace.suspended'
      : statut === 'actif' ? 'workspace.reactivated'
      : 'workspace.status_changed'
    await logAudit(req.user!.userId, action, 'workspace', String(req.params.id), { new_statut: statut })
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/super-admin/workspaces/:id/resend-admin-invite
router.post('/:id/resend-admin-invite', async (req, res) => {
  try {
    const workspaceId = req.params.id
    const result = await query(
      `SELECT i.id, i.email, i.token, i.expires_at, w.nom
       FROM invitation i
       JOIN workspace w ON w.id = i.workspace_id
       WHERE i.workspace_id = $1 AND i.role = 'admin' AND i.accepted_at IS NULL
       ORDER BY i.created_at DESC
       LIMIT 1`,
      [workspaceId]
    )
    if (result.rows.length === 0) {
      throw new AppError('Aucune invitation admin en attente', 'NOT_FOUND', 404)
    }
    const inv = result.rows[0]
    // Refresh expiry to 7 days from now
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await query(`UPDATE invitation SET expires_at = $1 WHERE id = $2`, [newExpiry, inv.id])
    try {
      await sendInvitationEmail(inv.email, inv.token, inv.nom, 'admin')
    } catch (e) {
      console.error('[super-admin] Resend invite failed:', e)
    }
    await logAudit(req.user!.userId, 'workspace.admin_invite_resent', 'invitation', inv.id, {
      workspace_id: workspaceId,
      email: inv.email,
    })
    sendSuccess(res, { message: 'Invitation renvoyée', email: inv.email })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
