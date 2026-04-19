'use client'

// ============================================================
// File: src/components/dashboard/KpiCards.tsx
// Versi: v0.10.0
// Deskripsi: 6 kartu KPI dashboard (FR-006) — Total Revenue (hero),
//            Total Cost, Total Profit, Unpaid, Total Units, Total Transactions.
//            Style "Crafted Minimalism" (Zentra) — refactor memakai
//            shared <StatCard>: Revenue size="lg" sebagai hero angka
//            display 36px, 5 kartu lain size="md" (24px). Grid 3 kolom
//            desktop, 2 kolom tablet, 1 kolom mobile. Radius 14px,
//            shadow-xs, hover shadow-sm — semua via token.
// ============================================================

import { useTranslations } from 'next-intl'
import { formatRupiah } from '@/lib/formulas'
import { StatCard } from '@/components/shared/StatCard'

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

  // Ringkasan kartu — urutan: Revenue (hero), Profit, Cost, Unpaid, Units, Transactions
  const cards: {
    label: string
    value: string
    subtitle: string
    accent: 'default' | 'success' | 'warning' | 'danger'
    size: 'md' | 'lg'
  }[] = [
    {
      label: t('totalRevenue'),
      value: formatRupiah(data.totalRevenue),
      subtitle: t('subtitlePaidTxns'),
      accent: 'default',
      // Hero — angka display-scale 36px (Zentra presence)
      size: 'lg',
    },
    {
      label: t('totalProfit'),
      value: formatRupiah(data.totalProfit),
      subtitle: data.totalProfit > 0 ? t('subtitlePositive') : t('subtitleNegative'),
      accent: data.totalProfit > 0 ? 'success' : 'danger',
      size: 'md',
    },
    {
      label: t('totalCost'),
      value: formatRupiah(data.totalCost),
      subtitle: t('subtitleOpCost'),
      accent: 'default',
      size: 'md',
    },
    {
      label: t('unpaid'),
      value: formatRupiah(data.totalUnpaid),
      subtitle: t('subtitlePendingTxns', { count: data.unpaidCount }),
      accent: data.totalUnpaid > 0 ? 'warning' : 'default',
      size: 'md',
    },
    {
      label: t('totalUnits'),
      value: data.totalUnits.toLocaleString('id-ID'),
      subtitle: t('subtitleUnitsSold'),
      accent: 'default',
      size: 'md',
    },
    {
      label: t('totalTransactions'),
      value: data.totalTransactions.toLocaleString('id-ID'),
      subtitle:
        data.totalTransactions > 0
          ? t('subtitleAvgPrice', {
              amount: formatRupiah(Math.round(data.totalRevenue / data.totalTransactions)),
            })
          : t('subtitleNoTxns'),
      accent: 'default',
      size: 'md',
    },
  ]

  // Grid 1 / 2 / 3 kolom sesuai breakpoint — gap 16px (Zentra-density)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {cards.map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          subtitle={card.subtitle}
          accent={card.accent}
          size={card.size}
        />
      ))}
    </div>
  )
}
