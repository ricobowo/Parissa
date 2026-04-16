'use client'

/**
 * @file   ReportFilters.tsx
 * @version 1.0.0
 * @description Filter bar untuk halaman laporan — periode (bulan/tahun),
 *              produk, dan status bayar. Style monokrom Notion-style.
 */

import { useTranslations } from 'next-intl'
import { Product } from '@/types'

export interface ReportFilterValues {
  month: string        // format: "YYYY-MM"
  productId: string    // "all" atau UUID produk
  paymentStatus: string // "all" | "Sudah" | "Belum"
}

interface ReportFiltersProps {
  filters: ReportFilterValues
  onFilterChange: (filters: ReportFilterValues) => void
  products: Product[]
  /** Sembunyikan filter status bayar (untuk monthly report) */
  hidePaymentStatus?: boolean
}

// Buat daftar bulan 12 bulan terakhir untuk pilihan filter
function getMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = []
  const now = new Date()

  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    options.push({ value, label })
  }

  return options
}

export function ReportFilters({
  filters,
  onFilterChange,
  products,
  hidePaymentStatus = false,
}: ReportFiltersProps) {
  const t = useTranslations('reports')
  const monthOptions = getMonthOptions()

  // Helper untuk update 1 field filter
  const updateFilter = (key: keyof ReportFilterValues, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const hasActiveFilter =
    filters.productId !== 'all' || filters.paymentStatus !== 'all'

  return (
    <div className="p-4 md:p-6 bg-zinc-100 rounded-lg flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Filter: Periode (bulan) */}
        <div className="flex flex-col gap-1">
          <label className="text-zinc-600 text-[10px] font-bold uppercase leading-4 tracking-wide">
            {t('period')}
          </label>
          <select
            value={filters.month}
            onChange={(e) => updateFilter('month', e.target.value)}
            className="min-w-44 px-4 py-2 bg-white rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-400/20 text-gray-800 text-sm font-normal"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter: Produk */}
        <div className="flex flex-col gap-1">
          <label className="text-zinc-600 text-[10px] font-bold uppercase leading-4 tracking-wide">
            {t('product')}
          </label>
          <select
            value={filters.productId}
            onChange={(e) => updateFilter('productId', e.target.value)}
            className="min-w-48 px-4 py-2 bg-white rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-400/20 text-gray-800 text-sm font-normal"
          >
            <option value="all">{t('allProducts')}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter: Status Bayar (opsional) */}
        {!hidePaymentStatus && (
          <div className="flex flex-col gap-1">
            <label className="text-zinc-600 text-[10px] font-bold uppercase leading-4 tracking-wide">
              {t('paymentStatus')}
            </label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => updateFilter('paymentStatus', e.target.value)}
              className="min-w-40 px-4 py-2 bg-white rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-400/20 text-gray-800 text-sm font-normal"
            >
              <option value="all">{t('allStatuses')}</option>
              <option value="Sudah">{t('paid')}</option>
              <option value="Belum">{t('unpaid')}</option>
            </select>
          </div>
        )}
      </div>

      {/* Tombol reset filter */}
      {hasActiveFilter && (
        <button
          type="button"
          onClick={() =>
            onFilterChange({ ...filters, productId: 'all', paymentStatus: 'all' })
          }
          className="px-6 py-2 bg-white rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-400/20 text-gray-800 text-sm font-medium hover:bg-zinc-50 transition-colors"
        >
          {t('resetFilter')}
        </button>
      )}
    </div>
  )
}
