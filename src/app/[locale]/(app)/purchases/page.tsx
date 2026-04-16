'use client'

// ============================================================
// File: src/app/[locale]/(app)/purchases/page.tsx
// Versi: v0.11.0
// Deskripsi: Halaman Pembelian / Restock — form input pembelian baru +
//            riwayat pembelian dengan filter (bahan, supplier, rentang tanggal).
//            Stok otomatis bertambah via trigger DB (trg_update_stock_on_purchase).
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import type { Ingredient } from '@/types'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { useToast } from '@/lib/hooks/use-toast'
import { PurchaseForm, type PurchaseFormData } from '@/components/purchases/PurchaseForm'
import {
  PurchaseHistoryTable,
  type PurchaseRow,
} from '@/components/purchases/PurchaseHistoryTable'

export default function PurchasesPage() {
  const t = useTranslations('purchases')
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [purchases, setPurchases] = useState<PurchaseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const { toast: addToast } = useToast()

  // Filter state
  const [filterIngredient, setFilterIngredient] = useState<string>('all')
  const [filterSupplier, setFilterSupplier] = useState<string>('')
  const [filterFrom, setFilterFrom] = useState<string>('')
  const [filterTo, setFilterTo] = useState<string>('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Ambil bahan (untuk dropdown) dan riwayat purchase paralel
      const [ingRes, purRes] = await Promise.all([
        supabase.from('ingredients').select('*').order('name'),
        supabase
          .from('purchases')
          .select('*, ingredient:ingredients(*)')
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(200),
      ])

      if (ingRes.error) throw ingRes.error
      if (purRes.error) throw purRes.error

      setIngredients((ingRes.data ?? []) as Ingredient[])
      setPurchases((purRes.data ?? []) as PurchaseRow[])
    } catch (err) {
      console.error('Gagal memuat data purchase:', err)
      addToast({ title: t('loadFailed'), variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [addToast, t])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter riwayat sesuai kriteria user — client-side karena volume transaksi kecil
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      if (filterIngredient !== 'all' && p.ingredient_id !== filterIngredient) return false
      if (
        filterSupplier &&
        !(p.supplier ?? '').toLowerCase().includes(filterSupplier.toLowerCase())
      )
        return false
      if (filterFrom && p.date < filterFrom) return false
      if (filterTo && p.date > filterTo) return false
      return true
    })
  }, [purchases, filterIngredient, filterSupplier, filterFrom, filterTo])

  // Simpan pembelian baru — trigger DB auto-update stok
  async function handleSave(data: PurchaseFormData) {
    const supabase = createClient()

    // created_by diambil dari session — RLS akan block jika tidak punya permission 'purchases'
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('purchases').insert({
      ingredient_id: data.ingredient_id,
      qty_purchased: data.qty_purchased,
      price_paid: data.price_paid,
      supplier: data.supplier || null,
      date: data.date,
      notes: data.notes || null,
      created_by: authUser?.id ?? null,
    })

    if (error) throw new Error(error.message || t('saveFailed'))

    addToast({ title: t('addSuccess'), variant: 'success' })
    setFormOpen(false)
    await fetchData()
  }

  function resetFilters() {
    setFilterIngredient('all')
    setFilterSupplier('')
    setFilterFrom('')
    setFilterTo('')
  }

  if (loading) return <PageSkeleton />

  return (
    <main className="flex-1 p-4 md:p-8 max-w-[1040px] mx-auto w-full">
      {/* Header */}
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
            + {t('addPurchase')}
          </button>
        )}
      </div>

      {/* Form input — inline panel (bukan modal) agar lebih nyaman di desktop */}
      {formOpen && (
        <div
          className="rounded-lg border p-5 mb-6"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
        >
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            {t('addPurchase')}
          </h2>
          <PurchaseForm
            ingredients={ingredients}
            onSubmit={handleSave}
            onCancel={() => setFormOpen(false)}
          />
        </div>
      )}

      {/* Filter toolbar */}
      <div
        className="rounded-lg border p-4 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}
      >
        <FilterField label={t('filterIngredient')}>
          <select
            value={filterIngredient}
            onChange={(e) => setFilterIngredient(e.target.value)}
            className="w-full px-3 py-2 rounded-md border text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
          >
            <option value="all">{t('allIngredients')}</option>
            {ingredients.map((ing) => (
              <option key={ing.id} value={ing.id}>
                {ing.name}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label={t('filterSupplier')}>
          <input
            type="search"
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            placeholder={t('supplierPlaceholder')}
            className="w-full px-3 py-2 rounded-md border text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
          />
        </FilterField>

        <FilterField label={t('filterFrom')}>
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className="w-full px-3 py-2 rounded-md border text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
          />
        </FilterField>

        <FilterField label={t('filterTo')}>
          <div className="flex gap-2">
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md border text-sm"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
            />
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-2 rounded-md border text-xs"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              title={t('resetFilter')}
            >
              ↻
            </button>
          </div>
        </FilterField>
      </div>

      {/* Ringkasan jumlah transaksi setelah filter */}
      <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
        {t('showing', { count: filteredPurchases.length, total: purchases.length })}
      </p>

      <PurchaseHistoryTable purchases={filteredPurchases} />
    </main>
  )
}

function FilterField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        className="block text-[10px] uppercase tracking-wide mb-1 font-medium"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}
