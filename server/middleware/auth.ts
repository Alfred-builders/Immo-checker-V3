import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js'

export interface JWTPayload {
  userId: string
  email: string
  workspaceId: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload
    }
  }
}

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production')
}
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export function verifyToken(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.access_token

  if (!token) {
    throw new UnauthorizedError('Token manquant')
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload
    req.user = payload
    next()
  } catch {
    throw new UnauthorizedError('Token invalide ou expiré')
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError()
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Permissions insuffisantes')
    }
    next()
  }
}
