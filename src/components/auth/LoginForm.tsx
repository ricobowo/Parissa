// ============================================================
// File: src/components/auth/LoginForm.tsx
// Versi: v0.4.0
// Deskripsi: Komponen form login — client component dengan Supabase Auth
// ============================================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function LoginForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Proses login menggunakan Supabase Auth
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(t('invalidCredentials'))
      setLoading(false)
      return
    }

    // Redirect ke dashboard setelah login berhasil
    router.push('/')
    router.refresh()
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4 w-full max-w-sm">
      {/* Input Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {t('email')}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
          required
          className="w-full px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-1"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
          }}
        />
      </div>

      {/* Input Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {t('password')}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-1"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
          }}
        />
      </div>

      {/* Pesan error jika login gagal */}
      {error && (
        <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
          {error}
        </p>
      )}

      {/* Tombol login */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '...' : t('loginButton')}
      </Button>
    </form>
  )
}
