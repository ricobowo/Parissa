'use client'

/**
 * @file   MonthlyCharts.tsx
 * @version 1.0.0
 * @description 3 chart untuk laporan bulanan + 4 kartu summary:
 *              1. Bar chart — Penjualan harian dalam 1 bulan
 *              2. Line chart — Trend revenue & profit (dual line)
 *              3. Pie chart — Distribusi produk
 *              + Summary: Total Revenue, Growth %, Best Seller, Avg Daily Txns
 *              Palette grayscale + blue-700 sesuai design system.
 */

import { useTranslations } from 'next-intl'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatRupiah } from '@/lib/formulas'

// -------------------------------------------------------------------
// Tipe data
// -------------------------------------------------------------------

export interface DailySalesRow {
  date: string       // "YYYY-MM-DD"
  totalSales: number // total revenue hari itu
  totalProfit: number
  totalTxns: number
}

export interface ProductDistRow {
  productName: string
  revenue: number
  units: number
}

export interface MonthlySummaryData {
  totalRevenue: number
  growthPercent: number | null
  bestSeller: string | null
  avgDailyTxns: number
}

// Warna produk — grayscale + blue aksen
const PIE_COLORS = [
  '#1d4ed8', // blue-700
  '#6b7280', // gray-500
  '#a1a1aa', // zinc-400
  '#d4d4d8', // zinc-300
  '#94a3b8', // slate-400
  '#e5e7eb', // gray-200
]

