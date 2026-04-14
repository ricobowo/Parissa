// ============================================================
// File: src/app/[locale]/settings/page.tsx
// Versi: v0.4.0
// Deskripsi: Halaman Settings utama — navigasi ke sub-halaman pengaturan
// ============================================================

import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function SettingsPage() {
  const t = useTranslations('settings')
  const tNav = useTranslations('nav')

  // Daftar menu pengaturan
  const settingsMenu = [
    { href: 'settings/roles', label: t('roles'), desc: t('rolesDesc') },
    { href: 'settings/users', label: t('users'), desc: t('usersDesc') },
    { href: '#', label: t('language'), desc: t('languageDesc') },
    { href: '#', label: t('whatsapp'), desc: t('whatsappDesc') },
  ]

  return (
    <main className="flex-1 p-4 md:p-6 max-w-[960px] mx-auto w-full">
      <h1 className="text-2xl font-semibold mb-6">{tNav('settings')}</h1>

      {/* Grid menu pengaturan */}
      <div className="grid gap-3">
        {settingsMenu.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="block p-4 rounded-lg border transition-colors"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg)',
            }}
          >
            <p className="font-medium text-sm">{item.label}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              {item.desc}
            </p>
          </Link>
        ))}
      </div>
    </main>
  )
}
