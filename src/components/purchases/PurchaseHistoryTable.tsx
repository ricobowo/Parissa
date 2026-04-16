'use client'

// ============================================================
// File: src/components/purchases/PurchaseHistoryTable.tsx
// Versi: v0.11.0
// Deskripsi: Tabel riwayat pembelian bahan baku.
//            Kolom: tanggal, bahan, qty, harga, cost/unit (computed),
//            supplier, catatan.
// ============================================================

import { useTranslations } from 'next-intl'
import type { Purchase, Ingredient } from '@/types'
import { calcPurchaseCostPerUnit, formatRupiah } from '@/lib/formulas'

export interface PurchaseRow extends Purchase {
  ingredient: Ingredient
}

interface Props {
  purchases: PurchaseRow[]
}

export function PurchaseHistoryTable({ purchases }: Props) {
  const t = useTranslations('purchases')

  if (purchases.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 rounded-lg border"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
      >
        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          {t('emptyState')}
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-lg border overflow-x-auto"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr
            className="text-[11px] uppercase tracking-wide"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <th className="text-left font-medium py-3 px-4">{t('date')}</th>
            <th className="text-left font-medium py-3 px-4">{t('ingredient')}</th>
            <th className="text-right font-medium py-3 px-4">{t('qtyPurchased')}</th>
            <th className="text-right font-medium py-3 px-4">{t('pricePaid')}</th>
            <th className="text-right font-medium py-3 px-4">{t('costPerUnit')}</th>
            <th className="text-left font-medium py-3 px-4">{t('supplier')}</th>
            <th className="text-left font-medium py-3 px-4">{t('notes')}</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => {
            // Formula 5.7 dihitung client-side dari data transaksi historis
            const costPerUnit = calcPurchaseCostPerUnit({
              pricePaid: p.price_paid,
              qtyPurchased: p.qty_purchased,
            })

            return (
              <tr
                key={p.id}
                className="border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <td className="py-3 px-4 font-mono text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatDate(p.date)}
                </td>
                <td className="py-3 px-4" style={{ color: 'var(--color-text)' }}>
                  {p.ingredient?.name ?? '—'}
                </td>
                <td className="py-3 px-4 text-right font-mono text-[13px]" style={{ color: 'var(--color-text)' }}>
                  {formatNumber(p.qty_purchased)} {p.ingredient?.purchase_unit ?? ''}
                </td>
                <td className="py-3 px-4 text-right font-mono text-[13px]" style={{ color: 'var(--color-text)' }}>
                  {formatRupiah(p.price_paid)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatRupiah(costPerUnit)}
                </td>
                <td className="py-3 px-4" style={{ color: 'var(--color-text-secondary)' }}>
                  {p.supplier ?? '—'}
                </td>
                <td className="py-3 px-4 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {p.notes ?? '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 }).format(n)
}
