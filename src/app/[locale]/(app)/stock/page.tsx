'use client'

// ============================================================
// File: src/app/[locale]/(app)/stock/page.tsx
// Versi: v0.10.0
// Deskripsi: Halaman Stok & Bahan Baku — daftar semua bahan dengan
//            status Aman/Menipis/Habis (Formula 5.6), filter status
//            dan search nama. Edit minimum_stock_level hanya untuk
//            user dengan permission 'stock.edit_min_level'.
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import type { IngredientWithStatus, StockStatus } from '@/types'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { useToast } from '@/lib/hooks/use-toast'
import { StockTable } from '@/components/stock/StockTable'
import { MinLevelModal } from '@/components/stock/MinLevelModal'

export default function StockPage() {
  const t = useTranslations('stock')
  const [ingredients, setIngredients] = useState<IngredientWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<StockStatus | 'all'>('all')
  const [canEditMinLevel, setCanEditMinLevel] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedIng, setSelectedIng] = useState<IngredientWithStatus | null>(null)
  const { toast: addToast } = useToast()

  // Ambil daftar bahan + status dari view ingredients_with_status
  // View menjamin status konsisten dengan Formula 5.6 di sisi DB
  const fetchIngredients = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('ingredients_with_status')
        .select('*')
        .order('name')

      if (error) throw error
      setIngredients((data ?? []) as IngredientWithStatus[])
    } catch (err) {
      console.error('Gagal memuat bahan:', err)
      addToast({ title: t('loadFailed'), variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [addToast, t])

  // Cek permission user untuk edit min level — lookup ke tabel users + roles
  const checkPermission = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    if (!authUser) return

    const { data: userRow } = await supabase
      .from('users')
      .select('role:roles(permissions)')
      .eq('id', authUser.id)
      .single()

    const role = (userRow?.role ?? null) as { permissions?: Record<string, boolean> } | null
    const perms = role?.permissions ?? {}
    setCanEditMinLevel(perms['stock.edit_min_level'] === true)
  }, [])

  useEffect(() => {
    fetchIngredients()
    checkPermission()
  }, [fetchIngredients, checkPermission])

  // Filter client-side — jumlah bahan kecil (<100), tidak perlu server-side
  const filtered = useMemo(() => {
    return ingredients.filter((ing) => {
      if (filterStatus !== 'all' && ing.stock_status !== filterStatus) return false
      if (search && !ing.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [ingredients, filterStatus, search])

  // Hitung statistik untuk chip ringkasan
  const stats = useMemo(
    () => ({
      total: ingredients.length,
      safe: ingredients.filter((i) => i.stock_status === 'Aman').length,
      low: ingredients.filter((i) => i.stock_status === 'Menipis').length,
      empty: ingredients.filter((i) => i.stock_status === 'Habis').length,
    }),
    [ingredients]
  )

  function handleEditMinLevel(ing: IngredientWithStatus) {
    setSelectedIng(ing)
    setModalOpen(true)
  }

  // Handler save — dipanggil dari modal. Error DB (RLS/guard) di-throw
  // agar modal bisa menampilkan pesan inline.
  async function handleSaveMinLevel(id: string, newMinLevel: number) {
    const supabase = createClient()
    const { error } = await supabase
      .from('ingredients')
      .update({ minimum_stock_level: newMinLevel })
      .eq('id', id)

    if (error) {
      // Trigger guard_min_stock_level_edit akan raise jika tidak punya izin
      throw new Error(error.message || t('saveFailed'))
    }

    addToast({ title: t('updated'), variant: 'success' })
    await fetchIngredients()
  }

  if (loading) return <PageSkeleton />

  return (
    <main className="flex-1 p-4 md:p-8 max-w-[1040px] mx-auto w-full">
      {/* Header halaman */}
      <div className="mb-6">
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

      {/* Chip statistik — status breakdown */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <StatChip label={t('totalIngredients')} value={stats.total} />
        <StatChip label={t('status.safe')} value={stats.safe} color="success" />
        <StatChip label={t('status.low')} value={stats.low} color="warning" />
        <StatChip label={t('status.empty')} value={stats.empty} color="danger" />
      </div>

      {/* Toolbar filter + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="flex-1 px-3 py-2 rounded-md border text-sm"
          style={{
            background: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as StockStatus | 'all')}
          className="px-3 py-2 rounded-md border text-sm"
          style={{
            background: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        >
          <option value="all">{t('filterAllStatuses')}</option>
          <option value="Aman">{t('status.safe')}</option>
          <option value="Menipis">{t('status.low')}</option>
          <option value="Habis">{t('status.empty')}</option>
        </select>
      </div>

      <StockTable
        ingredients={filtered}
        canEditMinLevel={canEditMinLevel}
        onEditMinLevel={handleEditMinLevel}
      />

      <MinLevelModal
        ingredient={selectedIng}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveMinLevel}
      />
    </main>
  )
}

// -------------------------------------------------------------------
// Chip statistik kecil — warna via CSS variable, tidak hardcoded
// -------------------------------------------------------------------
function StatChip({
  label,
  value,
  color = 'default',
}: {
  label: string
  value: number
  color?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const colorMap: Record<string, string> = {
    default: 'var(--color-text)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
  }

  return (
    <div
      className="px-4 py-2 rounded-md border flex flex-col gap-0.5"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-wide"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </span>
      <span className="text-sm font-bold" style={{ color: colorMap[color] }}>
        {value}
      </span>
    </div>
  )
}
