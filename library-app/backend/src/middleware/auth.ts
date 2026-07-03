import type { FastifyRequest, FastifyReply } from 'fastify'
import { verifyAccessToken, type JwtPayload } from '../lib/jwt'

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const auth = request.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    await reply.status(401).send({ error: 'UNAUTHORIZED' })
    return
  }
  try {
    request.user = await verifyAccessToken(auth.slice(7))
  } catch {
    await reply.status(401).send({ error: 'UNAUTHORIZED' })
  }
}
