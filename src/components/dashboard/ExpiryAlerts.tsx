'use client'

// ============================================================
// File: src/components/dashboard/ExpiryAlerts.tsx
// Versi: v0.12.0
// Deskripsi: Card "Akan Kadaluarsa" di dashboard — menampilkan
//            batch dengan expiry_bucket H-3, H-1, atau expired
//            (≤ 3 hari). Tidak tampil sama sekali jika daftar kosong
//            (zero-noise). Fetch mandiri agar tidak menambah coupling
//            ke state dashboard induk.
// ============================================================

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { BatchWithExpiry } from '@/types'

export function ExpiryAlerts() {
  const t = useTranslations('batching')
  const params = useParams<{ locale: string }>()
  const locale = params?.locale ?? 'id'

  const [items, setItems] = useState<BatchWithExpiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const supabase = createClient()
      // Ambil hanya batch aktif yang akan/sudah kadaluarsa ≤ 3 hari
      const { data, error } = await supabase
        .from('batches_with_expiry')
        .select('*')
        .in('expiry_bucket', ['expired', 'h1', 'h3'])
        .in('status', ['Planned', 'In Progress'])
        .order('expiration_date', { ascending: true })
        .limit(10)

      if (cancelled) return
      if (error) {
        setItems([])
      } else {
        setItems((data ?? []) as BatchWithExpiry[])
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Zero-noise: jika tidak ada yang perlu diperhatikan, jangan tampilkan card
  if (loading || items.length === 0) return null

  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--color-warning)' }}
          >
            {t('expiringSoonTitle')}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {t('expiringSoonSubtitle')}
          </p>
        </div>
        <Link
          href={`/${locale}/batching`}
          className="text-xs underline"
          style={{ color: 'var(--color-accent)' }}
        >
          Lihat semua →
        </Link>
      </div>

      <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
        {items.map((b) => {
          const color =
            b.expiry_bucket === 'expired' || b.expiry_bucket === 'h1'
              ? 'var(--color-danger)'
              : 'var(--color-warning)'
          const label =
            b.expiry_bucket === 'expired'
              ? `Lewat ${Math.abs(b.days_until_expiry)} hari`
              : b.days_until_expiry === 0
                ? 'Hari ini'
                : `${b.days_until_expiry} hari lagi`

          return (
            <li
              key={b.id}
              className="py-2.5 flex items-center justify-between"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="min-w-0">
                <p
                  className="text-sm truncate font-medium"
                  style={{ color: 'var(--color-text)' }}
                >
                  {b.product_name ?? '—'}
                </p>
                <p
                  className="text-[11px] font-mono"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {b.batch_number} • {b.batch_quantity} pcs
                </p>
              </div>
              <span className="text-xs font-semibold whitespace-nowrap ml-3" style={{ color }}>
                {label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
