import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from '../src/lib/jwt'
import { createApp } from '../src/app'
import { requireRole } from '../src/middleware/roleGuard'

// ─── JWT helpers ────────────────────────────────────────────────────────────

describe('JWT helpers', () => {
  it('signs and verifies an access token', async () => {
    const payload = { userId: 'user-1', role: 'ADMIN' as const }
    const token = await signAccessToken(payload)
    const decoded = await verifyAccessToken(token)
    expect(decoded.userId).toBe('user-1')
    expect(decoded.role).toBe('ADMIN')
  })

  it('throws on an invalid access token', async () => {
    await expect(verifyAccessToken('not.a.valid.token')).rejects.toThrow()
  })

  it('signs and verifies a refresh token with MEMBER role', async () => {
    const payload = { userId: 'user-2', role: 'MEMBER' as const }
    const token = await signRefreshToken(payload)
    const decoded = await verifyRefreshToken(token)
    expect(decoded.userId).toBe('user-2')
    expect(decoded.role).toBe('MEMBER')
  })
})

// ─── Auth routes ─────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = createApp()
    await app.ready()
  })
  afterAll(() => app.close())

  it('returns 401 for wrong password', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'admin@library.local', password: 'wrong' },
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).error).toBe('INVALID_CREDENTIALS')
  })

  it('returns 401 for unknown email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'nobody@example.com', password: 'anything' },
    })
    expect(res.statusCode).toBe(401)
  })

  it('returns 200 with accessToken and sets refreshToken cookie', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'admin@library.local', password: 'admin1234' },
    })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.accessToken).toBeDefined()
    expect(body.user.role).toBe('ADMIN')
    expect(body.user.email).toBe('admin@library.local')
    const cookie = res.cookies.find((c: { name: string }) => c.name === 'refreshToken')
    expect(cookie).toBeDefined()
    expect(cookie?.httpOnly).toBe(true)
  })
})

describe('POST /api/auth/refresh', () => {
  let app: FastifyInstance
  let refreshCookieValue: string

  beforeAll(async () => {
    app = createApp()
    await app.ready()
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'admin@library.local', password: 'admin1234' },
    })
    const cookie = loginRes.cookies.find((c: { name: string }) => c.name === 'refreshToken')
    refreshCookieValue = cookie!.value
  })
  afterAll(() => app.close())

  it('returns 401 when no cookie is present', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/auth/refresh' })
    expect(res.statusCode).toBe(401)
  })

  it('returns a new accessToken with a valid refresh cookie', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh',
      cookies: { refreshToken: refreshCookieValue },
    })
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).accessToken).toBeDefined()
  })
})

describe('POST /api/auth/logout', () => {
  let app: FastifyInstance
  let accessToken: string

  beforeAll(async () => {
    app = createApp()
    await app.ready()
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'admin@library.local', password: 'admin1234' },
    })
    accessToken = JSON.parse(loginRes.body).accessToken
  })
  afterAll(() => app.close())

  it('returns 401 when no Authorization header', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/auth/logout' })
    expect(res.statusCode).toBe(401)
  })

  it('returns 200 and clears cookie when authenticated', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { authorization: `Bearer ${accessToken}` },
    })
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).success).toBe(true)
  })
})

describe('requireRole middleware', () => {
  let app: FastifyInstance
  let memberToken: string

  beforeAll(async () => {
    app = createApp()
    // Register a test-only admin route
    app.get(
      '/test/admin-only',
      { preHandler: [async (req, rep) => {
        const auth = req.headers.authorization
        if (!auth?.startsWith('Bearer ')) return rep.status(401).send({ error: 'UNAUTHORIZED' })
        const { verifyAccessToken } = await import('../src/lib/jwt')
        try { req.user = await verifyAccessToken(auth.slice(7)) }
        catch { return rep.status(401).send({ error: 'UNAUTHORIZED' }) }
      }, requireRole('ADMIN')] },
      async () => ({ ok: true }),
    )
    await app.ready()
    memberToken = await signAccessToken({ userId: 'fake-member', role: 'MEMBER' })
  })
  afterAll(() => app.close())

  it('returns 403 when MEMBER accesses an ADMIN route', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/test/admin-only',
      headers: { authorization: `Bearer ${memberToken}` },
    })
    expect(res.statusCode).toBe(403)
    expect(JSON.parse(res.body).error).toBe('FORBIDDEN')
  })
})
