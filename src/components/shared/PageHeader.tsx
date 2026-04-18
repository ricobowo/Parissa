// ============================================================
// File: src/components/shared/PageHeader.tsx
// Versi: v0.2.0
// Deskripsi: Header halaman — kicker (monokrom), judul H1 display-
//            scale (responsif 24→36px), subtitle opsional, slot
//            aksi di kanan. Patuhi CLAUDE.md §6 "Crafted Minimalism"
//            (judul ekspresif, bukan kicker warna aksen).
// ============================================================

import type { ReactNode } from 'react'

interface PageHeaderProps {
  /** Label kecil di atas judul — pakai uppercase untuk style breadcrumb */
  kicker?: string
  /** Judul halaman utama (H1) — ditampilkan display-scale di desktop */
  title: string
  /** Deskripsi singkat di bawah judul */
  subtitle?: string
  /** Slot aksi di kanan — tombol/filter/dll */
  actions?: ReactNode
}

export function PageHeader({ kicker, title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
      <div className="min-w-0 flex-1">
        {kicker && (
          <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.14em] mb-2">
            {kicker}
          </p>
        )}
        {/* H1 responsif: 24px mobile → 36px desktop (display-scale) */}
        <h1 className="text-foreground text-[28px] md:text-[36px] font-semibold leading-[1.1] tracking-[-0.02em]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground text-sm md:text-base mt-2">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex-shrink-0 flex items-center gap-2 flex-wrap">{actions}</div>
      )}
    </header>
  )
}
