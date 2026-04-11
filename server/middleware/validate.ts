import { Request, Response, NextFunction } from 'express'
import { z } from 'zod/v4'
import { ValidationError } from '../utils/errors.js'

export function validate<T extends z.ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const formatted = z.prettifyError(result.error)
      throw new ValidationError('Données invalides', formatted)
    }
    req.body = result.data
    next()
  }
}
