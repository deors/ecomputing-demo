import type { FastifyRequest, FastifyReply } from 'fastify'
import type { JwtPayload } from '../lib/jwt'

export function requireRole(role: JwtPayload['role']) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      await reply.status(401).send({ error: 'UNAUTHORIZED' })
      return
    }
    if (role === 'ADMIN' && request.user.role !== 'ADMIN') {
      await reply.status(403).send({ error: 'FORBIDDEN' })
    }
  }
}
