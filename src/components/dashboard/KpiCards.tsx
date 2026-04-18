'use client'

// ============================================================
// File: src/components/dashboard/KpiCards.tsx
// Versi: v0.9.0
// Deskripsi: 6 kartu KPI dashboard — Total Revenue, Total Cost,
//            Total Profit, Unpaid, Purchase Amount, Total Transactions.
//            Style monokrom sesuai CLAUDE.md §6 — pakai semantic token
//            (bg-card, text-foreground) agar otomatis adaptif dark mode.
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
      valueColor: 'text-foreground',
    },
    {
      label: t('totalCost'),
      value: formatRupiah(data.totalCost),
      subtitle: t('subtitleOpCost'),
      valueColor: 'text-foreground',
    },
    {
      label: t('totalProfit'),
      value: formatRupiah(data.totalProfit),
      subtitle: data.totalProfit > 0 ? t('subtitlePositive') : t('subtitleNegative'),
      // Warna aksen hanya untuk nilai fungsional (profit > 0)
      valueColor: data.totalProfit > 0
        ? 'text-[color:var(--color-success)]'
        : 'text-[color:var(--color-danger)]',
    },
    {
      label: t('unpaid'),
      value: formatRupiah(data.totalUnpaid),
      subtitle: t('subtitlePendingTxns', { count: data.unpaidCount }),
      valueColor: data.totalUnpaid > 0
        ? 'text-[color:var(--color-warning)]'
        : 'text-foreground',
    },
    {
      label: t('totalUnits'),
      value: data.totalUnits.toLocaleString('id-ID'),
      subtitle: t('subtitleUnitsSold'),
      valueColor: 'text-foreground',
    },
    {
      label: t('totalTransactions'),
      value: data.totalTransactions.toLocaleString('id-ID'),
      subtitle: data.totalTransactions > 0
        ? t('subtitleAvgPrice', { amount: formatRupiah(Math.round(data.totalRevenue / data.totalTransactions)) })
        : t('subtitleNoTxns'),
      valueColor: 'text-foreground',
    },
  ]

  return (
    // Grid 2 kolom mobile, 3 kolom tablet, 6 kolom desktop (FR-012).
    // Border-hairlines via gap + bg-border — adaptif dark mode.
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-px bg-border rounded-lg overflow-hidden border border-border">
      {cards.map((card) => (
        <div
          key={card.label}
          className="px-5 pt-5 pb-6 bg-card flex flex-col gap-1"
        >
          {/* Label KPI — uppercase, tracking rapat */}
          <p className="text-muted-foreground text-[10px] font-normal uppercase leading-4 tracking-wide">
            {card.label}
          </p>
          {/* Nilai utama — font monospace untuk angka (CLAUDE.md §6.3) */}
          <p className={`text-xl font-normal leading-7 font-mono tabular-nums ${card.valueColor}`}>
            {card.value}
          </p>
          {/* Subtitle / detail — tertiary color */}
          <p className="text-muted-foreground/70 text-[10px] font-normal leading-4 pt-1">
            {card.subtitle}
          </p>
        </div>
      ))}
    </div>
  )
}
