import type { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt'
import { requireAuth } from '../middleware/auth'

const REFRESH_COOKIE_TTL = 7 * 24 * 60 * 60 // 7 days in seconds

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: { email: string; password: string } }>('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return reply.status(401).send({ error: 'INVALID_CREDENTIALS' })
    }

    const jwtPayload = { userId: user.id, role: user.role as 'ADMIN' | 'MEMBER' }
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(jwtPayload),
      signRefreshToken(jwtPayload),
    ])

    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: REFRESH_COOKIE_TTL,
    })

    return { accessToken, user: { id: user.id, email: user.email, role: user.role } }
  })

  app.post('/api/auth/refresh', async (request, reply) => {
    const token = request.cookies?.refreshToken
    if (!token) return reply.status(401).send({ error: 'UNAUTHORIZED' })
    try {
      const payload = await verifyRefreshToken(token)
      const accessToken = await signAccessToken(payload)
      return { accessToken }
    } catch {
      return reply.status(401).send({ error: 'UNAUTHORIZED' })
    }
  })

  app.post('/api/auth/logout', { preHandler: [requireAuth] }, async (_request, reply) => {
    reply.clearCookie('refreshToken', { path: '/api/auth/refresh' })
    return { success: true }
  })
}
