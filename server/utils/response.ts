import { Response } from 'express'
import { AppError } from './errors.js'

export function sendSuccess<T>(res: Response, data: T, status = 200) {
  res.status(status).json(data)
}

export function sendList<T>(res: Response, data: T[], meta?: { cursor?: string; has_more: boolean; total?: number }) {
  res.json({ data, meta: meta ?? { has_more: false } })
}

export function sendError(res: Response, error: unknown) {
  if (error instanceof AppError) {
    res.status(error.status).json({
      error: error.message,
      code: error.code,
      ...(error.details ? { details: error.details } : {}),
    })
    return
  }

  console.error('[api] Unhandled error:', error)
  res.status(500).json({
    error: 'Erreur interne du serveur',
    code: 'INTERNAL_ERROR',
  })
}
