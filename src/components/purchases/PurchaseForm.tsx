'use client'

// ============================================================
// File: src/components/purchases/PurchaseForm.tsx
// Versi: v0.11.0
// Deskripsi: Form input pembelian bahan baku (restock).
//            Menampilkan preview cost per unit realtime (Formula 5.7)
//            saat user mengisi qty_purchased & price_paid.
// ============================================================

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import type { Ingredient } from '@/types'
import { calcPurchaseCostPerUnit, formatRupiah } from '@/lib/formulas'

// Schema validasi — qty dan harga harus positif, tanggal wajib
const purchaseSchema = z.object({
  ingredient_id: z.string().uuid('Pilih bahan terlebih dahulu'),
  qty_purchased: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  price_paid: z.coerce.number().positive('Harga harus lebih dari 0'),
  supplier: z.string().optional(),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  notes: z.string().optional(),
})

export type PurchaseFormData = z.infer<typeof purchaseSchema>

interface Props {
  ingredients: Ingredient[]
  onSubmit: (data: PurchaseFormData) => Promise<void>
  onCancel: () => void
  defaultIngredientId?: string
}

export function PurchaseForm({ ingredients, onSubmit, onCancel, defaultIngredientId }: Props) {
  const t = useTranslations('purchases')

  const [form, setForm] = useState({
    ingredient_id: defaultIngredientId ?? '',
    qty_purchased: '',
    price_paid: '',
    supplier: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Preview cost per unit — live update, Formula 5.7
  const costPreview = useMemo(() => {
    const qty = Number(form.qty_purchased)
    const price = Number(form.price_paid)
    if (qty <= 0 || price <= 0) return null
    return calcPurchaseCostPerUnit({ pricePaid: price, qtyPurchased: qty })
  }, [form.qty_purchased, form.price_paid])

  const selectedIngredient = useMemo(
    () => ingredients.find((i) => i.id === form.ingredient_id) ?? null,
    [ingredients, form.ingredient_id]
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const parsed = purchaseSchema.safeParse(form)
    if (!parsed.success) {
      const errMap: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        errMap[issue.path.join('.')] = issue.message
      }
      setErrors(errMap)
      return
    }

    setSaving(true)
    try {
      await onSubmit(parsed.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : t('saveFailed')
      setErrors({ _form: message })
    } finally {
      setSaving(false)
    }
  }

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Bahan */}
      <Field label={t('ingredient')} error={errors.ingredient_id} required>
        <select
          value={form.ingredient_id}
          onChange={(e) => setField('ingredient_id', e.target.value)}
          className="w-full px-3 py-2 rounded-md border text-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
        >
          <option value="">{t('selectIngredient')}</option>
          {ingredients.map((ing) => (
            <option key={ing.id} value={ing.id}>
              {ing.name} ({ing.purchase_unit})
            </option>
          ))}
        </select>
      </Field>

      {/* Qty + Harga sebaris */}
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('qtyPurchased')} error={errors.qty_purchased} required>
          <div className="relative">
            <input
              type="number"
              step="0.0001"
              min="0"
              value={form.qty_purchased}
              onChange={(e) => setField('qty_purchased', e.target.value)}
              className="w-full px-3 py-2 rounded-md border text-sm font-mono"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
            />
            {selectedIngredient && (
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {selectedIngredient.purchase_unit}
              </span>
            )}
          </div>
        </Field>

        <Field label={t('pricePaid')} error={errors.price_paid} required>
          <input
            type="number"
            step="1"
            min="0"
            value={form.price_paid}
            onChange={(e) => setField('price_paid', e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 rounded-md border text-sm font-mono"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
          />
        </Field>
      </div>

      {/* Preview cost per unit — Formula 5.7 */}
      {costPreview !== null && selectedIngredient && (
        <div
          className="rounded-md border px-3 py-2 flex justify-between items-center"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-secondary)',
          }}
        >
          <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
            {t('costPerUnitPreview')}
          </span>
          <span className="text-sm font-mono" style={{ color: 'var(--color-text)' }}>
            {formatRupiah(costPreview)} / {selectedIngredient.purchase_unit}
          </span>
        </div>
      )}

      {/* Supplier + Tanggal */}
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('supplier')} error={errors.supplier}>
          <input
            type="text"
            value={form.supplier}
            onChange={(e) => setField('supplier', e.target.value)}
            placeholder={t('supplierPlaceholder')}
            className="w-full px-3 py-2 rounded-md border text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
          />
        </Field>

        <Field label={t('date')} error={errors.date} required>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setField('date', e.target.value)}
            className="w-full px-3 py-2 rounded-md border text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
          />
        </Field>
      </div>

      {/* Catatan */}
      <Field label={t('notes')} error={errors.notes}>
        <textarea
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-md border text-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
        />
      </Field>

      {errors._form && (
        <p className="text-xs" style={{ color: 'var(--color-danger)' }}>
          {errors._form}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 rounded-md text-sm border"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
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
  )
}

// -------------------------------------------------------------------
// Field wrapper — label + error message
// -------------------------------------------------------------------
function Field({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        className="block text-xs uppercase tracking-wide mb-1.5 font-medium"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
        {required && <span style={{ color: 'var(--color-danger)' }}> *</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
