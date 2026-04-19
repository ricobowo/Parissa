'use client'

// ============================================================
// File: src/components/dashboard/TransactionLists.tsx
// Versi: v0.10.0
// Deskripsi: Tabel detail transaksi Paid dan Unpaid terpisah (FR-011).
//            Style Zentra ("Crafted Minimalism"): wrapper card
//            radius 14px, shadow-xs, hover shadow-sm. Row hover
//            bg-bg-hover/40 + motion-base transition. Header
//            micro-label uppercase tracking 0.12em. Token-driven,
//            adaptif dark mode.
// ============================================================

import { useTranslations } from 'next-intl'
import { Sale, Product } from '@/types'
import { formatRupiah } from '@/lib/formulas'

// Tipe sale yang sudah join ke product
interface SaleWithProduct extends Sale {
  product: Product
}

interface TransactionListsProps {
  /** Semua transaksi yang sudah difilter */
  transactions: SaleWithProduct[]
}

export function TransactionLists({ transactions }: TransactionListsProps) {
  const t = useTranslations('dashboard')

  // Pisahkan transaksi lunas dan belum lunas
  const paidTxns = transactions.filter((txn) => txn.payment_status === 'Sudah')
  const unpaidTxns = transactions.filter((txn) => txn.payment_status === 'Belum')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tabel Transaksi Lunas */}
      <TransactionTable
        title={t('paidTransactions')}
        subtitle={t('txnCount', { count: paidTxns.length })}
        emptyText={t('noTransactions')}
        moreText={(count: number) => t('moreTransactions', { count })}
        transactions={paidTxns}
        status="success"
      />

      {/* Tabel Transaksi Belum Lunas */}
      <TransactionTable
        title={t('unpaidTransactions')}
        subtitle={t('txnCount', { count: unpaidTxns.length })}
        emptyText={t('noTransactions')}
        moreText={(count: number) => t('moreTransactions', { count })}
        transactions={unpaidTxns}
        status="warning"
      />
    </div>
  )
}

// -------------------------------------------------------------------
// Tabel transaksi individual — style Zentra, token-driven
// -------------------------------------------------------------------
function TransactionTable({
  title,
  subtitle,
  emptyText,
  moreText,
  transactions,
  status,
}: {
  title: string
  subtitle: string
  emptyText: string
  moreText: (count: number) => string
  transactions: SaleWithProduct[]
  status: 'success' | 'warning'
}) {
  // Warna dot dari token semantic aksen fungsional
  const dotColor =
    status === 'success' ? 'var(--color-success)' : 'var(--color-warning)'

  return (
    <div
      className="
        bg-card border border-border rounded-[14px] overflow-hidden
        shadow-[var(--shadow-xs)]
        transition-shadow duration-[var(--motion-base)] ease-[var(--ease-out)]
        hover:shadow-[var(--shadow-sm)]
      "
    >
      {/* Header tabel — micro-label uppercase + BadgeDot */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
          <h3 className="text-foreground text-[11px] font-medium uppercase tracking-[0.12em] leading-4">
            {title}
          </h3>
        </div>
        <span className="text-muted-foreground text-xs font-medium tabular-nums">
          {subtitle}
        </span>
      </div>

      {/* Body tabel */}
      {transactions.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-muted-foreground text-sm">{emptyText}</p>
        </div>
      ) : (
        <div className="max-h-[360px] overflow-y-auto">
          {transactions.slice(0, 20).map((txn, index) => (
            <div
              key={txn.id}
              className={`
                px-5 py-3.5 flex items-center justify-between
                transition-colors duration-[var(--motion-base)] ease-[var(--ease-out)]
                hover:bg-[color:var(--color-bg-hover)]/40
                ${index > 0 ? 'border-t border-border' : ''}
              `}
            >
              {/* Info kiri: nama + produk */}
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-semibold leading-5 truncate">
                  {txn.customer_name}
                </p>
                <p className="text-muted-foreground text-xs leading-4 mt-0.5">
                  {txn.product?.name ?? '—'} × {txn.amount}
                </p>
              </div>

              {/* Info kanan: harga + tanggal */}
              <div className="text-right ml-3 flex-shrink-0">
                <p className="text-foreground text-sm font-semibold leading-5 font-mono tabular-nums">
                  {formatRupiah(txn.sale_price)}
                </p>
                <p className="text-muted-foreground text-[11px] leading-4 mt-0.5">
                  {new Date(txn.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Info jika data terpotong */}
          {transactions.length > 20 && (
            <div className="px-5 py-3 border-t border-border text-center bg-[color:var(--color-bg-secondary)]/50">
              <p className="text-muted-foreground text-xs">
                {moreText(transactions.length - 20)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
