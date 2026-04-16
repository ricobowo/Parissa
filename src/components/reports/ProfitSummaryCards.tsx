'use client'

/**
 * @file   ProfitSummaryCards.tsx
 * @version 1.0.0
 * @description 3 kartu ringkasan profit: Total Revenue, Total Cost, Total Profit.
 *              Dengan indikator pertumbuhan month-over-month.
 *              Style monokrom Notion-style (outline, no shadow).
 */

import { useTranslations } from 'next-intl'
import { formatRupiah } from '@/lib/formulas'

export interface ProfitSummaryData {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  /** Pertumbuhan revenue vs bulan lalu (%) — null jika tidak ada data */
  revenueGrowth: number | null
  /** Pertumbuhan cost vs bulan lalu (%) */
  costGrowth: number | null
  /** Pertumbuhan profit vs bulan lalu (%) */
  profitGrowth: number | null
}

interface ProfitSummaryCardsProps {
  data: ProfitSummaryData
}

// Komponen indikator pertumbuhan (arrow + persentase)
function GrowthIndicator({ value, t }: { value: number | null; t: ReturnType<typeof useTranslations> }) {
  if (value === null) {
    return (
      <span className="text-zinc-400 text-[10px] leading-4">
        {t('noGrowthData')}
      </span>
    )
  }

  const isPositive = value > 0
  const isZero = value === 0
  const arrow = isPositive ? '\u2191' : isZero ? '\u2192' : '\u2193'
  // Warna: hijau naik, merah turun, abu-abu nol
  const colorClass = isPositive
    ? 'text-emerald-600'
    : isZero
      ? 'text-zinc-400'
      : 'text-red-600'

  return (
    <span className={`text-[10px] font-medium leading-4 ${colorClass}`}>
      {arrow} {Math.abs(value).toFixed(1)}% {t('vsLastMonth')}
    </span>
  )
}

export function ProfitSummaryCards({ data }: ProfitSummaryCardsProps) {
  const t = useTranslations('reports')

  const cards: {
    label: string
    value: string
    subtitle: string
    growth: number | null
    valueColor: string
  }[] = [
    {
      label: t('totalRevenue'),
      value: formatRupiah(data.totalRevenue),
      subtitle: t('fromPaidTxns'),
      growth: data.revenueGrowth,
      valueColor: 'text-slate-900',
    },
    {
      label: t('totalCost'),
      value: formatRupiah(data.totalCost),
      subtitle: t('operationalCost'),
      growth: data.costGrowth,
      valueColor: 'text-slate-900',
    },
    {
      label: t('totalProfit'),
      value: formatRupiah(data.totalProfit),
      subtitle: t('netProfit'),
      growth: data.profitGrowth,
      valueColor: data.totalProfit >= 0 ? 'text-blue-700' : 'text-pink-800',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-100 rounded-lg overflow-hidden outline outline-1 outline-offset-[-1px] outline-zinc-400/20">
      {cards.map((card) => (
        <div
          key={card.label}
          className="px-5 pt-5 pb-6 bg-white flex flex-col gap-1 font-['Inter']"
        >
          {/* Label */}
          <p className="text-zinc-600 text-[10px] font-normal uppercase leading-4 tracking-wide">
            {card.label}
          </p>
          {/* Nilai utama */}
          <p className={`text-xl font-normal leading-7 ${card.valueColor}`}>
            {card.value}
          </p>
          {/* Subtitle */}
          <p className="text-slate-400 text-[10px] font-normal leading-4 pt-0.5">
            {card.subtitle}
          </p>
          {/* Indikator pertumbuhan */}
          <div className="pt-1">
            <GrowthIndicator value={card.growth} t={t} />
          </div>
        </div>
      ))}
    </div>
  )
}
