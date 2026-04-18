// ============================================================
// File: src/components/shared/BadgeDot.tsx
// Versi: v0.1.0
// Deskripsi: Badge status minimal — dot berwarna + teks (CLAUDE.md §6.4).
//            Varian: success (hijau), warning (oranye), danger (merah),
//            neutral (abu-abu, default).
// ============================================================

import type { ReactNode } from 'react'

export type BadgeDotVariant = 'success' | 'warning' | 'danger' | 'neutral'

interface BadgeDotProps {
  variant?: BadgeDotVariant
  children: ReactNode
  className?: string
}

const VARIANT_COLOR: Record<BadgeDotVariant, string> = {
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  neutral: 'var(--color-text-tertiary)',
}

export function BadgeDot({ variant = 'neutral', children, className = '' }: BadgeDotProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-foreground ${className}`}
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: VARIANT_COLOR[variant] }}
      />
      {children}
    </span>
  )
}
