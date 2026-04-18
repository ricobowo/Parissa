// ============================================================
// File: src/lib/wa.ts
// Versi: v0.15.0
// Deskripsi: Helper konfigurasi WhatsApp per user (tabel wa_config)
// ============================================================

import { createClient } from '@/lib/supabase/server'

export interface WaConfig {
  id: string
  user_id: string
  phone: string
  is_enabled: boolean
  updated_at: string
}

/**
 * Ambil konfigurasi WA user saat ini. Null jika belum pernah diatur.
 */
export async function getMyWaConfig(): Promise<WaConfig | null> {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data } = await supabase
    .from('wa_config')
    .select('*')
    .eq('user_id', authUser.id)
    .maybeSingle()

  return data
}

// Validasi nomor HP format Fonnte (628xxxxxxxxx, 11-16 digit total)
export function isValidPhone(phone: string): boolean {
  return /^628[0-9]{8,13}$/.test(phone)
}
