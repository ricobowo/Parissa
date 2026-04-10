// ============================================================
// File: src/app/[locale]/page.tsx
// Versi: v0.1.0
// Deskripsi: Halaman utama dashboard (placeholder)
// ============================================================

import { useTranslations } from 'next-intl'

export default function DashboardPage() {
  const t = useTranslations('dashboard')

  return (
    <main className="flex-1 p-4 md:p-6 max-w-[960px] mx-auto w-full">
      <h1 className="text-2xl font-semibold mb-6">{t('title')}</h1>
      <p className="text-text-secondary">Parissa POS — v0.1.0</p>
    </main>
  )
}
