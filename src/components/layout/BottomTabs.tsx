// ============================================================
// File: src/components/layout/BottomTabs.tsx
// Versi: v0.5.0
// Deskripsi: Bottom tab bar navigasi mobile — max 5 tab, role-based
//            Icon dari lucide-react (unify dengan Sidebar).
// ============================================================

'use client'

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Package,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react'

// Tab mobile — prioritas frekuensi penggunaan (max 5 thumb-friendly)
const MOBILE_TABS: Array<{ key: string; href: string; Icon: LucideIcon }> = [
  { key: 'dashboard', href: '', Icon: LayoutDashboard },
  { key: 'pos', href: '/pos', Icon: ShoppingCart },
  { key: 'stock', href: '/stock', Icon: Boxes },
  { key: 'products', href: '/products', Icon: Package },
  { key: 'reports', href: '/reports', Icon: BarChart3 },
  { key: 'settings', href: '/settings', Icon: Settings },
]

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
        const Icon = tab.Icon

        return (
          <Link
            key={tab.key}
            href={href}
            className="flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors"
            style={{
              color: isActive ? 'var(--color-text)' : 'var(--color-text-tertiary)',
            }}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={20} strokeWidth={isActive ? 2 : 1.75} />
            <span className="text-[10px] font-medium">{t(tab.key)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
