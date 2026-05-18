import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware to block /test/* routes in production
 * These are development-only test pages that should not be accessible to end users
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Block test routes in production
  if (process.env.NODE_ENV === 'production' && pathname.startsWith('/test')) {
    return new NextResponse('Page Not Found', { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/test/:path*',
}
