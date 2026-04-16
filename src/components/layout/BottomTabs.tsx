// ============================================================
// File: src/components/layout/BottomTabs.tsx
// Versi: v0.4.0
// Deskripsi: Bottom tab bar navigasi mobile — max 5 tab, role-based
//            Menampilkan tab sesuai permissions user
// ============================================================

'use client'

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

// Tab yang tampil di mobile — prioritas berdasarkan frekuensi penggunaan
// Maksimal 5 tab untuk thumb-friendly navigation
// Urutan = prioritas; slice(0,5) mengambil tab tervisible teratas per role
const MOBILE_TABS = [
  { key: 'dashboard', href: '', icon: '▦' },
  { key: 'pos', href: '/pos', icon: '◎' },
  { key: 'stock', href: '/stock', icon: '▧' },
  { key: 'products', href: '/products', icon: '▤' },
  { key: 'reports', href: '/reports', icon: '▩' },
  { key: 'settings', href: '/settings', icon: '⚙' },
] as const

interface Props {
  locale: string
  permissions: Record<string, boolean>
}

export function BottomTabs({ locale, permissions }: Props) {
  const t = useTranslations('nav')
  const pathname = usePathname()

  // Filter tab berdasarkan permissions user (max 5)
  const visibleTabs = MOBILE_TABS.filter(
    (tab) => permissions[tab.key] === true
  ).slice(0, 5)

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t"
      style={{
        background: 'var(--color-bg)',
        borderColor: 'var(--color-border)',
      }}
    >
      {visibleTabs.map((tab) => {
        const href = `/${locale}${tab.href}`
        const isActive = tab.href === ''
          ? pathname === `/${locale}` || pathname === `/${locale}/`
          : pathname.startsWith(href)

        return (
          <Link
            key={tab.key}
            href={href}
            className="flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors"
            style={{
              color: isActive ? 'var(--color-text)' : 'var(--color-text-tertiary)',
            }}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-[10px] font-medium">
              {t(tab.key)}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
