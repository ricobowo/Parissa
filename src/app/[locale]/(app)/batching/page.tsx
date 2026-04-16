'use client'

// ============================================================
// File: src/app/[locale]/(app)/batching/page.tsx
// Versi: v0.12.0
// Deskripsi: Halaman Produksi & Batching — form create, tabs
//            (List & Calendar), filter status + search.
//            Stok bahan otomatis dipotong via trigger DB
//            (trg_deduct_stock_on_batch, guard P0001 saat kurang).
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import type { Product, BatchStatus, BatchWithExpiry } from '@/types'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { useToast } from '@/lib/hooks/use-toast'
import { BatchForm, type BatchFormData } from '@/components/batching/BatchForm'
import { BatchList } from '@/components/batching/BatchList'
import { ExpiryCalendar } from '@/components/batching/ExpiryCalendar'

type Tab = 'list' | 'calendar'

export default function BatchingPage() {
  const t = useTranslations('batching')
  const [products, setProducts] = useState<Product[]>([])
  const [batches, setBatches] = useState<BatchWithExpiry[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('list')
  const [filterStatus, setFilterStatus] = useState<BatchStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const { toast: addToast } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const [prodRes, batchRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true).order('name'),
        supabase
          .from('batches_with_expiry')
          .select('*')
          .order('expiration_date', { ascending: true })
          .limit(300),
      ])

      if (prodRes.error) throw prodRes.error
      if (batchRes.error) throw batchRes.error

      setProducts((prodRes.data ?? []) as Product[])
      setBatches((batchRes.data ?? []) as BatchWithExpiry[])
    } catch (err) {
      console.error('Gagal memuat data batching:', err)
      addToast({ title: t('loadFailed'), variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [addToast, t])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter client-side — data batch tidak besar (<300)
  const filtered = useMemo(() => {
    return batches.filter((b) => {
      if (filterStatus !== 'all' && b.status !== filterStatus) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !b.batch_number.toLowerCase().includes(q) &&
          !(b.product_name ?? '').toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [batches, filterStatus, search])

  async function handleSave(data: BatchFormData) {
    const supabase = createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    // batch_number sengaja kosong — trigger trg_generate_batch_number
    // akan auto-isi format PREFIX-YYYYMMDD-NN.
    const { error } = await supabase.from('batches').insert({
      product_id: data.product_id,
      batch_number: '',
      batch_date: data.batch_date,
      batch_quantity: data.batch_quantity,
      expiration_date: data.expiration_date,
      status: 'Planned',
      notes: data.notes || null,
      created_by: authUser?.id ?? null,
    })

    if (error) throw new Error(error.message || t('saveFailed'))

    addToast({ title: t('addSuccess'), variant: 'success' })
    setFormOpen(false)
    await fetchData()
  }

  async function handleChangeStatus(batch: BatchWithExpiry, next: BatchStatus) {
    const supabase = createClient()
    const { error } = await supabase
      .from('batches')
      .update({ status: next })
      .eq('id', batch.id)

    if (error) {
      addToast({ title: error.message || t('statusUpdateFailed'), variant: 'error' })
      return
    }
    addToast({ title: t('statusUpdated'), variant: 'success' })
    await fetchData()
  }

  if (loading) return <PageSkeleton />

  return (
    <main className="flex-1 p-4 md:p-8 max-w-[1040px] mx-auto w-full">
      {/* Header halaman */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-wide mb-1"
            style={{ color: 'var(--color-accent)' }}
          >
            {t('eyebrow')}
          </p>
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--color-text)' }}>
            {t('title')}
          </h1>
        </div>
        {!formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className="px-4 py-2.5 rounded-md text-sm font-semibold text-white"
            style={{ background: 'var(--color-accent)' }}
          >
            + {t('addBatch')}
          </button>
        )}
      </div>

      {/* Form inline */}
      {formOpen && (
        <div
          className="rounded-lg border p-5 mb-6"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
        >
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            {t('addBatch')}
          </h2>
          <BatchForm
            products={products}
            onSubmit={handleSave}
            onCancel={() => setFormOpen(false)}
          />
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex gap-1 mb-4 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <TabBtn active={tab === 'list'} onClick={() => setTab('list')}>
          {t('tabs.list')}
        </TabBtn>
        <TabBtn active={tab === 'calendar'} onClick={() => setTab('calendar')}>
          {t('tabs.calendar')}
        </TabBtn>
      </div>

      {tab === 'list' ? (
        <>
          {/* Toolbar filter — hanya di tab list */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search')}
              className="flex-1 px-3 py-2 rounded-md border text-sm"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as BatchStatus | 'all')}
              className="px-3 py-2 rounded-md border text-sm"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <option value="all">{t('filterAll')}</option>
              <option value="Planned">{t('statuses.Planned')}</option>
              <option value="In Progress">{t('statuses.In Progress')}</option>
              <option value="Completed">{t('statuses.Completed')}</option>
              <option value="Expired">{t('statuses.Expired')}</option>
            </select>
          </div>

          <BatchList batches={filtered} onChangeStatus={handleChangeStatus} />
        </>
      ) : (
        <ExpiryCalendar batches={batches} />
      )}
    </main>
  )
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 text-sm font-medium border-b-2 -mb-px"
      style={{
        borderColor: active ? 'var(--color-accent)' : 'transparent',
        color: active ? 'var(--color-text)' : 'var(--color-text-secondary)',
      }}
    >
      {children}
    </button>
  )
}
