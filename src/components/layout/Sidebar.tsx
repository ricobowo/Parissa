// ============================================================
// File: src/components/layout/Sidebar.tsx
// Versi: v0.4.0
// Deskripsi: Sidebar navigasi desktop — 240px, collapsible, role-based menu
//            Menu ditampilkan/disembunyikan berdasarkan permissions user
// ============================================================

'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import type { Role } from '@/types'

// Definisi icon sederhana sebagai SVG inline (menghindari dependency tambahan)
// Setiap menu punya: key (untuk permission check), href, dan label
const NAV_ITEMS = [
  { key: 'dashboard', href: '', icon: '▦' },
  { key: 'pos', href: '/pos', icon: '◎' },
  { key: 'products', href: '/products', icon: '▤' },
  { key: 'recipes', href: '/recipes', icon: '◈' },
  { key: 'stock', href: '/stock', icon: '▧' },
  { key: 'batching', href: '/batching', icon: '⬡' },
  { key: 'purchases', href: '/purchases', icon: '▨' },
  { key: 'reports', href: '/reports', icon: '▩' },
  { key: 'customers', href: '/customers', icon: '◉' },
  { key: 'preorders', href: '/preorders', icon: '◐' },
  { key: 'settings', href: '/settings', icon: '⚙' },
] as const

interface Props {
  locale: string
  permissions: Record<string, boolean>
  userName: string
}

export function Sidebar({ locale, permissions, userName }: Props) {
  const t = useTranslations('nav')
  const tAuth = useTranslations('auth')
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // Filter menu berdasarkan permissions user
  const visibleItems = NAV_ITEMS.filter(
    (item) => permissions[item.key] === true
  )

  return (
    <aside
      className="hidden md:flex flex-col h-screen sticky top-0 border-r transition-all duration-200"
      style={{
        width: collapsed ? 60 : 240,
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg-secondary)',
      }}
    >
      {/* Header sidebar — nama app + tombol collapse */}
      <div
        className="flex items-center justify-between px-4 h-14 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {!collapsed && (
          <span className="font-semibold text-sm">Parissa</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-[var(--color-bg-hover)] text-xs"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Menu navigasi */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {visibleItems.map((item) => {
          const href = `/${locale}${item.href}`
          const isActive = item.href === ''
            ? pathname === `/${locale}` || pathname === `/${locale}/`
            : pathname.startsWith(href)

          return (
            <Link
              key={item.key}
              href={href}
              className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
              style={{
                color: isActive ? 'var(--color-text)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 500 : 400,
                background: isActive ? 'var(--color-bg-hover)' : 'transparent',
              }}
              title={collapsed ? t(item.key) : undefined}
            >
              <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{t(item.key)}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer sidebar — nama user + logout */}
      <div
        className="border-t px-4 py-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {!collapsed && (
          <p className="text-xs truncate mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            {userName}
          </p>
        )}
        <form action={`/${locale}/auth/logout`} method="POST">
          <button
            type="submit"
            className="text-xs hover:underline"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {collapsed ? '⏻' : tAuth('logout')}
          </button>
        </form>
      </div>
    </aside>
  )
}
