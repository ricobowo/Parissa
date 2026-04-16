// ============================================================
// File: src/components/stock/StockStatusBadge.tsx
// Versi: v0.10.0
// Deskripsi: Badge status stok — dot + label.
//            Warna dari CSS variables (--color-success/warning/danger),
//            tidak hardcoded. Sesuai Design System Section 6.4.
// ============================================================

import { useTranslations } from 'next-intl'
import type { StockStatus } from '@/types'

interface Props {
  status: StockStatus
}

// Mapping status → CSS variable (bukan hex code, sesuai rule monokrom)
const STATUS_VAR: Record<StockStatus, string> = {
  Aman: 'var(--color-success)',
  Menipis: 'var(--color-warning)',
  Habis: 'var(--color-danger)',
}

export function StockStatusBadge({ status }: Props) {
  const t = useTranslations('stock.status')

  // Label diterjemahkan via i18n; key konsisten dengan StockStatus enum
  const label =
    status === 'Aman' ? t('safe') : status === 'Menipis' ? t('low') : t('empty')

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium"
      style={{ color: STATUS_VAR[status] }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: STATUS_VAR[status] }}
        aria-hidden
      />
      {label}
    </span>
  )
}
