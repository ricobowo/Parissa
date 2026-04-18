// ============================================================
// File: src/components/shared/ThemeToggle.tsx
// Versi: v0.1.0
// Deskripsi: Tombol toggle tema (Light / Dark / System)
//            Ikon: Sun / Moon / Monitor dari lucide-react
//            Cycle: light → dark → system → light...
// ============================================================

'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Cegah hydration mismatch — tema baru diketahui setelah client mount
  useEffect(() => setMounted(true), [])

  // Placeholder ukuran sama saat server render / belum mounted
  if (!mounted) {
    return (
      <div
        aria-hidden
        className="w-8 h-8 rounded-md"
        style={{ background: 'transparent' }}
      />
    )
  }

  // Cycle: light → dark → system
  const next =
    theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'

  // Ikon sesuai tema aktif (bukan resolvedTheme, agar "system" punya ikon sendiri)
  const Icon = theme === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun

  const label =
    theme === 'light'
      ? 'Tema: Terang. Klik untuk pindah ke Gelap'
      : theme === 'dark'
        ? 'Tema: Gelap. Klik untuk pindah ke Sistem'
        : 'Tema: Sistem. Klik untuk pindah ke Terang'

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors"
      style={{
        color: 'var(--color-text-secondary)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-bg-hover)'
        e.currentTarget.style.color = 'var(--color-text)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'var(--color-text-secondary)'
      }}
    >
      <Icon size={16} strokeWidth={1.75} />
    </button>
  )
}
