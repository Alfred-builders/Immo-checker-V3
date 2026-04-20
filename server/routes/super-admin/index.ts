import { Router } from 'express'
import { verifyToken } from '../../middleware/auth.js'
import { requireSuperAdmin } from '../../middleware/require-super-admin.js'
import workspacesRouter from './workspaces.js'
import usersRouter from './users.js'
import auditRouter from './audit.js'
import dashboardRouter from './dashboard.js'

const router = Router()
router.use(verifyToken)
router.use(requireSuperAdmin)

router.use('/workspaces', workspacesRouter)
router.use('/users', usersRouter)
router.use('/audit-log', auditRouter)
router.use('/dashboard', dashboardRouter)

export default router
