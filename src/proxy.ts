import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/constants'

/**
 * Checagem otimista: se não houver cookie de sessão, manda para o login.
 * A verificação "de verdade" (assinatura do token) acontece em requireSession().
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLogin = pathname === '/admin/login'

  if (pathname.startsWith('/admin') && !isLogin) {
    const hasSession = request.cookies.has(SESSION_COOKIE_NAME)
    if (!hasSession) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
