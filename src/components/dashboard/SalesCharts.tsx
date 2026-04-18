'use client'

// ============================================================
// File: src/components/dashboard/SalesCharts.tsx
// Versi: v0.9.0
// Deskripsi: 3 chart dashboard menggunakan Recharts:
//            1. Bar chart — Distribusi penjualan per produk (FR-007)
//            2. Donut chart — Bundling vs Non-Bundling (FR-008)
//            3. Stacked bar — Revenue harian per produk (FR-009)
//            Palette adaptif dark mode via CSS variables.
// ============================================================

import { useTranslations } from 'next-intl'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { formatRupiah } from '@/lib/formulas'

// -------------------------------------------------------------------
// Tipe data untuk chart
// -------------------------------------------------------------------
export interface ProductSalesData {
  productName: string
  totalRevenue: number
  totalUnits: number
}

export interface BundlingData {
  name: string
  value: number
  revenue: number
}

export interface DailySalesData {
  date: string
  [productName: string]: string | number
}

// Warna produk — pakai CSS var agar adaptif tema.
// Recharts menerima `var(--x)` langsung di prop fill/stroke.
const PRODUCT_COLORS = [
  'var(--color-accent)',
  'var(--color-text-secondary)',
  'var(--color-text-tertiary)',
  'var(--color-border)',
  'var(--color-text-secondary)',
  'var(--color-border)',
]

// Donut: aksen vs muted
const DONUT_COLORS = ['var(--color-accent)', 'var(--color-border)']

// Tooltip bersama — muncul di atas bg card (adaptif)
const tooltipContentStyle = {
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontSize: 12,
}

// -------------------------------------------------------------------
// 1. Bar Chart — Distribusi Penjualan per Produk (FR-007)
// -------------------------------------------------------------------
export function SalesDistributionChart({
  data,
}: {
  data: ProductSalesData[]
}) {
  const t = useTranslations('dashboard')

  if (data.length === 0) return <ChartEmpty label={t('salesPerProduct')} />

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <p className="text-muted-foreground text-[10px] font-semibold uppercase leading-4 tracking-wide">
          {t('productPerformance')}
        </p>
        <h3 className="text-foreground text-lg md:text-xl font-semibold leading-7 mt-0.5">
          {t('salesPerProduct')}
        </h3>
      </div>

      {/* Chart area */}
      <div className="h-56 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="productName"
              tick={{ fontSize: 10, fill: 'var(--color-text-secondary)', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip
              formatter={(value) => formatRupiah(Number(value as number))}
              contentStyle={tooltipContentStyle}
              cursor={{ fill: 'var(--color-bg-hover)' }}
            />
            <Bar
              dataKey="totalRevenue"
              name={t('revenue')}
              fill="var(--color-accent)"
              fillOpacity={0.85}
              radius={[0, 4, 4, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// -------------------------------------------------------------------
// 2. Donut Chart — Bundling vs Non-Bundling (FR-008)
// -------------------------------------------------------------------
export function BundlingRatioChart({
  data,
}: {
  data: BundlingData[]
}) {
  const t = useTranslations('dashboard')

  if (data.length === 0) return <ChartEmpty label={t('bundlingRatio')} />

  const total = data.reduce((sum, d) => sum + d.value, 0)
  const bundlingPct = total > 0
    ? Math.round((data.find((d) => d.name === 'Bundling')?.value ?? 0) / total * 100)
    : 0

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
      {/* Header */}
      <div className="mb-4">
        <p className="text-muted-foreground text-[10px] font-semibold uppercase leading-4 tracking-wider">
          {t('purchaseRatio')}
        </p>
        <h3 className="text-foreground text-sm md:text-base font-medium leading-5 mt-0.5">
          {t('bundlingRatio')}
        </h3>
      </div>

      {/* Donut chart dengan label tengah */}
      <div className="h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${Number(value as number)} ${t('transactions')}`,
                String(name as string),
              ]}
              contentStyle={tooltipContentStyle}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Label tengah donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-foreground text-2xl font-semibold leading-8 font-mono tabular-nums">
            {bundlingPct}%
          </span>
          <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
            BUNDLING
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3 pt-4 border-t border-border mt-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: DONUT_COLORS[index] }}
              />
              <span className="text-foreground text-xs font-medium leading-4">
                {item.name}
              </span>
            </div>
            <span className="text-foreground text-xs font-semibold leading-4 font-mono tabular-nums">
              {total > 0 ? Math.round(item.value / total * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// -------------------------------------------------------------------
// 3. Stacked Bar Chart — Revenue Harian (FR-009)
// -------------------------------------------------------------------
export function DailyRevenueChart({
  data,
  productNames,
}: {
  data: DailySalesData[]
  productNames: string[]
}) {
  const t = useTranslations('dashboard')

  if (data.length === 0) return <ChartEmpty label={t('dailyRevenueTitle')} />

  return (
    <div className="bg-secondary rounded-2xl p-6 md:p-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-foreground text-lg md:text-xl font-semibold leading-7">
            {t('dailyRevenueTitle')}
          </h3>
          <p className="text-muted-foreground text-sm font-normal leading-5">
            {t('dailyRevenueSubtitle')}
          </p>
        </div>
        {/* Legend mini */}
        <div className="flex flex-wrap gap-2">
          {productNames.slice(0, 3).map((name, i) => (
            <div
              key={name}
              className="px-3 py-1 bg-card border border-border rounded-xl flex items-center gap-1.5"
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: PRODUCT_COLORS[i] }}
              />
              <span className="text-muted-foreground text-[10px] font-semibold leading-4 truncate max-w-[60px]">
                {name.split(' ').slice(0, 2).join(' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="h-56 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: string) => {
                const d = new Date(v)
                return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
              }}
            />
            <YAxis
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value, name) => [
                formatRupiah(Number(value as number)),
                String(name as string),
              ]}
              labelFormatter={(label) => {
                const d = new Date(String(label))
                return d.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
              }}
              contentStyle={tooltipContentStyle}
              cursor={{ fill: 'var(--color-bg-hover)' }}
            />
            {productNames.map((name, index) => (
              <Bar
                key={name}
                dataKey={name}
                stackId="revenue"
                fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]}
                radius={index === productNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// -------------------------------------------------------------------
// Empty state untuk chart
// -------------------------------------------------------------------
function ChartEmpty({ label }: { label: string }) {
  const t = useTranslations('dashboard')

  return (
    <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center h-64">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-muted-foreground/60 text-xs mt-1">{t('noDataYet')}</p>
    </div>
  )
}
