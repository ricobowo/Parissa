'use client'

// ============================================================
// File: src/app/[locale]/(app)/history/page.tsx
// Versi: v0.14.0
// Deskripsi: Task 19.5 — Riwayat transaksi dengan search dan filter lengkap.
//            Filter: teks (nama/produk/catatan), status bayar, tipe
//            (direct/pre-order), periode tanggal, termasuk void.
// ============================================================

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import type { Sale, Product } from '@/types'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { useToast } from '@/lib/hooks/use-toast'
import { formatRupiah, formatDate } from '@/lib/utils'

interface SaleRow extends Omit<Sale, 'product'> {
  product: Pick<Product, 'id' | 'name'> | null
}

type PaymentFilter = 'all' | 'Sudah' | 'Belum' | 'Void'
type TypeFilter = 'all' | 'Direct' | 'Pre-order'

export default function HistoryPage() {
  const t = useTranslations('history')
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<SaleRow[]>([])
  const [search, setSearch] = useState('')
  const [payment, setPayment] = useState<PaymentFilter>('all')
  const [saleType, setSaleType] = useState<TypeFilter>('all')

  // Default range: 30 hari terakhir
  const today = new Date().toISOString().slice(0, 10)
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10)
  const [from, setFrom] = useState(monthAgo)
  const [to, setTo] = useState(today)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*, product:products(id, name)')
        .gte('date', from)
        .lte('date', to)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      setRows(
        (data ?? []).map((r) => ({
          ...r,
          product: r.product as unknown as SaleRow['product'],
        })) as SaleRow[]
      )
    } catch (err) {
      console.error('Gagal memuat riwayat:', err)
      toast({ title: t('loadFailed'), variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [from, to, toast, t])

  useEffect(() => { fetchData() }, [fetchData])

  // Filter client-side untuk search, payment, type (sudah di-scope tanggal di SQL)
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      // Payment status
      if (payment === 'Void' && !r.is_void) return false
      if (payment !== 'all' && payment !== 'Void') {
        if (r.is_void) return false
        if (r.payment_status !== payment) return false
      }
      // Type
      if (saleType !== 'all' && r.sale_type !== saleType) return false
      // Search
      if (search) {
        const q = search.toLowerCase()
        const hay = [
          r.customer_name,
          r.product?.name ?? '',
          r.notes ?? '',
          r.menu_detail ?? '',
        ].join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [rows, payment, saleType, search])

  const totals = useMemo(() => ({
    count: filtered.length,
    value: filtered
      .filter((r) => !r.is_void)
      .reduce((sum, r) => sum + r.sale_price, 0),
  }), [filtered])

  if (loading) return <PageSkeleton />

  return (
    <main className="flex-1 p-4 md:p-8 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-wide mb-1"
          style={{ color: 'var(--color-accent)' }}>
          {t('eyebrow')}
        </p>
        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--color-text)' }}>
          {t('title')}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {t('subtitle')}
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Chip label={t('totalResults')} value={String(totals.count)} />
        <Chip label={t('totalAmount')} value={formatRupiah(totals.value)} />
      </div>

      {/* Toolbar filter */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="md:col-span-2 px-3 py-2 rounded-md border text-sm"
          style={{
            background: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
        <select
          value={payment}
          onChange={(e) => setPayment(e.target.value as PaymentFilter)}
          className="px-3 py-2 rounded-md border text-sm"
          style={{
            background: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        >
          <option value="all">{t('filterAll')}</option>
          <option value="Sudah">{t('filterPaid')}</option>
          <option value="Belum">{t('filterUnpaid')}</option>
          <option value="Void">{t('filterVoid')}</option>
        </select>
        <select
          value={saleType}
          onChange={(e) => setSaleType(e.target.value as TypeFilter)}
          className="px-3 py-2 rounded-md border text-sm"
          style={{
            background: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        >
          <option value="all">{t('filterAll')}</option>
          <option value="Direct">{t('filterDirect')}</option>
          <option value="Pre-order">{t('filterPreorder')}</option>
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          aria-label={t('from')}
          className="px-3 py-2 rounded-md border text-sm"
          style={{
            background: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          aria-label={t('to')}
          className="px-3 py-2 rounded-md border text-sm"
          style={{
            background: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
      </div>

      {/* Tabel */}
      {filtered.length === 0 ? (
        <div className="border rounded-md p-12 text-center text-sm"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)' }}>
          {t('noResults')}
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto"
          style={{ borderColor: 'var(--color-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}>
                <Th>{t('columnDate')}</Th>
                <Th>{t('columnCustomer')}</Th>
                <Th>{t('columnProduct')}</Th>
                <Th className="text-right">{t('columnQty')}</Th>
                <Th className="text-right">{t('columnPrice')}</Th>
                <Th>{t('columnPayment')}</Th>
                <Th>{t('columnType')}</Th>
                <Th>{t('columnNotes')}</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}
                  className="border-b"
                  style={{
                    borderColor: 'var(--color-border)',
                    opacity: r.is_void ? 0.55 : 1,
                  }}>
                  <Td style={{ color: 'var(--color-text-secondary)' }}>
                    {formatDate(r.date)}
                  </Td>
                  <Td>
                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {r.customer_name}
                    </span>
                  </Td>
                  <Td style={{ color: 'var(--color-text-secondary)' }}>
                    {r.product?.name ?? '—'}
                    {r.is_bundling && (
                      <span className="ml-1 text-[10px] px-1 rounded"
                        style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-tertiary)' }}>
                        BDL
                      </span>
                    )}
                  </Td>
                  <Td className="text-right font-mono text-[13px] tabular-nums">
                    {r.amount}
                  </Td>
                  <Td className="text-right font-mono text-[13px] tabular-nums">
                    {formatRupiah(r.sale_price)}
                  </Td>
                  <Td>
                    {r.is_void ? (
                      <StatusDot label={t('voided')} color="var(--color-danger)" />
                    ) : r.payment_status === 'Sudah' ? (
                      <StatusDot label={r.payment_status} color="var(--color-success)" />
                    ) : (
                      <StatusDot label={r.payment_status} color="var(--color-warning)" />
                    )}
                  </Td>
                  <Td style={{ color: 'var(--color-text-secondary)' }} className="text-xs">
                    {r.sale_type}
                  </Td>
                  <Td style={{ color: 'var(--color-text-tertiary)' }} className="text-xs max-w-[200px] truncate">
                    {r.notes || '—'}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wide ${className}`}>
      {children}
    </th>
  )
}

function Td({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <td className={`px-3 py-2.5 ${className}`} style={style}>
      {children}
    </td>
  )
}

function StatusDot({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px]">
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
    </span>
  )
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="px-4 py-2 rounded-md border flex flex-col gap-0.5"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
    >
      <span className="text-[10px] font-bold uppercase tracking-wide"
        style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
      <span className="text-sm font-bold font-mono tabular-nums"
        style={{ color: 'var(--color-text)' }}>
        {value}
      </span>
    </div>
  )
}
