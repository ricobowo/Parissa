// ============================================================
// File: src/components/layout/Sidebar.tsx
// Versi: v0.5.0
// Deskripsi: Sidebar navigasi desktop — 240px, collapsible, role-based menu
//            Icon dari lucide-react (unify icon family).
// ============================================================

'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BookOpen,
  Boxes,
  Hexagon,
  Receipt,
  BarChart3,
  Users,
  CalendarClock,
  Trash2,
  History,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
// Setiap menu: key (permission), href, Icon
const NAV_ITEMS: Array<{
  key: string
  href: string
  Icon: LucideIcon
}> = [
  { key: 'dashboard', href: '', Icon: LayoutDashboard },
  { key: 'pos', href: '/pos', Icon: ShoppingCart },
  { key: 'products', href: '/products', Icon: Package },
  { key: 'recipes', href: '/recipes', Icon: BookOpen },
  { key: 'stock', href: '/stock', Icon: Boxes },
  { key: 'batching', href: '/batching', Icon: Hexagon },
  { key: 'purchases', href: '/purchases', Icon: Receipt },
  { key: 'reports', href: '/reports', Icon: BarChart3 },
  { key: 'customers', href: '/customers', Icon: Users },
  { key: 'preorders', href: '/preorders', Icon: CalendarClock },
  { key: 'waste', href: '/waste', Icon: Trash2 },
  { key: 'history', href: '/history', Icon: History },
  { key: 'settings', href: '/settings', Icon: Settings },
]

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
          className="p-1.5 rounded hover:bg-[var(--color-bg-hover)] transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          title={collapsed ? 'Expand' : 'Collapse'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Menu navigasi */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {visibleItems.map((item) => {
          const href = `/${locale}${item.href}`
          const isActive = item.href === ''
            ? pathname === `/${locale}` || pathname === `/${locale}/`
            : pathname.startsWith(href)

          const Icon = item.Icon
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
              <Icon size={16} strokeWidth={1.75} className="flex-shrink-0" />
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
            className="inline-flex items-center gap-1.5 text-xs hover:underline"
            style={{ color: 'var(--color-text-tertiary)' }}
            aria-label={tAuth('logout')}
          >
            <LogOut size={12} strokeWidth={1.75} />
            {!collapsed && <span>{tAuth('logout')}</span>}
          </button>
        </form>
      </div>
    </aside>
  )
}
