import crypto from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { query } from '../db/index.js'
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js'

declare global {
  namespace Express {
    interface Request {
      workspaceId?: string
      apiKeyScope?: 'read' | 'write'
    }
  }
}

export async function verifyApiKey(req: Request, _res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer imk_')) {
      throw new UnauthorizedError('Clé API requise (Bearer imk_...)')
    }

    const rawKey = auth.slice(7)
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex')

    const result = await query(
      `UPDATE api_key
       SET last_used_at = now()
       WHERE key_hash = $1
         AND est_active = true
         AND (expires_at IS NULL OR expires_at > now())
       RETURNING workspace_id, scope`,
      [hash]
    )

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Clé API invalide ou révoquée')
    }

    req.workspaceId = result.rows[0].workspace_id
    req.apiKeyScope = result.rows[0].scope
    next()
  } catch (err) {
    next(err)
  }
}

/** Middleware to enforce read-only keys cannot mutate */
export function requireWriteScope(req: Request, _res: Response, next: NextFunction) {
  if (req.apiKeyScope === 'read') {
    throw new ForbiddenError('Cette clé API est en lecture seule')
  }
  next()
}
