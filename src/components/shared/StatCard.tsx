// ============================================================
// File: src/components/shared/StatCard.tsx
// Versi: v0.1.0
// Deskripsi: Kartu statistik minimalis — label uppercase, angka besar
//            (mono + tabular), subtitle opsional. Adaptif dark mode.
// ============================================================

import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: ReactNode
  subtitle?: ReactNode
  /** Warna nilai — "default" (foreground), atau token aksen fungsional */
  accent?: 'default' | 'success' | 'warning' | 'danger'
}

const ACCENT_CLASS: Record<NonNullable<StatCardProps['accent']>, string> = {
  default: 'text-foreground',
  success: 'text-[color:var(--color-success)]',
  warning: 'text-[color:var(--color-warning)]',
  danger: 'text-[color:var(--color-danger)]',
}

export function StatCard({ label, value, subtitle, accent = 'default' }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg px-5 py-4 flex flex-col gap-1">
      <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider leading-4">
        {label}
      </p>
      <p className={`text-xl font-normal leading-7 font-mono tabular-nums ${ACCENT_CLASS[accent]}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-muted-foreground/70 text-[10px] leading-4 pt-0.5">{subtitle}</p>
      )}
    </div>
  )
}