// -------------------------------------------------------------------
// Summary Cards (4 metrik di atas chart)
// -------------------------------------------------------------------
export function MonthlySummaryCards({ data }: { data: MonthlySummaryData }) {
  const t = useTranslations('reports')

  const growthArrow =
    data.growthPercent === null
      ? ''
      : data.growthPercent > 0
        ? '\u2191'
        : data.growthPercent < 0
          ? '\u2193'
          : '\u2192'

  const growthColor =
    data.growthPercent === null
      ? 'text-zinc-400'
      : data.growthPercent > 0
        ? 'text-emerald-600'
        : data.growthPercent < 0
          ? 'text-red-600'
          : 'text-zinc-400'

  const cards = [
    {
      label: t('totalRevenueMonth'),
      value: formatRupiah(data.totalRevenue),
      valueColor: 'text-slate-900',
    },
    {
      label: t('growthPercent'),
      value:
        data.growthPercent !== null
          ? `${growthArrow} ${Math.abs(data.growthPercent).toFixed(1)}%`
          : t('noGrowthData'),
      valueColor: growthColor,
    },
    {
      label: t('bestSeller'),
      value: data.bestSeller ?? '-',
      valueColor: 'text-slate-900',
    },
    {
      label: t('avgDailyTxns'),
      value: `${data.avgDailyTxns.toFixed(1)} ${t('txnsPerDay')}`,
      valueColor: 'text-slate-900',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-100 rounded-lg overflow-hidden outline outline-1 outline-offset-[-1px] outline-zinc-400/20">
      {cards.map((card) => (
        <div
          key={card.label}
          className="px-5 pt-5 pb-6 bg-white flex flex-col gap-1 font-['Inter']"
        >
          <p className="text-zinc-600 text-[10px] font-normal uppercase leading-4 tracking-wide">
            {card.label}
          </p>
          <p className={`text-lg font-normal leading-7 ${card.valueColor}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}

// -------------------------------------------------------------------
// 1. Bar Chart — Penjualan Harian
// -------------------------------------------------------------------
export function DailySalesBarChart({ data }: { data: DailySalesRow[] }) {
  const t = useTranslations('reports')

  if (data.length === 0) return <ChartEmpty label={t('dailySalesTitle')} />

  return (
    <div className="bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-zinc-400/20 p-6 md:p-8 font-['Inter']">
      <div className="mb-6">
        <p className="text-zinc-600 text-[10px] font-bold uppercase leading-4 tracking-wide">
          {t('monthlySummary')}
        </p>
        <h3 className="text-slate-900 text-lg md:text-xl font-bold leading-7 mt-0.5">
          {t('dailySalesTitle')}
        </h3>
        <p className="text-zinc-500 text-xs leading-4 mt-0.5">
          {t('dailySalesSubtitle')}
        </p>
      </div>

      <div className="h-56 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: string) => {
                const d = new Date(v)
                return d.getDate().toString()
              }}
            />
            <YAxis
              tickFormatter={(v: number) =>
                v >= 1000000
                  ? `${(v / 1000000).toFixed(1)}jt`
                  : `${(v / 1000).toFixed(0)}k`
              }
              tick={{ fontSize: 10, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => formatRupiah(Number(value as number))}
              labelFormatter={(label) => {
                const d = new Date(String(label))
                return d.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
              }}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e4e4e7',
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="totalSales"
              name={t('revenueLabel')}
              fill="#1d4ed8"
              fillOpacity={0.8}
              radius={[4, 4, 0, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// -------------------------------------------------------------------
// 2. Line Chart — Trend Revenue & Profit
// -------------------------------------------------------------------
export function RevenueProfitTrendChart({ data }: { data: DailySalesRow[] }) {
  const t = useTranslations('reports')

  if (data.length === 0) return <ChartEmpty label={t('revenueProfitTrend')} />

  return (
    <div className="bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-zinc-400/20 p-6 md:p-8 font-['Inter']">
      <div className="mb-6">
        <h3 className="text-slate-900 text-lg md:text-xl font-bold leading-7">
          {t('revenueProfitTrend')}
        </h3>
        <p className="text-zinc-500 text-xs leading-4 mt-0.5">
          {t('revenueProfitSubtitle')}
        </p>
      </div>

      <div className="h-56 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: string) => {
                const d = new Date(v)
                return d.getDate().toString()
              }}
            />
            <YAxis
              tickFormatter={(v: number) =>
                v >= 1000000
                  ? `${(v / 1000000).toFixed(1)}jt`
                  : `${(v / 1000).toFixed(0)}k`
              }
              tick={{ fontSize: 10, fill: '#a1a1aa' }}
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
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e4e4e7',
                fontSize: 12,
              }}
            />
            <Legend
              iconType="line"
              wrapperStyle={{ fontSize: 11, color: '#71717a' }}
            />
            <Line
              type="monotone"
              dataKey="totalSales"
              name={t('revenueLabel')}
              stroke="#1d4ed8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="totalProfit"
              name={t('profitLabel')}
              stroke="#a1a1aa"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// -------------------------------------------------------------------
// 3. Pie Chart — Distribusi Produk
// -------------------------------------------------------------------
export function ProductDistributionChart({ data }: { data: ProductDistRow[] }) {
  const t = useTranslations('reports')

  if (data.length === 0) return <ChartEmpty label={t('productDistribution')} />

  const total = data.reduce((sum, d) => sum + d.revenue, 0)

  return (
    <div className="bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-zinc-400/20 p-6 md:p-8 font-['Inter']">
      <div className="mb-4">
        <h3 className="text-slate-900 text-lg md:text-xl font-bold leading-7">
          {t('productDistribution')}
        </h3>
        <p className="text-zinc-500 text-xs leading-4 mt-0.5">
          {t('productDistSubtitle')}
        </p>
      </div>

      <div className="h-52 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="revenue"
              nameKey="productName"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                formatRupiah(Number(value as number)),
                String(name as string),
              ]}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e4e4e7',
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2.5 pt-4 border-t border-zinc-100 mt-2">
        {data.map((item, index) => (
          <div key={item.productName} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <span className="text-gray-800 text-xs font-medium leading-4">
                {item.productName}
              </span>
            </div>
            <span className="text-slate-900 text-xs font-bold leading-4">
              {total > 0 ? Math.round((item.revenue / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// -------------------------------------------------------------------
// Empty state chart
// -------------------------------------------------------------------
function ChartEmpty({ label }: { label: string }) {
  const t = useTranslations('reports')

  return (
    <div className="bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-zinc-400/20 p-8 flex flex-col items-center justify-center h-64 font-['Inter']">
      <p className="text-zinc-400 text-sm">{label}</p>
      <p className="text-zinc-300 text-xs mt-1">{t('noData')}</p>
    </div>
  )
}
