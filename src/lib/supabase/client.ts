// ============================================================
// File: src/lib/supabase/client.ts
// Versi: v0.1.0
// Deskripsi: Konfigurasi Supabase client untuk sisi browser
// ============================================================

import { createBrowserClient } from '@supabase/ssr'

/**
 * Membuat Supabase client untuk digunakan di komponen browser (Client Component).
 * Mengambil konfigurasi dari environment variables.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
