import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function getTokenFromCookie(): string | null {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  return token || null
}

export function getCurrentUser(): JWTPayload | null {
  const token = getTokenFromCookie()
  if (!token) return null
  return verifyToken(token)
}

export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === 'ADMIN'
}