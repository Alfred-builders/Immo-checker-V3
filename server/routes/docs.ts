import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import yaml from 'js-yaml'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let spec: object
try {
  spec = yaml.load(readFileSync(path.join(__dirname, '..', 'openapi.yaml'), 'utf8')) as object
} catch {
  spec = { openapi: '3.0.3', info: { title: 'ImmoChecker API', version: '1.0' }, paths: {} }
}

const router = Router()
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
