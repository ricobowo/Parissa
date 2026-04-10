// ============================================================
// File: src/components/layout/AppShell.tsx
// Versi: v0.4.0
// Deskripsi: Layout utama aplikasi — Sidebar (desktop) + BottomTabs (mobile)
//            Menggabungkan navigasi, header, dan konten area
// ============================================================

import { getCurrentUser } from '@/lib/auth'
import { Sidebar } from './Sidebar'
import { BottomTabs } from './BottomTabs'
import { LanguageToggle } from './LanguageToggle'

interface Props {
  children: React.ReactNode
  locale: string
}

export async function AppShell({ children, locale }: Props) {
  // Ambil data user dan permissions dari database
  const user = await getCurrentUser()

  // Default permissions (semua false jika belum login / belum ada role)
  const permissions = (user?.role?.permissions as Record<string, boolean>) || {}
  const userName = user?.name || 'User'

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop — hanya tampil di md ke atas */}
      <Sidebar locale={locale} permissions={permissions} userName={userName} />

      {/* Area konten utama */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header — language toggle */}
        <header
          className="flex items-center justify-end px-4 h-12 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <LanguageToggle />
        </header>

        {/* Konten halaman */}
        <div className="flex-1 pb-16 md:pb-0">
          {children}
        </div>
      </div>

      {/* Bottom tabs mobile — hanya tampil di bawah md */}
      <BottomTabs locale={locale} permissions={permissions} />
    </div>
  )
}
