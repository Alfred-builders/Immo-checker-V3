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

describe('/api/docs (session-JWT gated)', () => {
  it('returns 401 without cookie', async () => {
    const res = await request(app).get('/api/docs/openapi.json')
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('UNAUTHORIZED')
  })

  it('returns 401 with invalid JWT', async () => {
    const res = await request(app)
      .get('/api/docs/openapi.json')
      .set('Cookie', 'access_token=not-a-real-jwt')
    expect(res.status).toBe(401)
  })

  it('returns the OpenAPI spec with a valid session cookie', async () => {
    const cookie = signCookie({ userId: 'test-user', workspaceId: 'test-ws', role: 'admin' })
    const res = await request(app).get('/api/docs/openapi.json').set('Cookie', cookie)
    expect(res.status).toBe(200)
    expect(res.body.openapi).toMatch(/^3\.0\./)
    expect(res.body.info.title).toBe('ImmoChecker API')
  })

  it('serves the Swagger UI HTML with a valid cookie', async () => {
    const cookie = signCookie({ userId: 'test-user', workspaceId: 'test-ws', role: 'admin' })
    const res = await request(app).get('/api/docs/').set('Cookie', cookie)
    expect(res.status).toBe(200)
    expect(res.text).toContain('swagger-ui')
  })
})

describe('/api/v1/* (API key gated)', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/v1/missions')
    expect(res.status).toBe(401)
    expect(res.body.code).toBeDefined()
  })

  it('returns 401 with an obviously invalid bearer', async () => {
    const res = await request(app)
      .get('/api/v1/missions')
      .set('Authorization', 'Bearer imk_live_not_a_real_key')
    expect(res.status).toBe(401)
  })
})

describe('/api/health', () => {
  it('is reachable without any auth', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})
