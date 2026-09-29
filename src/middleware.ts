import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyTokenEdge } from '@/lib/auth-edge'

const protectedRoutes = ['/cart', '/checkout', '/orders']
const adminRoutes = ['/admin']
const authRoutes = ['/login', '/register']

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value
  const { pathname } = req.nextUrl

  // ===== 1. Routes admin (rôle ADMIN obligatoire) =====
  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    if (!token) {
      const url = new URL('/login', req.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    const payload = await verifyTokenEdge(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // ===== 2. Routes protégées (utilisateur connecté) =====
  if (protectedRoutes.some((r) => pathname.startsWith(r))) {
    if (!token) {
      const url = new URL('/login', req.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ===== 3. Rediriger les utilisateurs connectés hors de login/register =====
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/cart',
    '/checkout',
    '/orders',
    '/admin/:path*',
    '/login',
    '/register',
  ],
}