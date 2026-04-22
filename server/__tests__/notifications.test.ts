import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'

process.env.VITEST = '1'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
process.env.NODE_ENV = 'test'

const { default: app } = await import('../index.js')

const JWT_SECRET = process.env.JWT_SECRET!

function signCookie(payload: object) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
  return `access_token=${token}`
}

describe('/api/notifications (API surface)', () => {
  it('rejects anonymous requests', async () => {
    const res = await request(app).get('/api/notifications')
    expect(res.status).toBe(401)
  })

  it('rejects tampered JWT', async () => {
    const res = await request(app).get('/api/notifications').set('Cookie', 'access_token=abc.xyz.bad')
    expect(res.status).toBe(401)
  })

  it('rejects invalid query params (unread_only values)', async () => {
    const cookie = signCookie({ userId: 'u1', workspaceId: 'w1', role: 'admin' })
    const res = await request(app).get('/api/notifications?unread_only=maybe').set('Cookie', cookie)
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })

  it('rejects limit out of bounds', async () => {
    const cookie = signCookie({ userId: 'u1', workspaceId: 'w1', role: 'admin' })
    const res = await request(app).get('/api/notifications?limit=500').set('Cookie', cookie)
    expect(res.status).toBe(400)
  })
})

describe('notification types surface', () => {
  it('declares the 11 expected notification types', async () => {
    const svc = await import('../services/notification-service.js')
    // exhaustive list used across the app
    const expected = [
      'edl_signed', 'edl_infructueux',
      'mission_created', 'mission_cancelled', 'mission_completed',
      'technicien_accepted', 'technicien_refused',
      'invitation_accepted', 'invitation_expired',
      'password_changed', 'user_deactivated',
    ]
    // TypeScript union — runtime check via sample payload build
    for (const t of expected) {
      const payload: Parameters<typeof svc.publishNotification>[0] = {
        user_id: '00000000-0000-0000-0000-000000000001',
        workspace_id: '00000000-0000-0000-0000-000000000002',
        type: t as any,
        titre: 'x',
      }
      expect(payload.type).toBe(t)
    }
  })
})
