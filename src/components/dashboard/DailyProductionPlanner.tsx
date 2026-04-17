'use client'

// ============================================================
// File: src/components/dashboard/DailyProductionPlanner.tsx
// Versi: v0.13.0
// Deskripsi: Card rekomendasi produksi harian di dashboard
//            (Task 17.0 — Formula 5.10 PRD).
//            Permission gate: hanya user dengan izin 'batching'
//            (Owner & Produksi default). Zero-noise: card tidak
//            dirender jika tidak ada rekomendasi > 0.
//            Data ditarik dari view `daily_production_planner`
//            — satu sumber kebenaran (konsisten dgn ingredients_
//            with_status & batches_with_expiry).
// ============================================================

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ProductionRecommendation } from '@/types'

export function DailyProductionPlanner() {
  const t = useTranslations('planner')
  const params = useParams<{ locale: string }>()
  const locale = params?.locale ?? 'id'

  const [rows, setRows] = useState<ProductionRecommendation[]>([])
  const [hasPermission, setHasPermission] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const supabase = createClient()

      // 1) Cek permission 'batching' dari role user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) {
        if (!cancelled) setLoading(false)
        return
      }

      const { data: userRow } = await supabase
        .from('users')
        .select('role:roles(permissions)')
        .eq('id', authUser.id)
        .single()

      const role = (userRow?.role ?? null) as { permissions?: Record<string, boolean> } | null
      const allowed = role?.permissions?.['batching'] === true
      if (cancelled) return

      setHasPermission(allowed)
      if (!allowed) {
        setLoading(false)
        return
      }

      // 2) Ambil rekomendasi produksi
      const { data, error } = await supabase
        .from('daily_production_planner')
        .select('*')

      if (cancelled) return
      if (error) {
        console.error('Gagal memuat daily_production_planner:', error)
        setRows([])
      } else {
        setRows((data ?? []) as ProductionRecommendation[])
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Gate: tidak ada izin → tidak rendered sama sekali
  if (loading || !hasPermission) return null

  // Zero-noise: hanya tampilkan produk yang butuh produksi
  const actionable = rows.filter((r) => r.recommended_batches > 0)
  if (actionable.length === 0) return null

  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--color-accent)' }}
          >
            {t('title')}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {t('subtitle')}
          </p>
        </div>
        <Link
          href={`/${locale}/batching`}
          className="text-xs underline whitespace-nowrap"
          style={{ color: 'var(--color-accent)' }}
        >
          {t('createBatch')} →
        </Link>
      </div>

      {/* Tabel rekomendasi — responsif, scroll horizontal di mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-[10px] uppercase tracking-wide border-b"
              style={{
                color: 'var(--color-text-secondary)',
                borderColor: 'var(--color-border)',
              }}
            >
              <th className="text-left font-medium py-2 pr-4">{t('product')}</th>
              <th className="text-right font-medium py-2 px-2">{t('avg7d')}</th>
              <th className="text-right font-medium py-2 px-2">{t('preorder')}</th>
              <th className="text-right font-medium py-2 px-2">{t('stock')}</th>
              <th className="text-right font-medium py-2 pl-2">{t('recommended')}</th>
            </tr>
          </thead>
          <tbody>
            {actionable.map((r) => (
              <tr
                key={r.product_id}
                className="border-b last:border-b-0"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <td className="py-2.5 pr-4" style={{ color: 'var(--color-text)' }}>
                  {r.product_name}
                  {r.pcs_per_batch === 0 && (
                    <span
                      className="ml-2 text-[10px] italic"
                      style={{ color: 'var(--color-warning)' }}
                      title={t('noRecipe')}
                    >
                      ({t('noRecipe')})
                    </span>
                  )}
                </td>
                <td
                  className="py-2.5 px-2 text-right font-mono text-xs"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {r.avg_sales_7d.toFixed(1)}
                </td>
                <td
                  className="py-2.5 px-2 text-right font-mono text-xs"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {r.pending_preorders}
                </td>
                <td
                  className="py-2.5 px-2 text-right font-mono text-xs"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {r.current_stock}
                </td>
                <td className="py-2.5 pl-2 text-right">
                  <span
                    className="inline-flex items-baseline gap-1 font-semibold"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    <span className="font-mono text-base">{r.recommended_batches}</span>
                    <span className="text-[10px] uppercase tracking-wide">
                      {r.recommended_batches === 1 ? t('batch') : t('batches')}
                    </span>
                  </span>
                  {r.pcs_per_batch > 0 && (
                    <div
                      className="text-[10px] mt-0.5 font-mono"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      ≈ {r.recommended_batches * r.pcs_per_batch} {t('pcs')}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] mt-3" style={{ color: 'var(--color-text-tertiary)' }}>
        {t('footnote')}
      </p>
    </div>
  )
}
