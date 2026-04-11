// ============================================================
// File: src/app/[locale]/(app)/layout.tsx
// Versi: v0.4.0
// Deskripsi: Layout untuk halaman authenticated — Sidebar + BottomTabs
// ============================================================

import { AppShell } from '@/components/layout/AppShell'

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <AppShell locale={locale}>
      {children}
    </AppShell>
  )
}
