// src/middleware.ts (version étendue)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

const protectedRoutes = ['/cart', '/checkout', '/orders']
const adminRoutes = ['/admin']

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value
  const { pathname } = req.nextUrl

  // Routes admin
  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?redirect=/admin', req.url))
    }
    const payload = verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Routes protégées (user connecté)
  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !token) {
    const url = new URL('/login', req.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/cart', '/checkout', '/orders', '/admin/:path*', '/login', '/register'],
}