'use client'

// ============================================================
// File: src/app/[locale]/(app)/page.tsx
// Versi: v0.8.0
// Deskripsi: Halaman Dashboard utama Parissa POS.
//            6 KPI cards (FR-006), filter status bayar + produk (FR-010),
//            bar chart distribusi penjualan (FR-007),
//            donut chart bundling ratio (FR-008),
//            stacked bar revenue harian (FR-009),
//            tabel transaksi paid/unpaid (FR-011).
//            Responsif: scroll vertikal mobile, grid desktop (FR-012).
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Product, Sale } from '@/types'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { useToast } from '@/lib/hooks/use-toast'
import { KpiCards, KpiData } from '@/components/dashboard/KpiCards'
import {
  SalesDistributionChart,
  BundlingRatioChart,
  DailyRevenueChart,
  ProductSalesData,
  BundlingData,
  DailySalesData,
} from '@/components/dashboard/SalesCharts'
import { TransactionLists } from '@/components/dashboard/TransactionLists'
import { ExpiryAlerts } from '@/components/dashboard/ExpiryAlerts'
import { DailyProductionPlanner } from '@/components/dashboard/DailyProductionPlanner'

// Tipe sale yang sudah join ke product
interface SaleWithProduct extends Sale {
  product: Product
}

export default function DashboardPage() {
  const t = useTranslations('dashboard')

  // --- State data ---
  const [kpi, setKpi] = useState<KpiData | null>(null)
  const [salesByProduct, setSalesByProduct] = useState<ProductSalesData[]>([])
  const [bundlingData, setBundlingData] = useState<BundlingData[]>([])
  const [dailySales, setDailySales] = useState<DailySalesData[]>([])
  const [dailyProductNames, setDailyProductNames] = useState<string[]>([])
  const [transactions, setTransactions] = useState<SaleWithProduct[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // --- State filter (FR-010) ---
  const [filterPayment, setFilterPayment] = useState<string>('all')
  const [filterProduct, setFilterProduct] = useState<string>('all')

  const { toast: addToast } = useToast()

  // Fetch semua data dashboard dari Supabase views
  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Fetch paralel: KPI, sales_by_product, bundling_ratio, daily_sales, transactions, products
      const [kpiRes, sbpRes, brRes, dsRes, txnRes, prodRes] = await Promise.all([
        supabase.from('dashboard_kpi').select('*').single(),
        supabase.from('sales_by_product').select('*'),
        supabase.from('bundling_ratio').select('*'),
        supabase.from('daily_sales').select('*').limit(200),
        supabase.from('sales').select('*, product:products (*)').order('date', { ascending: false }).limit(100),
        supabase.from('products').select('*').eq('is_active', true).order('name'),
      ])

      // 1. KPI data
      if (kpiRes.data) {
        const k = kpiRes.data as Record<string, number>
        // Hitung unpaid revenue + count
        const unpaidRevenue = (txnRes.data ?? [])
          .filter((t: Record<string, unknown>) => t.payment_status === 'Belum')
          .reduce((sum: number, t: Record<string, unknown>) => sum + (Number(t.sale_price) || 0), 0)
        const unpaidCount = (txnRes.data ?? [])
          .filter((t: Record<string, unknown>) => t.payment_status === 'Belum').length

        setKpi({
          totalRevenue: Number(k.total_revenue) || 0,
          totalCost: Number(k.total_cost) || 0,
          totalProfit: Number(k.total_profit) || 0,
          totalUnpaid: unpaidRevenue,
          totalUnits: Number(k.total_units) || 0,
          totalTransactions: Number(k.total_transactions) || 0,
          unpaidCount,
        })
      }

      // 2. Sales by product
      if (sbpRes.data) {
        setSalesByProduct(
          (sbpRes.data as Record<string, unknown>[]).map((r) => ({
            productName: String(r.product_name),
            totalRevenue: Number(r.total_revenue) || 0,
            totalUnits: Number(r.total_units) || 0,
          }))
        )
      }

      // 3. Bundling ratio
      if (brRes.data) {
        setBundlingData(
          (brRes.data as Record<string, unknown>[]).map((r) => ({
            name: r.is_bundling ? 'Bundling' : 'Non-Bundling',
            value: Number(r.total_transactions) || 0,
            revenue: Number(r.total_revenue) || 0,
          }))
        )
      }

      // 4. Daily sales — pivot ke format stacked chart
      if (dsRes.data) {
        const rawDaily = dsRes.data as Record<string, unknown>[]
        const dateMap: Record<string, Record<string, number>> = {}
        const productNameSet = new Set<string>()

        for (const row of rawDaily) {
          const date = String(row.date)
          const pName = String(row.product_name)
          const revenue = Number(row.revenue) || 0
          productNameSet.add(pName)

          if (!dateMap[date]) dateMap[date] = { date: 0 } // placeholder
          dateMap[date][pName] = (dateMap[date][pName] || 0) + revenue
        }

        const pNames = Array.from(productNameSet)
        setDailyProductNames(pNames)

        const chartData: DailySalesData[] = Object.keys(dateMap)
          .sort()
          .slice(-14) // Tampilkan 14 hari terakhir
          .map((date) => {
            const entry: DailySalesData = { date }
            for (const pName of pNames) {
              entry[pName] = dateMap[date][pName] || 0
            }
            return entry
          })

        setDailySales(chartData)
      }

      // 5. Transactions (untuk tabel paid/unpaid)
      if (txnRes.data) {
        const typedTxns = (txnRes.data ?? []).map((item: Record<string, unknown>) => ({
          ...item,
          product: item.product as unknown as Product,
        })) as unknown as SaleWithProduct[]

        setTransactions(typedTxns)
      }

      // 6. Products (untuk filter dropdown)
      if (prodRes.data) {
        setProducts(prodRes.data)
      }
    } catch (err) {
      console.error('Gagal memuat dashboard:', err)
      addToast({ title: t('loadFailed'), variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  // Filter transaksi berdasarkan filter aktif (FR-010)
  const filteredTransactions = useMemo(() => {
    let result = transactions
    if (filterPayment !== 'all') {
      result = result.filter((t) => t.payment_status === filterPayment)
    }
    if (filterProduct !== 'all') {
      result = result.filter((t) => t.product_id === filterProduct)
    }
    return result
  }, [transactions, filterPayment, filterProduct])

  // Tampilkan skeleton saat loading
  if (loading) return <PageSkeleton />

  return (
    <main className="flex-1 p-4 md:p-8 max-w-[1040px] mx-auto w-full font-['Inter']">
      {/* ================================================================ */}
      {/* Header Dashboard */}
      {/* ================================================================ */}
      <div className="mb-6">
        <p className="text-blue-700 text-xs font-semibold uppercase leading-4 tracking-wide">
          {t('overview')}
        </p>
        <h1 className="text-gray-800 text-2xl md:text-3xl font-bold leading-8 mt-0.5">
          {t('performanceHub')}
        </h1>
        <p className="text-zinc-600 text-sm font-normal leading-5 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* ================================================================ */}
      {/* Filter Bar (FR-010) */}
      {/* ================================================================ */}
      <div className="p-4 md:p-6 bg-zinc-100 rounded-lg flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filter: Status Bayar */}
          <div className="flex flex-col gap-1">
            <label className="text-zinc-600 text-[10px] font-bold uppercase leading-4 tracking-wide">
              {t('paymentStatusFilter')}
            </label>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="min-w-40 px-4 py-2 bg-white rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-400/20 text-gray-800 text-sm font-normal"
            >
              <option value="all">{t('allStatuses')}</option>
              <option value="Sudah">{t('paidFilter')}</option>
              <option value="Belum">{t('unpaidFilter')}</option>
            </select>
          </div>

          {/* Filter: Produk */}
          <div className="flex flex-col gap-1">
            <label className="text-zinc-600 text-[10px] font-bold uppercase leading-4 tracking-wide">
              {t('productFilter')}
            </label>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
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
        </div>

        {/* Tombol reset filter */}
        {(filterPayment !== 'all' || filterProduct !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setFilterPayment('all')
              setFilterProduct('all')
            }}
            className="px-6 py-2 bg-white rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-400/20 text-gray-800 text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            {t('resetFilter')}
          </button>
        )}
      </div>

      {/* ================================================================ */}
      {/* KPI Cards (FR-006) */}
      {/* ================================================================ */}
      {kpi && <KpiCards data={kpi} />}

      {/* ================================================================ */}
      {/* Expiry Alerts (Task 16.5) — hanya tampil jika ada batch H ≤ 3 */}
      {/* ================================================================ */}
      <div className="mt-6">
        <ExpiryAlerts />
      </div>

      {/* ================================================================ */}
      {/* Daily Production Planner (Task 17.0) — Formula 5.10 PRD */}
      {/* Zero-noise & permission-gated (hanya role dgn izin 'batching')   */}
      {/* ================================================================ */}
      <div className="mt-6">
        <DailyProductionPlanner />
      </div>

      {/* ================================================================ */}
      {/* Charts Section */}
      {/* ================================================================ */}
      <div className="mt-6 flex flex-col gap-6">
        {/* Row 1: Revenue Over Time (full width) */}
        <DailyRevenueChart
          data={dailySales}
          productNames={dailyProductNames}
        />

        {/* Row 2: Sales per Product + Bundling Ratio (side by side desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sales Distribution — 3/5 width */}
          <div className="lg:col-span-3">
            <SalesDistributionChart data={salesByProduct} />
          </div>
          {/* Bundling Ratio — 2/5 width */}
          <div className="lg:col-span-2">
            <BundlingRatioChart data={bundlingData} />
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* Transaction Lists (FR-011) */}
      {/* ================================================================ */}
      <div className="mt-6">
        <TransactionLists transactions={filteredTransactions} />
      </div>
    </main>
  )
}
