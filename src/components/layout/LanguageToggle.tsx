// ============================================================
// File: src/components/layout/LanguageToggle.tsx
// Versi: v0.4.0
// Deskripsi: Komponen toggle bahasa ID/EN — simpan preferensi ke profil user
// ============================================================

'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  // Ganti bahasa: ubah URL locale dan simpan ke profil user di database
  async function switchLanguage() {
    const newLocale = locale === 'id' ? 'en' : 'id'

    // Simpan preferensi bahasa ke profil user di database
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('users')
        .update({ language: newLocale })
        .eq('id', user.id)
    }

    // Ganti locale di URL: /id/pos → /en/pos
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPathname)
  }

  return (
    <button
      onClick={switchLanguage}
      className="px-2 py-1 text-xs font-medium rounded border transition-colors"
      style={{
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-secondary)',
      }}
      title={locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
    >
      {locale === 'id' ? 'EN' : 'ID'}
    </button>
  )
}
