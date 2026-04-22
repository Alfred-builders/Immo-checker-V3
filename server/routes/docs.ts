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

router.get('/openapi.json', (_req, res) => {
  res.json(spec)
})

router.use('/', swaggerUi.serve)
router.get(
  '/',
  swaggerUi.setup(spec, {
    customSiteTitle: 'ImmoChecker API Docs',
    customCss: `
      .swagger-ui .topbar { display: none }

      /* Fix d'alignement du mode Schema : verticalement haut + wrap */
      .swagger-ui .model-box,
      .swagger-ui .model {
        font-size: 13px;
      }
      .swagger-ui .model .property.primitive,
      .swagger-ui .model .prop-type {
        white-space: normal;
      }
      .swagger-ui .model-box .model,
      .swagger-ui .model-box table.model tbody tr td {
        vertical-align: top;
        padding-top: 4px;
        padding-bottom: 4px;
      }
      .swagger-ui .model-box .model .property {
        padding-top: 2px;
        padding-bottom: 2px;
      }

      /* Bandeau d'avertissement dans le header */
      .swagger-ui .info::after {
        content: "⚠️  N'utilisez jamais une clé API de production dans le formulaire « Try it out » — le bouton envoie la requête depuis le navigateur.";
        display: block;
        margin-top: 12px;
        padding: 10px 14px;
        background: #fff7e6;
        border-left: 4px solid #f59f00;
        border-radius: 4px;
        color: #5c3b00;
        font-size: 13px;
        line-height: 1.5;
      }
    `,
    swaggerOptions: {
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 2,
      defaultModelRendering: 'example',
      docExpansion: 'list',
      displayRequestDuration: true,
      tryItOutEnabled: true,
      persistAuthorization: true,
      filter: true,
      syntaxHighlight: { theme: 'agate' },
    },
  })
)

export default router
