// ============================================================
// File: src/components/waste/WasteTable.tsx
// Versi: v0.14.0
// Deskripsi: Tabel catatan waste — tanggal, produk, qty, alasan, biaya, catatan.
// ============================================================

import { useTranslations } from 'next-intl'
import type { WasteLog, Product } from '@/types'
import { formatRupiah, formatDate } from '@/lib/utils'

export interface WasteLogWithProduct extends Omit<WasteLog, 'product'> {
  product: Pick<Product, 'id' | 'name'> | null
}

interface Props {
  items: WasteLogWithProduct[]
}

export function WasteTable({ items }: Props) {
  const t = useTranslations('waste')
  const tReason = useTranslations('waste.reason')

  if (items.length === 0) {
    return (
      <div
        className="border rounded-md p-12 text-center text-sm"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)' }}
      >
        {t('noWaste')}
      </div>
    )
  }

  return (
    <div
      className="border rounded-md overflow-x-auto"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr
            className="text-left border-b"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <Th>{t('columnDate')}</Th>
            <Th>{t('columnProduct')}</Th>
            <Th className="text-right">{t('columnQty')}</Th>
            <Th>{t('columnReason')}</Th>
            <Th className="text-right">{t('columnCost')}</Th>
            <Th>{t('columnNotes')}</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((w) => (
            <tr
              key={w.id}
              className="border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Td style={{ color: 'var(--color-text-secondary)' }}>
                {formatDate(w.date)}
              </Td>
              <Td>
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {w.product?.name ?? '—'}
                </span>
              </Td>
              <Td className="text-right font-mono text-[13px] tabular-nums">
                {w.quantity}
              </Td>
              <Td>
                <span className="inline-flex items-center gap-1.5 text-[11px]">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: reasonColor(w.reason) }}
                  />
                  {tReason(w.reason)}
                </span>
              </Td>
              <Td className="text-right font-mono text-[13px] tabular-nums"
                style={{ color: 'var(--color-danger)' }}>
                {formatRupiah(w.waste_cost)}
              </Td>
              <Td style={{ color: 'var(--color-text-tertiary)' }} className="text-xs">
                {w.notes || '—'}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function reasonColor(r: string): string {
  const map: Record<string, string> = {
    Expired: 'var(--color-danger)',
    Damaged: 'var(--color-warning)',
    Sample:  'var(--color-accent)',
    Other:   'var(--color-text-tertiary)',
  }
  return map[r] ?? 'var(--color-text-tertiary)'
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wide ${className}`}>
      {children}
    </th>
  )
}

function Td({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <td className={`px-3 py-2.5 ${className}`} style={style}>
      {children}
    </td>
  )
}
