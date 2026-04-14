'use client'

// ============================================================
// File: src/components/dashboard/KpiCards.tsx
// Versi: v0.8.0
// Deskripsi: 6 kartu KPI dashboard — Total Revenue, Total Cost,
//            Total Profit, Unpaid, Purchase Amount, Total Transactions.
//            Style monokrom sesuai HTML reference (outline, no shadow).
//            FR-006: Kartu metrik dashboard.
// ============================================================

import { useTranslations } from 'next-intl'
import { formatRupiah } from '@/lib/formulas'

export interface KpiData {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  totalUnpaid: number
  totalUnits: number
  totalTransactions: number
  unpaidCount: number
}

interface KpiCardsProps {
  data: KpiData
}

export function KpiCards({ data }: KpiCardsProps) {
  const t = useTranslations('dashboard')

  // Definisi 6 kartu KPI sesuai PRD FR-006
  const cards: {
    label: string
    value: string
    subtitle: string
    valueColor: string
  }[] = [
    {
      label: t('totalRevenue'),
      value: formatRupiah(data.totalRevenue),
      subtitle: t('subtitlePaidTxns'),
      valueColor: 'text-slate-900',
    },
    {
      label: t('totalCost'),
      value: formatRupiah(data.totalCost),
      subtitle: t('subtitleOpCost'),
      valueColor: 'text-slate-900',
    },
    {
      label: t('totalProfit'),
      value: formatRupiah(data.totalProfit),
      subtitle: data.totalProfit > 0 ? t('subtitlePositive') : t('subtitleNegative'),
      valueColor: 'text-blue-700',
    },
    {
      label: t('unpaid'),
      value: formatRupiah(data.totalUnpaid),
      subtitle: t('subtitlePendingTxns', { count: data.unpaidCount }),
      valueColor: 'text-pink-800',
    },
    {
      label: t('totalUnits'),
      value: data.totalUnits.toLocaleString('id-ID'),
      subtitle: t('subtitleUnitsSold'),
      valueColor: 'text-slate-900',
    },
    {
      label: t('totalTransactions'),
      value: data.totalTransactions.toLocaleString('id-ID'),
      subtitle: data.totalTransactions > 0
        ? t('subtitleAvgPrice', { amount: formatRupiah(Math.round(data.totalRevenue / data.totalTransactions)) })
        : t('subtitleNoTxns'),
      valueColor: 'text-slate-900',
    },
  ]

  return (
    // Grid 2 kolom mobile, 3 kolom tablet, 6 kolom desktop (FR-012)
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-px bg-zinc-100 rounded-lg overflow-hidden outline outline-1 outline-offset-[-1px] outline-zinc-400/20">
      {cards.map((card) => (
        <div
          key={card.label}
          className="px-5 pt-5 pb-6 bg-white flex flex-col gap-1 font-['Inter']"
        >
          {/* Label KPI */}
          <p className="text-zinc-600 text-[10px] font-normal uppercase leading-4 tracking-wide">
            {card.label}
          </p>
          {/* Nilai utama */}
          <p className={`text-xl font-normal leading-7 ${card.valueColor}`}>
            {card.value}
          </p>
          {/* Subtitle / detail */}
          <p className="text-slate-400 text-[10px] font-normal leading-4 pt-1">
            {card.subtitle}
          </p>
        </div>
      ))}
    </div>
  )
}
