import { Router, type Request, type Response } from 'express'
import swaggerUi from 'swagger-ui-express'
import yaml from 'js-yaml'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import jwt from 'jsonwebtoken'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let spec: object
try {
  spec = yaml.load(readFileSync(path.join(__dirname, '..', 'openapi.yaml'), 'utf8')) as object
} catch {
  spec = { openapi: '3.0.3', info: { title: 'ImmoChecker API', version: '1.0' }, paths: {} }
}

// Lightweight cookie-JWT gate just for docs — scoped so swagger-ui assets
// still load (they're served from this router too, but after the check).
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

function requireSessionJwt(req: Request, res: Response, next: () => void) {
  const token = req.cookies?.access_token
  if (!token) {
    res.status(401).json({ error: 'Documentation réservée aux utilisateurs connectés', code: 'UNAUTHORIZED' })
    return
  }
  try {
    jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Session expirée', code: 'UNAUTHORIZED' })
  }
}

const router = Router()
router.use(requireSessionJwt)

// Raw OpenAPI spec — for Postman / Insomnia / integrators (US-603).
router.get('/openapi.json', (_req, res) => {
  res.json(spec)
})

router.use('/', swaggerUi.serve)
router.get(
  '/',
  swaggerUi.setup(spec, {
    customSiteTitle: 'ImmoChecker API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 5,
      defaultModelRendering: 'model',
      docExpansion: 'list',
    },
  })
)

export default router
