'use client'

// ============================================================
// File: src/components/dashboard/SalesCharts.tsx
// Versi: v0.8.0
// Deskripsi: 3 chart dashboard menggunakan Recharts:
//            1. Bar chart — Distribusi penjualan per produk (FR-007)
//            2. Donut chart — Bundling vs Non-Bundling (FR-008)
//            3. Stacked bar — Revenue harian per produk (FR-009)
//            Palette grayscale + blue-700 sesuai PRD & HTML ref.
// ============================================================

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
  Legend,
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
  [productName: string]: string | number // dynamic product keys
}

// Warna produk — grayscale default, blue untuk aksen utama
const PRODUCT_COLORS = [
  '#1d4ed8', // blue-700
  '#6b7280', // gray-500
  '#a1a1aa', // zinc-400
  '#d4d4d8', // zinc-300
  '#94a3b8', // slate-400
  '#e5e7eb', // gray-200
]

// Warna donut: bundling vs non-bundling
const DONUT_COLORS = ['#1d4ed8', '#e2e8f0'] // blue-700, slate-200

// -------------------------------------------------------------------
// 1. Bar Chart — Distribusi Penjualan per Produk (FR-007)
// -------------------------------------------------------------------
export function SalesDistributionChart({
  data,
}: {
  data: ProductSalesData[]
}) {
  if (data.length === 0) return <ChartEmpty label="Sales per Product" />

  return (
    <div className="bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-zinc-400/20 p-6 md:p-8 font-['Inter']">
      {/* Header */}
      <div className="mb-6">
        <p className="text-zinc-600 text-[10px] font-bold uppercase leading-4 tracking-wide">
          PRODUCT PERFORMANCE
        </p>
        <h3 className="text-slate-900 text-lg md:text-xl font-bold leading-7 mt-0.5">
          Penjualan per Produk
        </h3>
      </div>

      {/* Chart area */}
      <div className="h-56 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 10, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="productName"
              tick={{ fontSize: 10, fill: '#71717a', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip
              formatter={(value) => formatRupiah(Number(value))}
              labelStyle={{ fontWeight: 700, color: '#1f2937' }}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e4e4e7',
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="totalRevenue"
              name="Revenue"
              fill="#1d4ed8"
              fillOpacity={0.8}
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
  if (data.length === 0) return <ChartEmpty label="Bundling Ratio" />

  const total = data.reduce((sum, d) => sum + d.value, 0)
  const bundlingPct = total > 0
    ? Math.round((data.find((d) => d.name === 'Bundling')?.value ?? 0) / total * 100)
    : 0

  return (
    <div className="bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-zinc-400/20 p-6 md:p-8 font-['Inter']">
      {/* Header */}
      <div className="mb-4">
        <p className="text-slate-900 text-sm font-normal uppercase leading-5 tracking-wider">
          PURCHASE RATIO
        </p>
        <p className="text-zinc-600 text-xs font-normal leading-4">
          Bundling vs Non-Bundling
        </p>
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
                `${Number(value)} transaksi`,
                String(name),
              ]}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e4e4e7',
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Label tengah donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-slate-900 text-2xl font-black leading-8">
            {bundlingPct}%
          </span>
          <span className="text-slate-400 text-[10px] font-bold uppercase">
            BUNDLING
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3 pt-4 border-t border-zinc-100 mt-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: DONUT_COLORS[index] }}
              />
              <span className="text-gray-800 text-xs font-medium leading-4">
                {item.name}
              </span>
            </div>
            <span className="text-slate-900 text-xs font-bold leading-4">
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
  if (data.length === 0) return <ChartEmpty label="Daily Revenue" />

  return (
    <div className="bg-zinc-100 rounded-2xl p-6 md:p-8 font-['Inter'] overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-slate-900 text-lg md:text-xl font-bold leading-7">
            Revenue Harian
          </h3>
          <p className="text-zinc-600 text-sm font-normal leading-5">
            Revenue harian per produk
          </p>
        </div>
        {/* Legend mini */}
        <div className="flex flex-wrap gap-2">
          {productNames.slice(0, 3).map((name, i) => (
            <div
              key={name}
              className="px-3 py-1 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex items-center gap-1.5"
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: PRODUCT_COLORS[i] }}
              />
              <span className="text-slate-600 text-[10px] font-bold leading-4 truncate max-w-[60px]">
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => {
                const d = new Date(v)
                return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
              }}
            />
            <YAxis
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value, name) => [
                formatRupiah(Number(value)),
                String(name),
              ]}
              labelFormatter={(label) => {
                const d = new Date(label)
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
  return (
    <div className="bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-zinc-400/20 p-8 flex flex-col items-center justify-center h-64 font-['Inter']">
      <p className="text-zinc-400 text-sm">{label}</p>
      <p className="text-zinc-300 text-xs mt-1">Belum ada data</p>
    </div>
  )
}
