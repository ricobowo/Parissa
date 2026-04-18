// ============================================================
// File: src/components/shared/StatCard.tsx
// Versi: v0.2.0
// Deskripsi: Kartu statistik — style Zentra ("Crafted Minimalism"):
//            surface elevated, radius 14px, soft shadow-xs,
//            hover shadow-sm, angka hero display-scale,
//            label uppercase tracking. Adaptif dark mode.
// ============================================================

import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: ReactNode
  subtitle?: ReactNode
  /** Warna nilai — "default" (foreground), atau token aksen fungsional */
  accent?: 'default' | 'success' | 'warning' | 'danger'
  /** Skala angka — "md" (default, 24px) atau "lg" (display 36px) untuk hero */
  size?: 'md' | 'lg'
}

const ACCENT_CLASS: Record<NonNullable<StatCardProps['accent']>, string> = {
  default: 'text-foreground',
  success: 'text-[color:var(--color-success)]',
  warning: 'text-[color:var(--color-warning)]',
  danger: 'text-[color:var(--color-danger)]',
}

const SIZE_CLASS: Record<NonNullable<StatCardProps['size']>, string> = {
  md: 'text-2xl leading-8',
  lg: 'text-[36px] leading-[1.1] tracking-[-0.02em]',
}

export function StatCard({
  label,
  value,
  subtitle,
  accent = 'default',
  size = 'md',
}: StatCardProps) {
  return (
    <div
      className="
        group bg-card border border-border rounded-[14px]
        px-5 py-4 flex flex-col gap-1.5
        shadow-[var(--shadow-xs)]
        transition-shadow duration-[var(--motion-base)] ease-[var(--ease-out)]
        hover:shadow-[var(--shadow-sm)]
      "
    >
      <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.12em] leading-4">
        {label}
      </p>
      <p
        className={`font-semibold font-mono tabular-nums ${SIZE_CLASS[size]} ${ACCENT_CLASS[accent]}`}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-muted-foreground text-[11px] leading-4 pt-0.5">{subtitle}</p>
      )}
    </div>
  )
}
