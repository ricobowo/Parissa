'use client'

// ============================================================
// File: src/components/preorders/PreorderList.tsx
// Versi: v0.7.0
// Deskripsi: Komponen daftar pre-order dengan filter status
//            (All/Pending/Confirmed/Delivered/Cancelled).
//            Aksi: ubah status per item, mark Delivered → otomatis
//            update payment_status ke "Sudah" (tercatat di laporan).
//            Desain diselaraskan dengan HTML reference (Mobile.html).
// ============================================================

import { useState } from 'react'
import { Sale, Product } from '@/types'
import { formatRupiah } from '@/lib/formulas'

// Tipe sale yang sudah join ke product
interface SaleWithProduct extends Sale {
  product: Product
}

// Status pre-order yang tersedia
const PREORDER_STATUSES = ['Pending', 'Confirmed', 'Delivered', 'Cancelled'] as const
type PreorderStatus = (typeof PREORDER_STATUSES)[number]

// Tab filter termasuk "All"
const FILTER_TABS: { label: string; value: PreorderStatus | 'All' }[] = [
  { label: 'ALL', value: 'All' },
  { label: 'PENDING', value: 'Pending' },
  { label: 'CONFIRMED', value: 'Confirmed' },
  { label: 'DELIVERED', value: 'Delivered' },
  { label: 'CANCELLED', value: 'Cancelled' },
]

interface PreorderListProps {
  /** Daftar pre-order dari Supabase (sudah join ke products) */
  preorders: SaleWithProduct[]
  /** Sedang proses update */
  updatingId: string | null
  /** Callback saat status berubah */
  onStatusChange: (saleId: string, newStatus: PreorderStatus) => Promise<void>
}

