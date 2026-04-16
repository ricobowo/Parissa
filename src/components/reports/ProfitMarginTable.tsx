'use client'

/**
 * @file   ProfitMarginTable.tsx
 * @version 1.0.0
 * @description Tabel profit margin per produk.
 *              Kolom: Produk, Revenue, Cost, Profit, Margin %, Unit terjual.
 *              Style: no zebra stripe, gray border-bottom separator,
 *              header uppercase 10px, angka monospace.
 */

import { useTranslations } from 'next-intl'
import { formatRupiah, formatMargin } from '@/lib/formulas'

export interface ProductProfitRow {
  productName: string
  totalRevenue: number
  totalCost: number
  totalProfit: number
  marginPercent: number
  unitsSold: number
}

interface ProfitMarginTableProps {
  data: ProductProfitRow[]
}

export function ProfitMarginTable({ data }: ProfitMarginTableProps) {
  const t = useTranslations('reports')

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-400/20 p-8 flex items-center justify-center font-['Inter']">
        <p className="text-zinc-400 text-sm">{t('noData')}</p>
      </div>
    )
  }

  // Hitung total baris paling bawah
  const totals = data.reduce(
    (acc, row) => ({
      totalRevenue: acc.totalRevenue + row.totalRevenue,
      totalCost: acc.totalCost + row.totalCost,
      totalProfit: acc.totalProfit + row.totalProfit,
      unitsSold: acc.unitsSold + row.unitsSold,
    }),
    { totalRevenue: 0, totalCost: 0, totalProfit: 0, unitsSold: 0 }
  )
  const totalMargin =
    totals.totalCost > 0
      ? ((totals.totalRevenue - totals.totalCost) / totals.totalCost) * 100
      : 0

  return (
    <div className="bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-400/20 overflow-hidden font-['Inter']">
      {/* Header section */}
      <div className="px-5 pt-5 pb-4">
        <p className="text-zinc-600 text-[10px] font-bold uppercase leading-4 tracking-wide">
          {t('profitMarginByProduct')}
        </p>
        <h3 className="text-slate-900 text-lg font-bold leading-7 mt-0.5">
          {t('profitMarginTable')}
        </h3>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="px-5 py-3 text-left text-zinc-500 text-[10px] font-bold uppercase tracking-wide">
                {t('productName')}
              </th>
              <th className="px-5 py-3 text-right text-zinc-500 text-[10px] font-bold uppercase tracking-wide">
                {t('revenue')}
              </th>
              <th className="px-5 py-3 text-right text-zinc-500 text-[10px] font-bold uppercase tracking-wide">
                {t('cost')}
              </th>
              <th className="px-5 py-3 text-right text-zinc-500 text-[10px] font-bold uppercase tracking-wide">
                {t('profit')}
              </th>
              <th className="px-5 py-3 text-right text-zinc-500 text-[10px] font-bold uppercase tracking-wide">
                {t('margin')}
              </th>
              <th className="px-5 py-3 text-right text-zinc-500 text-[10px] font-bold uppercase tracking-wide">
                {t('unitsSold')}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.productName} className="border-b border-zinc-100">
                <td className="px-5 py-3 text-sm text-gray-800 font-medium">
                  {row.productName}
                </td>
                <td className="px-5 py-3 text-right text-sm text-gray-800 font-['JetBrains_Mono',monospace] text-[13px]">
                  {formatRupiah(row.totalRevenue)}
                </td>
                <td className="px-5 py-3 text-right text-sm text-gray-800 font-['JetBrains_Mono',monospace] text-[13px]">
                  {formatRupiah(row.totalCost)}
                </td>
                <td className={`px-5 py-3 text-right font-['JetBrains_Mono',monospace] text-[13px] ${row.totalProfit >= 0 ? 'text-blue-700' : 'text-pink-800'}`}>
                  {formatRupiah(row.totalProfit)}
                </td>
                <td className={`px-5 py-3 text-right font-['JetBrains_Mono',monospace] text-[13px] ${row.marginPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatMargin(row.marginPercent)}
                </td>
                <td className="px-5 py-3 text-right text-sm text-gray-800 font-['JetBrains_Mono',monospace] text-[13px]">
                  {row.unitsSold.toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
          {/* Baris total */}
          <tfoot>
            <tr className="border-t-2 border-zinc-300 bg-zinc-50">
              <td className="px-5 py-3 text-sm text-gray-800 font-bold">
                Total
              </td>
              <td className="px-5 py-3 text-right font-bold font-['JetBrains_Mono',monospace] text-[13px] text-gray-800">
                {formatRupiah(totals.totalRevenue)}
              </td>
              <td className="px-5 py-3 text-right font-bold font-['JetBrains_Mono',monospace] text-[13px] text-gray-800">
                {formatRupiah(totals.totalCost)}
              </td>
              <td className={`px-5 py-3 text-right font-bold font-['JetBrains_Mono',monospace] text-[13px] ${totals.totalProfit >= 0 ? 'text-blue-700' : 'text-pink-800'}`}>
                {formatRupiah(totals.totalProfit)}
              </td>
              <td className={`px-5 py-3 text-right font-bold font-['JetBrains_Mono',monospace] text-[13px] ${totalMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatMargin(totalMargin)}
              </td>
              <td className="px-5 py-3 text-right font-bold font-['JetBrains_Mono',monospace] text-[13px] text-gray-800">
                {totals.unitsSold.toLocaleString('id-ID')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
