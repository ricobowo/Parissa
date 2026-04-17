'use client'

// ============================================================
// File: src/app/[locale]/(app)/waste/page.tsx
// Versi: v0.14.0
// Deskripsi: Task 19.1-19.3 — Waste/Spoilage Tracking.
//            List waste_logs dengan ringkasan total cost & qty.
//            Trigger trg_calculate_waste_cost otomatis hitung biaya
//            sesuai Formula 5.9 (quantity × cost_per_unit).
// ============================================================

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { useToast } from '@/lib/hooks/use-toast'
import { WasteTable, type WasteLogWithProduct } from '@/components/waste/WasteTable'
import { WasteForm, type WasteFormData } from '@/components/waste/WasteForm'
import { formatRupiah } from '@/lib/utils'

export default function WastePage() {
  const t = useTranslations('waste')
  const tForm = useTranslations('waste.form')
  const { toast } = useToast()

  const [logs, setLogs] = useState<WasteLogWithProduct[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    try {
      const [logsRes, prodRes] = await Promise.all([
        supabase
          .from('waste_logs')
          .select('*, product:products(id, name)')
          .order('date', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('name'),
      ])
      if (logsRes.error) throw logsRes.error
      if (prodRes.error) throw prodRes.error

      setLogs(
        (logsRes.data ?? []).map((r) => ({
          ...r,
          product: r.product as unknown as WasteLogWithProduct['product'],
        })) as WasteLogWithProduct[]
      )
      setProducts((prodRes.data ?? []) as Product[])
    } catch (err) {
      console.error('Gagal memuat waste:', err)
      toast({ title: t('loadFailed'), variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [toast, t])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleSubmit(data: WasteFormData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // waste_cost 0 → trigger akan hitung otomatis
    const { error } = await supabase.from('waste_logs').insert({
      product_id: data.product_id,
      quantity: data.quantity,
      reason: data.reason,
      date: data.date,
      notes: data.notes,
      waste_cost: 0,
      created_by: user?.id ?? null,
    })
    if (error) throw new Error(error.message || tForm('saveFailed'))
    toast({ title: tForm('saved'), variant: 'success' })
    await fetchData()
  }

  const totals = useMemo(() => ({
    cost: logs.reduce((sum, w) => sum + Number(w.waste_cost), 0),
    qty:  logs.reduce((sum, w) => sum + w.quantity, 0),
    count: logs.length,
  }), [logs])

  if (loading) return <PageSkeleton />

  return (
    <main className="flex-1 p-4 md:p-8 max-w-[1040px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
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
        <button
          onClick={() => setFormOpen(true)}
          className="px-4 py-2 rounded-md text-sm text-white"
          style={{ background: 'var(--color-accent)' }}
        >
          {t('addWaste')}
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Chip label={t('totalWasteCost')} value={formatRupiah(totals.cost)} color="danger" />
        <Chip label={t('totalWasteQty')} value={String(totals.qty)} />
      </div>

      <WasteTable items={logs} />

      <WasteForm
        products={products}
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </main>
  )
}

function Chip({
  label, value, color = 'default',
}: {
  label: string
  value: string
  color?: 'default' | 'danger'
}) {
  const colorMap: Record<string, string> = {
    default: 'var(--color-text)',
    danger:  'var(--color-danger)',
  }
  return (
    <div
      className="px-4 py-2 rounded-md border flex flex-col gap-0.5"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
    >
      <span className="text-[10px] font-bold uppercase tracking-wide"
        style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
      <span className="text-sm font-bold font-mono" style={{ color: colorMap[color] }}>
        {value}
      </span>
    </div>
  )
}
