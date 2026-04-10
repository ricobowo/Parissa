// ============================================================
// File: src/lib/supabase/middleware.ts
// Versi: v0.1.0
// Deskripsi: Middleware Supabase untuk refresh token dan proteksi rute
// ============================================================

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware untuk me-refresh sesi autentikasi dan melindungi rute.
 * Redirect ke /login jika user belum terautentikasi.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Daftar rute publik yang tidak memerlukan autentikasi
  const publicPaths = ['/login', '/auth']
  const pathname = request.nextUrl.pathname

  // Hapus prefix locale dari path untuk pengecekan
  const pathWithoutLocale = pathname.replace(/^\/(id|en)/, '')

  if (!user && !publicPaths.some((p) => pathWithoutLocale.startsWith(p))) {
    const locale = pathname.startsWith('/en') ? 'en' : 'id'
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
