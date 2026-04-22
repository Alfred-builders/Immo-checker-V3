import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import superAdminRoutes from './routes/super-admin/index.js'
import batimentRoutes from './routes/batiments.js'
import lotRoutes from './routes/lots.js'
import preferenceRoutes from './routes/preferences.js'
import invitationRoutes from './routes/invitations.js'
import workspaceRoutes from './routes/workspaces.js'
import tiersRoutes from './routes/tiers.js'
import typePiecesRoutes from './routes/type-pieces.js'
import catalogueItemsRoutes from './routes/catalogue-items.js'
import templatesRoutes from './routes/templates.js'
import missionRoutes from './routes/missions.js'
import edlRoutes, { missionEdlRouter } from './routes/edl.js'
import indisponibiliteRoutes, { technicianConflictRouter } from './routes/indisponibilites.js'
import dashboardRoutes from './routes/dashboard.js'
import apiKeyRoutes from './routes/api-keys.js'
import webhookRoutes from './routes/webhooks.js'
import notificationRoutes from './routes/notifications.js'
import searchRoutes from './routes/search.js'
import docsRouter from './routes/docs.js'
import v1MissionsRouter from './routes/v1/missions.js'
import v1EdlRouter from './routes/v1/edl.js'
import v1LotsRouter from './routes/v1/lots.js'
import v1BatimentsRouter from './routes/v1/batiments.js'
import { verifyApiKey } from './middleware/api-key-auth.js'
import rateLimit from 'express-rate-limit'
import { AppError } from './utils/errors.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Don't let .env override Railway's environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: false })

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)
const isRailway = !!process.env.RAILWAY_ENVIRONMENT
const isDev = !isRailway && process.env.NODE_ENV === 'development'

// Trust Railway's reverse proxy (needed for rate limiting + IP detection)
if (isRailway) {
  app.set('trust proxy', 1)
}

// Middleware
app.use(cors({
  origin: isDev
    ? 'http://localhost:5173'
    : (process.env.FRONTEND_URL || true),
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/super-admin', superAdminRoutes)
app.use('/api/batiments', batimentRoutes)
app.use('/api/lots', lotRoutes)
app.use('/api/preferences', preferenceRoutes)
app.use('/api/invitations', invitationRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/tiers', tiersRoutes)
app.use('/api/type-pieces', typePiecesRoutes)
app.use('/api/catalogue-items', catalogueItemsRoutes)
app.use('/api/templates', templatesRoutes)
app.use('/api/missions', missionRoutes)
app.use('/api/missions', missionEdlRouter)
app.use('/api/edl', edlRoutes)
app.use('/api/indisponibilites', indisponibiliteRoutes)
app.use('/api/technicians', technicianConflictRouter)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/api-keys', apiKeyRoutes)
app.use('/api/webhooks', webhookRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/docs', docsRouter)

// ── Public API v1 (API key auth + rate limit) ──
const apiV1Limit = rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes', code: 'RATE_LIMIT' },
  validate: { trustProxy: false, xForwardedForHeader: false },
})
app.use('/api/v1/missions', verifyApiKey, apiV1Limit, v1MissionsRouter)
app.use('/api/v1/edl-inventaires', verifyApiKey, apiV1Limit, v1EdlRouter)
app.use('/api/v1/lots', verifyApiKey, apiV1Limit, v1LotsRouter)
app.use('/api/v1/batiments', verifyApiKey, apiV1Limit, v1BatimentsRouter)

// Serve frontend (always in non-dev — Railway, staging, production)
if (!isDev) {
  const distPath = path.resolve(__dirname, '..', 'dist')
  console.log(`[server] Serving frontend from: ${distPath}`)
  app.use(express.static(distPath))
  app.get('{*path}', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// Global error handler (must be AFTER all routes and static serving)
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message, code: err.code, ...(err.details ? { details: err.details } : {}) })
    return
  }
  console.error('[server] Unhandled error:', err)
  res.status(500).json({ error: 'Erreur interne', code: 'INTERNAL_ERROR' })
})

if (!process.env.VITEST) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] ImmoChecker running on port ${PORT} (${process.env.NODE_ENV || 'production'})`)
  })
}

export default app
