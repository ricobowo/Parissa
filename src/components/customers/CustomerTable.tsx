// ============================================================
// File: src/components/customers/CustomerTable.tsx
// Versi: v0.14.0
// Deskripsi: Tabel daftar pelanggan dengan kolom nama, telepon, label,
//            total transaksi, total belanja, produk favorit, terakhir beli.
// ============================================================

import { useTranslations } from 'next-intl'
import type { CustomerStats } from '@/types'
import { formatRupiah, formatDate } from '@/lib/utils'
import { LabelBadge } from './LabelBadge'

interface Props {
  customers: CustomerStats[]
  onEditLabel: (c: CustomerStats) => void
}

export function CustomerTable({ customers, onEditLabel }: Props) {
  const t = useTranslations('customers')
  const tCommon = useTranslations('common')

  if (customers.length === 0) {
    return (
      <div
        className="border rounded-md p-12 text-center text-sm"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)' }}
      >
        {t('noCustomers')}
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
            <Th>{t('columnName')}</Th>
            <Th>{t('columnPhone')}</Th>
            <Th>{t('columnLabel')}</Th>
            <Th className="text-right">{t('columnTxns')}</Th>
            <Th className="text-right">{t('columnSpending')}</Th>
            <Th>{t('columnFavorite')}</Th>
            <Th>{t('columnLastPurchase')}</Th>
            <Th className="text-right">{tCommon('actions')}</Th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr
              key={c.id}
              className="border-b hover:bg-[var(--color-bg-hover)] transition-colors"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Td>
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {c.name}
                </span>
              </Td>
              <Td style={{ color: 'var(--color-text-secondary)' }}>
                {c.phone ?? '—'}
              </Td>
              <Td>
                <LabelBadge label={c.label} color={c.label_color} />
              </Td>
              <Td className="text-right font-mono text-[13px] tabular-nums">
                {c.total_transactions}
              </Td>
              <Td className="text-right font-mono text-[13px] tabular-nums">
                {formatRupiah(c.total_spending)}
              </Td>
              <Td style={{ color: 'var(--color-text-secondary)' }}>
                {c.favorite_product_name ?? '—'}
              </Td>
              <Td style={{ color: 'var(--color-text-secondary)' }}>
                {formatDate(c.last_purchase_date)}
              </Td>
              <Td className="text-right">
                <button
                  onClick={() => onEditLabel(c)}
                  className="text-xs hover:underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {t('editLabel')}
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wide ${className}`}
    >
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
