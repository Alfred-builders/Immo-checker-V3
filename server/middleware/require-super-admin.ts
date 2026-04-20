import { Request, Response, NextFunction } from 'express'
import { query } from '../db/index.js'
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js'

// Double-check the super-admin flag in DB (not just from JWT) — prevents stale tokens
// from keeping access after a demotion.
export async function requireSuperAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError()
    const result = await query(
      `SELECT is_super_admin FROM utilisateur WHERE id = $1`,
      [req.user.userId]
    )
    if (result.rows.length === 0 || result.rows[0].is_super_admin !== true) {
      throw new ForbiddenError('Accès réservé aux super-administrateurs')
    }
    next()
  } catch (err) {
    next(err)
  }
}
