'use client'

// ============================================================
// File: src/components/stock/MinLevelModal.tsx
// Versi: v0.10.0
// Deskripsi: Modal edit minimum_stock_level — hanya untuk user dengan
//            permission 'stock.edit_min_level'. Validasi Zod
//            memastikan nilai >= 0. Jika RLS DB reject, toast error.
// ============================================================

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import type { IngredientWithStatus } from '@/types'

interface Props {
  ingredient: IngredientWithStatus | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, newMinLevel: number) => Promise<void>
}

// Validasi: angka >= 0, maksimal 4 desimal (konsisten dengan schema DECIMAL(12,4))
const minLevelSchema = z.coerce.number().min(0, 'Level minimum tidak boleh negatif')

export function MinLevelModal({ ingredient, isOpen, onClose, onSave }: Props) {
  const t = useTranslations('stock')
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (ingredient) {
      setValue(String(ingredient.minimum_stock_level))
      setError(null)
    }
  }, [ingredient])

  if (!isOpen || !ingredient) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ingredient) return

    const parsed = minLevelSchema.safeParse(value)
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }

    setSaving(true)
    try {
      await onSave(ingredient.id, parsed.data)
      onClose()
    } catch (err) {
      // Error dari DB (RLS reject atau trigger guard) ditampilkan inline
      const message = err instanceof Error ? err.message : t('saveFailed')
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border p-6"
        style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          {t('editMinLevel')}
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {ingredient.name}
        </p>

        <form onSubmit={handleSubmit}>
          <label
            className="block text-xs uppercase tracking-wide mb-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {t('minLevel')} ({ingredient.purchase_unit})
          </label>
          <input
            type="number"
            step="0.0001"
            min="0"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError(null)
            }}
            className="w-full px-3 py-2 rounded-md border text-sm font-mono"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
            autoFocus
          />

          {error && (
            <p className="text-xs mt-2" style={{ color: 'var(--color-danger)' }}>
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-md text-sm border"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                background: 'transparent',
              }}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md text-sm text-white disabled:opacity-60"
              style={{ background: 'var(--color-accent)' }}
            >
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
