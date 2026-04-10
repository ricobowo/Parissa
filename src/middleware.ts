// ============================================================
// File: src/middleware.ts
// Versi: v0.4.0
// Deskripsi: Root middleware — locale routing (next-intl) + Supabase auth refresh
// ============================================================

import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Middleware next-intl untuk locale routing
const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  // Langkah 1: Jalankan intl middleware untuk locale routing
  const response = intlMiddleware(request)

  // Langkah 2: Refresh Supabase session agar token tidak expired
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Ambil user session (ini juga me-refresh token jika perlu)
  const { data: { user } } = await supabase.auth.getUser()

  // Langkah 3: Redirect ke login jika belum terautentikasi
  const pathname = request.nextUrl.pathname
  const isLoginPage = pathname.includes('/login')
  const isPublicPath = isLoginPage || pathname.includes('/auth')

  if (!user && !isPublicPath) {
    // Tentukan locale dari path
    const locale = pathname.startsWith('/en') ? 'en' : 'id'
    const loginUrl = new URL(`/${locale}/login`, request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Jika sudah login tapi akses halaman login, redirect ke dashboard
  if (user && isLoginPage) {
    const locale = pathname.startsWith('/en') ? 'en' : 'id'
    const dashboardUrl = new URL(`/${locale}`, request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return response
}

export const config = {
  matcher: ['/', '/(id|en)/:path*'],
}
