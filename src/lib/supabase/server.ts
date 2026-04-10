// ============================================================
// File: src/lib/supabase/server.ts
// Versi: v0.1.0
// Deskripsi: Konfigurasi Supabase client untuk sisi server
// ============================================================

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Membuat Supabase client untuk digunakan di Server Component, Route Handler, atau Server Action.
 * Mengelola cookie secara otomatis untuk autentikasi.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Diabaikan jika dipanggil dari Server Component (read-only)
          }
        },
      },
    }
  )
}
