'use client'

// ============================================================
// File: src/components/stock/StockTable.tsx
// Versi: v0.10.0
// Deskripsi: Tabel daftar bahan baku — nama, qty, unit, supplier,
//            min level, status badge, dan tombol edit min level
//            (hanya tampil untuk user dengan izin).
// ============================================================

import { useTranslations } from 'next-intl'
import type { IngredientWithStatus } from '@/types'
import { StockStatusBadge } from './StockStatusBadge'

interface Props {
  ingredients: IngredientWithStatus[]
  canEditMinLevel: boolean
  onEditMinLevel: (ing: IngredientWithStatus) => void
}

export function StockTable({ ingredients, canEditMinLevel, onEditMinLevel }: Props) {
  const t = useTranslations('stock')

  if (ingredients.length === 0) {
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
            <th className="text-left font-medium py-3 px-4">{t('ingredientName')}</th>
            <th className="text-right font-medium py-3 px-4">{t('quantity')}</th>
            <th className="text-left font-medium py-3 px-4">{t('unit')}</th>
            <th className="text-left font-medium py-3 px-4">{t('supplier')}</th>
            <th className="text-right font-medium py-3 px-4">{t('minLevel')}</th>
            <th className="text-left font-medium py-3 px-4">{t('statusLabel')}</th>
            {canEditMinLevel && <th className="py-3 px-4"></th>}
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ing) => (
            <tr
              key={ing.id}
              className="border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <td className="py-3 px-4" style={{ color: 'var(--color-text)' }}>
                {ing.name}
              </td>
              <td
                className="py-3 px-4 text-right font-mono text-[13px]"
                style={{ color: 'var(--color-text)' }}
              >
                {formatNumber(ing.quantity_available)}
              </td>
              <td className="py-3 px-4" style={{ color: 'var(--color-text-secondary)' }}>
                {ing.purchase_unit}
              </td>
              <td className="py-3 px-4" style={{ color: 'var(--color-text-secondary)' }}>
                {ing.supplier ?? '—'}
              </td>
              <td
                className="py-3 px-4 text-right font-mono text-[13px]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {formatNumber(ing.minimum_stock_level)}
              </td>
              <td className="py-3 px-4">
                <StockStatusBadge status={ing.stock_status} />
              </td>
              {canEditMinLevel && (
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onEditMinLevel(ing)}
                    className="text-xs hover:underline"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {t('editMinLevel')}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Format angka dengan pemisah ribuan (locale ID), hilangkan trailing zero
function formatNumber(n: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 }).format(n)
}
