'use client'

// ============================================================
// File: src/components/dashboard/TransactionLists.tsx
// Versi: v0.9.0
// Deskripsi: Tabel detail transaksi Paid dan Unpaid terpisah (FR-011).
//            Token-driven theming (adaptif dark mode).
//            No zebra, badge dot-style sesuai §6.4 CLAUDE.md.
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
// Tabel transaksi individual — token-driven
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
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header tabel */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
          <h3 className="text-foreground text-sm font-semibold leading-5">
            {title}
          </h3>
        </div>
        <span className="text-muted-foreground text-xs font-medium">
          {subtitle}
        </span>
      </div>

      {/* Body tabel */}
      {transactions.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-muted-foreground text-sm">{emptyText}</p>
        </div>
      ) : (
        <div className="max-h-[360px] overflow-y-auto">
          {transactions.slice(0, 20).map((txn, index) => (
            <div
              key={txn.id}
              className={`px-5 py-3 flex items-center justify-between ${
                index > 0 ? 'border-t border-border' : ''
              }`}
            >
              {/* Info kiri: nama + produk */}
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-semibold leading-5 truncate">
                  {txn.customer_name}
                </p>
                <p className="text-muted-foreground text-xs leading-4">
                  {txn.product?.name ?? '—'} × {txn.amount}
                </p>
              </div>

              {/* Info kanan: harga + tanggal */}
              <div className="text-right ml-3 flex-shrink-0">
                <p className="text-foreground text-sm font-semibold leading-5 font-mono tabular-nums">
                  {formatRupiah(txn.sale_price)}
                </p>
                <p className="text-muted-foreground text-[10px] leading-4">
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
            <div className="px-5 py-3 border-t border-border text-center">
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
