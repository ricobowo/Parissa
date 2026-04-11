'use client'

// ============================================================
// File: src/components/dashboard/TransactionLists.tsx
// Versi: v0.8.0
// Deskripsi: Tabel detail transaksi Paid dan Unpaid terpisah (FR-011).
//            No zebra striping, gray border-bottom separator,
//            minimal status badges (dot + text, bukan pill penuh).
//            Desain diselaraskan dengan HTML reference.
// ============================================================

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
  // Pisahkan transaksi lunas dan belum lunas
  const paidTxns = transactions.filter((t) => t.payment_status === 'Sudah')
  const unpaidTxns = transactions.filter((t) => t.payment_status === 'Belum')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-['Inter']">
      {/* Tabel Transaksi Lunas */}
      <TransactionTable
        title="Transaksi Lunas"
        subtitle={`${paidTxns.length} transaksi`}
        transactions={paidTxns}
        statusColor="emerald"
      />

      {/* Tabel Transaksi Belum Lunas */}
      <TransactionTable
        title="Transaksi Belum Lunas"
        subtitle={`${unpaidTxns.length} transaksi`}
        transactions={unpaidTxns}
        statusColor="amber"
      />
    </div>
  )
}

// -------------------------------------------------------------------
// Tabel transaksi individual — sesuai HTML reference
// -------------------------------------------------------------------
function TransactionTable({
  title,
  subtitle,
  transactions,
  statusColor,
}: {
  title: string
  subtitle: string
  transactions: SaleWithProduct[]
  statusColor: 'emerald' | 'amber'
}) {
  // Warna dot per status
  const dotClass = statusColor === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'

  return (
    <div className="bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-400/20 overflow-hidden">
      {/* Header tabel */}
      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${dotClass}`} />
          <h3 className="text-gray-800 text-sm font-bold leading-5">
            {title}
          </h3>
        </div>
        <span className="text-zinc-400 text-xs font-medium">
          {subtitle}
        </span>
      </div>

      {/* Body tabel */}
      {transactions.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-zinc-400 text-sm">Tidak ada transaksi</p>
        </div>
      ) : (
        <div className="max-h-[360px] overflow-y-auto">
          {transactions.slice(0, 20).map((txn, index) => (
            <div
              key={txn.id}
              className={`px-5 py-3 flex items-center justify-between ${
                index > 0 ? 'border-t border-zinc-100' : ''
              }`}
            >
              {/* Info kiri: nama + produk */}
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 text-sm font-semibold leading-5 truncate">
                  {txn.customer_name}
                </p>
                <p className="text-zinc-500 text-xs leading-4">
                  {txn.product?.name ?? '—'} × {txn.amount}
                </p>
              </div>

              {/* Info kanan: harga + tanggal */}
              <div className="text-right ml-3 flex-shrink-0">
                <p className="text-gray-800 text-sm font-bold leading-5">
                  {formatRupiah(txn.sale_price)}
                </p>
                <p className="text-zinc-400 text-[10px] leading-4">
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
            <div className="px-5 py-3 border-t border-zinc-100 text-center">
              <p className="text-zinc-400 text-xs">
                +{transactions.length - 20} transaksi lainnya
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
