import { SignJWT, jwtVerify } from 'jose'

export type JwtPayload = { userId: string; role: 'ADMIN' | 'MEMBER' }

function accessSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'dev-secret-for-library-app-change-in-prod!!'
  )
}

function refreshSecret() {
  return new TextEncoder().encode(
    process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-library-app-change-prod!!'
  )
}

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(accessSecret())
}

export async function signRefreshToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(refreshSecret())
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, accessSecret())
  return {
    userId: payload['userId'] as string,
    role: payload['role'] as JwtPayload['role'],
  }
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, refreshSecret())
  return {
    userId: payload['userId'] as string,
    role: payload['role'] as JwtPayload['role'],
  }
}
