// ============================================================
// File: src/middleware.ts
// Versi: v0.5.1
// Deskripsi: Root middleware — locale routing (next-intl) + Supabase auth refresh
//            Dengan error handling agar tidak crash di Vercel Edge Runtime
// ============================================================

import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Middleware next-intl untuk locale routing
const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  // Langkah 1: Jalankan intl middleware untuk locale routing
  // Ini harus selalu jalan meskipun Supabase belum dikonfigurasi
  const response = intlMiddleware(request)

  // Langkah 2: Cek apakah env vars Supabase sudah tersedia
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Jika env vars belum diset, skip auth check — kembalikan response i18n saja
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[middleware] Supabase env vars belum diset — skip auth check')
    return response
  }

  try {
    // Langkah 3: Refresh Supabase session agar token tidak expired
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
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

    // Langkah 4: Redirect ke login jika belum terautentikasi
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
  } catch (error) {
    // Jika terjadi error pada auth check, log dan lanjutkan tanpa crash
    // Ini mencegah MIDDLEWARE_INVOCATION_FAILED di Vercel
    console.error('[middleware] Error saat auth check:', error)
  }

  return response
}

export const config = {
  matcher: ['/', '/(id|en)/:path*'],
}