export function PreorderList({ preorders, updatingId, onStatusChange }: PreorderListProps) {
  // Filter status yang aktif
  const [activeFilter, setActiveFilter] = useState<PreorderStatus | 'All'>('All')

  // Filter data berdasarkan status terpilih
  const filteredPreorders =
    activeFilter === 'All'
      ? preorders
      : preorders.filter((po) => po.pre_order_status === activeFilter)

  // Hitung jumlah per status untuk badge
  const countByStatus: Record<string, number> = {}
  for (const po of preorders) {
    const status = po.pre_order_status || 'Pending'
    countByStatus[status] = (countByStatus[status] || 0) + 1
  }

  return (
    <div className="flex flex-col gap-6 font-['Inter']">
      {/* ================================================================ */}
      {/* Filter tabs — scrollable horizontal sesuai HTML reference */}
      {/* ================================================================ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.value
          const count =
            tab.value === 'All'
              ? preorders.length
              : countByStatus[tab.value] || 0

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveFilter(tab.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold leading-4 tracking-tight transition-colors ${
                isActive
                  ? 'bg-indigo-100 text-blue-800'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ================================================================ */}
      {/* Daftar pre-order */}
      {/* ================================================================ */}
      {filteredPreorders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100">
          <p className="text-sm text-zinc-400">
            {activeFilter === 'All'
              ? 'Belum ada pre-order.'
              : `Tidak ada pre-order dengan status "${activeFilter}".`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredPreorders.map((po) => (
            <PreorderCard
              key={po.id}
              preorder={po}
              isUpdating={updatingId === po.id}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------------
// Kartu pre-order individual — sesuai HTML reference
// -------------------------------------------------------------------
function PreorderCard({
  preorder,
  isUpdating,
  onStatusChange,
}: {
  preorder: SaleWithProduct
  isUpdating: boolean
  onStatusChange: (saleId: string, newStatus: PreorderStatus) => Promise<void>
}) {
  const status = (preorder.pre_order_status || 'Pending') as PreorderStatus

  // Warna dan style per status
  const statusConfig: Record<
    PreorderStatus,
    { bg: string; text: string; border: string }
  > = {
    Pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-400' },
    Confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-400' },
    Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-400' },
    Cancelled: { bg: 'bg-zinc-100', text: 'text-zinc-500', border: 'border-zinc-300' },
  }

  const config = statusConfig[status]

  // Inisial nama pembeli untuk avatar
  const initials = preorder.customer_name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Format tanggal
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Aksi status yang tersedia berdasarkan status saat ini
  const availableActions = getAvailableActions(status)

  return (
    <div
      className={`p-5 bg-white rounded-lg border-l-4 ${config.border} flex flex-col gap-3 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-opacity ${
        isUpdating ? 'opacity-50' : ''
      }`}
    >
      {/* Baris atas: info pembeli + status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar inisial */}
          <div className="size-10 py-3 bg-gray-200 rounded-sm flex justify-center items-center flex-shrink-0">
            <span className="text-zinc-600 text-xs font-bold uppercase">
              {initials}
            </span>
          </div>
          {/* Nama + detail produk */}
          <div>
            <p className="text-gray-800 text-sm font-bold leading-5">
              {preorder.customer_name}
            </p>
            <p className="text-zinc-600 text-xs font-normal leading-4">
              {preorder.product.name} × {preorder.amount}
            </p>
          </div>
        </div>

        {/* Badge status */}
        <span
          className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wide ${config.bg} ${config.text}`}
        >
          {status}
        </span>
      </div>

      {/* Baris detail: tanggal, harga, payment */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-zinc-600 text-[9px] font-bold uppercase leading-3 tracking-wide">
            TGL PESAN
          </p>
          <p className="text-gray-800 text-xs font-medium leading-4 mt-0.5">
            {formatDate(preorder.date)}
          </p>
        </div>
        <div>
          <p className="text-zinc-600 text-[9px] font-bold uppercase leading-3 tracking-wide">
            TGL AMBIL
          </p>
          <p className="text-gray-800 text-xs font-medium leading-4 mt-0.5">
            {preorder.pre_order_date
              ? formatDate(preorder.pre_order_date)
              : '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-zinc-600 text-[9px] font-bold uppercase leading-3 tracking-wide">
            TOTAL
          </p>
          <p className="text-blue-700 text-xs font-bold leading-4 mt-0.5">
            {formatRupiah(preorder.sale_price)}
          </p>
        </div>
      </div>

      {/* Baris status bayar */}
      <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
        <div className="flex items-center gap-2">
          <span
            className={`size-2 rounded-full ${
              preorder.payment_status === 'Sudah' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span className="text-xs text-zinc-600">
            Bayar: <strong>{preorder.payment_status}</strong>
          </span>
        </div>

        {/* Catatan jika ada */}
        {preorder.notes && (
          <span className="text-[10px] text-zinc-400 truncate max-w-[120px]">
            {preorder.notes}
          </span>
        )}
      </div>

      {/* Tombol aksi — sesuai status */}
      {availableActions.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          {availableActions.map((action) => (
            <button
              key={action.status}
              type="button"
              onClick={() => onStatusChange(preorder.id, action.status)}
              disabled={isUpdating}
              className={`flex-1 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider text-center transition-colors disabled:opacity-50 ${action.className}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------------
// Tentukan aksi yang tersedia berdasarkan status saat ini
// -------------------------------------------------------------------
function getAvailableActions(
  status: PreorderStatus
): { label: string; status: PreorderStatus; className: string }[] {
  switch (status) {
    case 'Pending':
      return [
        {
          label: 'KONFIRMASI',
          status: 'Confirmed',
          className: 'bg-blue-700 text-white hover:bg-blue-800',
        },
        {
          label: 'BATALKAN',
          status: 'Cancelled',
          className: 'bg-white text-red-600 outline outline-1 outline-offset-[-1px] outline-zinc-200 hover:bg-red-50',
        },
      ]
    case 'Confirmed':
      return [
        {
          label: 'TANDAI DELIVERED',
          status: 'Delivered',
          className: 'bg-emerald-600 text-white hover:bg-emerald-700',
        },
        {
          label: 'BATALKAN',
          status: 'Cancelled',
          className: 'bg-white text-red-600 outline outline-1 outline-offset-[-1px] outline-zinc-200 hover:bg-red-50',
        },
      ]
    case 'Delivered':
      // Sudah selesai, tidak ada aksi
      return []
    case 'Cancelled':
      // Sudah dibatalkan, tidak ada aksi
      return []
    default:
      return []
  }
}
