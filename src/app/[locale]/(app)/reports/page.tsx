'use client'

/**
 * @file   reports/page.tsx
 * @version 1.0.0
 * @description Halaman Laporan Parissa POS — 2 tab:
 *              1. Laporan Profit: summary cards, tabel margin per produk
 *              2. Laporan Bulanan: 4 summary metrics, bar harian, line trend, pie distribusi
 *              Data dari Supabase (sales + profit_calculations), aggregate client-side.
 *              Filter: periode (bulan), produk, status bayar.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Product, Sale, ProfitCalculation } from '@/types'
import { calcGrowthPercent, formatRupiah, formatMargin } from '@/lib/formulas'
import { downloadExcel, buildExportFilename, formatRupiahExcel } from '@/lib/export'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { useToast } from '@/lib/hooks/use-toast'
import { ReportFilters, ReportFilterValues } from '@/components/reports/ReportFilters'
import { ProfitSummaryCards, ProfitSummaryData } from '@/components/reports/ProfitSummaryCards'
import { ProfitMarginTable, ProductProfitRow } from '@/components/reports/ProfitMarginTable'
import {
  MonthlySummaryCards,
  DailySalesBarChart,
  RevenueProfitTrendChart,
  ProductDistributionChart,
  DailySalesRow,
  ProductDistRow,
  MonthlySummaryData,
} from '@/components/reports/MonthlyCharts'

// Tipe sale dengan join profit_calculations dan product
interface SaleWithDetails extends Sale {
  product: Product
  profit_calculations: ProfitCalculation[]
}

// Tab aktif
type ReportTab = 'profit' | 'monthly'

export default function ReportsPage() {
  const t = useTranslations('reports')
  const { toast: addToast } = useToast()

  // --- State ---
  const [activeTab, setActiveTab] = useState<ReportTab>('profit')
  const [loading, setLoading] = useState(true)
  const [sales, setSales] = useState<SaleWithDetails[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Filter default: bulan ini
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [filters, setFilters] = useState<ReportFilterValues>({
    month: currentMonth,
    productId: 'all',
    paymentStatus: 'all',
  })

  // --- Data bulan sebelumnya (untuk growth comparison) ---
  const [prevMonthSales, setPrevMonthSales] = useState<SaleWithDetails[]>([])

  // Hitung range tanggal dari filter bulan
  const getDateRange = useCallback((monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number)
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0) // hari terakhir bulan
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    }
  }, [])

  // Fetch data dari Supabase
  const fetchReportData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { start, end } = getDateRange(filters.month)

      // Hitung bulan sebelumnya untuk growth comparison
      const [year, month] = filters.month.split('-').map(Number)
      const prevMonth = month === 1
        ? `${year - 1}-12`
        : `${year}-${String(month - 1).padStart(2, '0')}`
      const prevRange = getDateRange(prevMonth)

      // Fetch paralel: sales bulan ini, sales bulan lalu, products
      const [salesRes, prevSalesRes, prodRes] = await Promise.all([
        supabase
          .from('sales')
          .select('*, product:products (*), profit_calculations (*)')
          .gte('date', start)
          .lte('date', end)
          .order('date', { ascending: true }),
        supabase
          .from('sales')
          .select('*, product:products (*), profit_calculations (*)')
          .gte('date', prevRange.start)
          .lte('date', prevRange.end),
        supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('name'),
      ])

      if (salesRes.data) {
        // Transform data — profit_calculations adalah array dari join, ambil elemen pertama
        const typedSales = (salesRes.data as unknown as SaleWithDetails[]).map((s) => ({
          ...s,
          product: s.product as Product,
          profit_calculations: Array.isArray(s.profit_calculations)
            ? s.profit_calculations
            : [],
        }))
        setSales(typedSales)
      }

      if (prevSalesRes.data) {
        const typedPrev = (prevSalesRes.data as unknown as SaleWithDetails[]).map((s) => ({
          ...s,
          product: s.product as Product,
          profit_calculations: Array.isArray(s.profit_calculations)
            ? s.profit_calculations
            : [],
        }))
        setPrevMonthSales(typedPrev)
      }

      if (prodRes.data) {
        setProducts(prodRes.data)
      }
    } catch (err) {
      console.error('Gagal memuat laporan:', err)
      addToast({ title: t('loadFailed'), variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [filters.month, getDateRange, addToast, t])

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  // --- Filter sales berdasarkan produk & status bayar ---
  const filteredSales = useMemo(() => {
    let result = sales
    if (filters.productId !== 'all') {
      result = result.filter((s) => s.product_id === filters.productId)
    }
    if (filters.paymentStatus !== 'all') {
      result = result.filter((s) => s.payment_status === filters.paymentStatus)
    }
    return result
  }, [sales, filters.productId, filters.paymentStatus])

  // --- PROFIT TAB: Hitung summary ---
  const profitSummary: ProfitSummaryData = useMemo(() => {
    // Bulan ini
    const revenue = filteredSales
      .filter((s) => s.payment_status === 'Sudah')
      .reduce((sum, s) => sum + s.sale_price, 0)
    const cost = filteredSales.reduce((sum, s) => {
      const pc = s.profit_calculations[0]
      return sum + (pc?.total_cost ?? 0)
    }, 0)
    const profit = revenue - cost

    // Bulan lalu (unfiltered — perbandingan global)
    const prevRevenue = prevMonthSales
      .filter((s) => s.payment_status === 'Sudah')
      .reduce((sum, s) => sum + s.sale_price, 0)
    const prevCost = prevMonthSales.reduce((sum, s) => {
      const pc = s.profit_calculations[0]
      return sum + (pc?.total_cost ?? 0)
    }, 0)
    const prevProfit = prevRevenue - prevCost

    const hasPrevData = prevMonthSales.length > 0

    return {
      totalRevenue: revenue,
      totalCost: cost,
      totalProfit: profit,
      revenueGrowth: hasPrevData
        ? calcGrowthPercent({ current: revenue, previous: prevRevenue })
        : null,
      costGrowth: hasPrevData
        ? calcGrowthPercent({ current: cost, previous: prevCost })
        : null,
      profitGrowth: hasPrevData
        ? calcGrowthPercent({ current: profit, previous: prevProfit })
        : null,
    }
  }, [filteredSales, prevMonthSales])

  // --- PROFIT TAB: Tabel margin per produk ---
  const profitByProduct: ProductProfitRow[] = useMemo(() => {
    const map: Record<string, {
      productName: string
      revenue: number
      cost: number
      units: number
    }> = {}

    for (const s of filteredSales) {
      const pName = s.product?.name ?? 'Unknown'
      if (!map[pName]) {
        map[pName] = { productName: pName, revenue: 0, cost: 0, units: 0 }
      }

      // Revenue hanya dari transaksi "Sudah"
      if (s.payment_status === 'Sudah') {
        map[pName].revenue += s.sale_price
      }
      map[pName].cost += s.profit_calculations[0]?.total_cost ?? 0
      map[pName].units += s.amount
    }

    return Object.values(map)
      .map((row) => ({
        productName: row.productName,
        totalRevenue: row.revenue,
        totalCost: row.cost,
        totalProfit: row.revenue - row.cost,
        marginPercent: row.cost > 0
          ? ((row.revenue - row.cost) / row.cost) * 100
          : 0,
        unitsSold: row.units,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
  }, [filteredSales])

  // --- MONTHLY TAB: Data harian ---
  const dailyData: DailySalesRow[] = useMemo(() => {
    const map: Record<string, { sales: number; profit: number; txns: number }> = {}

    for (const s of filteredSales) {
      const date = s.date
      if (!map[date]) map[date] = { sales: 0, profit: 0, txns: 0 }

      if (s.payment_status === 'Sudah') {
        map[date].sales += s.sale_price
      }
      map[date].profit += s.profit_calculations[0]?.total_profit ?? 0
      map[date].txns += 1
    }

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date,
        totalSales: d.sales,
        totalProfit: d.profit,
        totalTxns: d.txns,
      }))
  }, [filteredSales])

  // --- MONTHLY TAB: Distribusi produk ---
  const productDist: ProductDistRow[] = useMemo(() => {
    const map: Record<string, { revenue: number; units: number }> = {}

    for (const s of filteredSales) {
      const pName = s.product?.name ?? 'Unknown'
      if (!map[pName]) map[pName] = { revenue: 0, units: 0 }

      if (s.payment_status === 'Sudah') {
        map[pName].revenue += s.sale_price
      }
      map[pName].units += s.amount
    }

    return Object.entries(map)
      .map(([productName, d]) => ({ productName, ...d }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [filteredSales])

  // --- MONTHLY TAB: Summary metrics ---
  const monthlySummary: MonthlySummaryData = useMemo(() => {
    const totalRevenue = filteredSales
      .filter((s) => s.payment_status === 'Sudah')
      .reduce((sum, s) => sum + s.sale_price, 0)
    const prevRevenue = prevMonthSales
      .filter((s) => s.payment_status === 'Sudah')
      .reduce((sum, s) => sum + s.sale_price, 0)

    const hasPrevData = prevMonthSales.length > 0
    const totalTxns = filteredSales.length

    // Jumlah hari unik yang ada transaksi (untuk avg)
    const uniqueDays = new Set(filteredSales.map((s) => s.date)).size
    const avgDailyTxns = uniqueDays > 0 ? totalTxns / uniqueDays : 0

    // Best seller
    const productMap: Record<string, number> = {}
    for (const s of filteredSales) {
      const pName = s.product?.name ?? 'Unknown'
      productMap[pName] = (productMap[pName] || 0) + s.amount
    }
    const bestSeller =
      Object.entries(productMap).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null

    return {
      totalRevenue,
      growthPercent: hasPrevData
        ? calcGrowthPercent({ current: totalRevenue, previous: prevRevenue })
        : null,
      bestSeller,
      avgDailyTxns,
    }
  }, [filteredSales, prevMonthSales])

  // --- Export handler: profit report ---
  const handleExportProfit = useCallback(() => {
    // Sheet 1: Ringkasan
    const summarySheet = [
      { Metrik: t('totalRevenue'), Nilai: formatRupiahExcel(profitSummary.totalRevenue) },
      { Metrik: t('totalCost'), Nilai: formatRupiahExcel(profitSummary.totalCost) },
      { Metrik: t('totalProfit'), Nilai: formatRupiahExcel(profitSummary.totalProfit) },
    ]

    // Sheet 2: Detail margin per produk
    const detailSheet = profitByProduct.map((row) => ({
      Produk: row.productName,
      Revenue: formatRupiahExcel(row.totalRevenue),
      Cost: formatRupiahExcel(row.totalCost),
      Profit: formatRupiahExcel(row.totalProfit),
      'Margin (%)': `${row.marginPercent.toFixed(1)}%`,
      'Unit Terjual': row.unitsSold,
    }))

    downloadExcel({
      filename: buildExportFilename('Profit', filters.month),
      sheets: [
        { name: 'Ringkasan', data: summarySheet },
        { name: 'Detail per Produk', data: detailSheet },
      ],
      autoWidth: true,
    })
  }, [profitSummary, profitByProduct, filters.month, t])

  // --- Export handler: monthly report ---
  const handleExportMonthly = useCallback(() => {
    // Sheet 1: Ringkasan bulanan
    const summarySheet = [
      { Metrik: t('totalRevenueMonth'), Nilai: formatRupiahExcel(monthlySummary.totalRevenue) },
      { Metrik: t('growthPercent'), Nilai: monthlySummary.growthPercent !== null ? `${monthlySummary.growthPercent.toFixed(1)}%` : '-' },
      { Metrik: t('bestSeller'), Nilai: monthlySummary.bestSeller ?? '-' },
      { Metrik: t('avgDailyTxns'), Nilai: `${monthlySummary.avgDailyTxns.toFixed(1)}` },
    ]

    // Sheet 2: Data harian
    const dailySheet = dailyData.map((row) => ({
      Tanggal: row.date,
      Revenue: formatRupiahExcel(row.totalSales),
      Profit: formatRupiahExcel(row.totalProfit),
      Transaksi: row.totalTxns,
    }))

    // Sheet 3: Distribusi produk
    const prodSheet = productDist.map((row) => ({
      Produk: row.productName,
      Revenue: formatRupiahExcel(row.revenue),
      'Unit Terjual': row.units,
    }))

    downloadExcel({
      filename: buildExportFilename('Bulanan', filters.month),
      sheets: [
        { name: 'Ringkasan', data: summarySheet },
        { name: 'Penjualan Harian', data: dailySheet },
        { name: 'Distribusi Produk', data: prodSheet },
      ],
      autoWidth: true,
    })
  }, [monthlySummary, dailyData, productDist, filters.month, t])

  // --- Render ---
  if (loading) return <PageSkeleton />

  return (
    <main className="flex-1 p-4 md:p-8 max-w-[1040px] mx-auto w-full font-['Inter']">
      {/* ================================================================ */}
      {/* Header */}
      {/* ================================================================ */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-blue-700 text-xs font-semibold uppercase leading-4 tracking-wide">
            {activeTab === 'profit'
              ? t('profitReport').toUpperCase()
              : t('monthlyReport').toUpperCase()}
          </p>
          <h1 className="text-gray-800 text-2xl md:text-3xl font-bold leading-8 mt-0.5">
            {t('title')}
          </h1>
        </div>
        {/* Tombol Export ke Excel */}
        <button
          type="button"
          onClick={activeTab === 'profit' ? handleExportProfit : handleExportMonthly}
          className="px-4 py-2 bg-white rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-400/20 text-gray-800 text-sm font-medium hover:bg-zinc-50 transition-colors flex items-center gap-2"
        >
          <svg className="size-4 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export Excel
        </button>
      </div>

      {/* ================================================================ */}
      {/* Tab Navigation — underline style */}
      {/* ================================================================ */}
      <div className="flex gap-6 border-b border-zinc-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('profit')}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === 'profit'
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          {t('profitReport')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('monthly')}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === 'monthly'
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          {t('monthlyReport')}
        </button>
      </div>

      {/* ================================================================ */}
      {/* Filters */}
      {/* ================================================================ */}
      <ReportFilters
        filters={filters}
        onFilterChange={setFilters}
        products={products}
        hidePaymentStatus={activeTab === 'monthly'}
      />

      {/* ================================================================ */}
      {/* Tab Content: Profit Report */}
      {/* ================================================================ */}
      {activeTab === 'profit' && (
        <div className="flex flex-col gap-6">
          {/* 12.1 — Summary cards dengan growth indicator */}
          <ProfitSummaryCards data={profitSummary} />

          {/* 12.2 — Tabel margin per produk */}
          <ProfitMarginTable data={profitByProduct} />
        </div>
      )}

      {/* ================================================================ */}
      {/* Tab Content: Monthly Report */}
      {/* ================================================================ */}
      {activeTab === 'monthly' && (
        <div className="flex flex-col gap-6">
          {/* 12.5 — Summary metrics */}
          <MonthlySummaryCards data={monthlySummary} />

          {/* 12.3 — Bar chart penjualan harian */}
          <DailySalesBarChart data={dailyData} />

          {/* 12.3 — Line chart trend revenue & profit + Pie distribusi */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <RevenueProfitTrendChart data={dailyData} />
            </div>
            <div className="lg:col-span-2">
              <ProductDistributionChart data={productDist} />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
