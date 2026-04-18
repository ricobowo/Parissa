// ============================================================
// File: src/components/shared/PageHeader.tsx
// Versi: v0.1.0
// Deskripsi: Header halaman standar — kicker (breadcrumb monokrom),
//            judul H1, subtitle opsional, dan slot action di kanan.
//            Menggantikan pattern "KICKER BIRU + H1 + subtitle" lama.
// ============================================================

import type { ReactNode } from 'react'

interface PageHeaderProps {
  /** Label kecil di atas judul — pakai uppercase untuk style breadcrumb */
  kicker?: string
  /** Judul halaman utama (H1) */
  title: string
  /** Deskripsi singkat di bawah judul */
  subtitle?: string
  /** Slot aksi di kanan — tombol/filter/dll */
  actions?: ReactNode
}

export function PageHeader({ kicker, title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 mb-6">
      <div className="min-w-0 flex-1">
        {kicker && (
          <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider mb-1">
            {kicker}
          </p>
        )}
        <h1 className="text-foreground text-2xl font-semibold leading-8 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex-shrink-0 flex items-center gap-2">{actions}</div>}
    </header>
  )
}
