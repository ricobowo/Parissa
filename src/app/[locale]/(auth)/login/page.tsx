// ============================================================
// File: src/app/[locale]/login/page.tsx
// Versi: v0.4.0
// Deskripsi: Halaman login — tampilan minimalis Notion-style
// ============================================================

import { useTranslations } from 'next-intl'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  const t = useTranslations('auth')

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header login */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">{t('loginTitle')}</h1>
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Parissa POS — v0.4.0
          </p>
        </div>

        {/* Form login */}
        <LoginForm />
      </div>
    </main>
  )
}
