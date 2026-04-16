'use client'

// ============================================================
// File: src/components/batching/BatchForm.tsx
// Versi: v0.12.0
// Deskripsi: Form pembuatan batch produksi. Input: produk,
//            batch_quantity (pcs), batch_date, expiration_date,
//            notes. batch_number otomatis di-generate oleh trigger DB.
//            Menampilkan preview bahan yang akan dipotong sesuai BOM.
// ============================================================

import { useMemo, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import type { Product, Ingredient } from '@/types'
import { createClient } from '@/lib/supabase/client'

// Schema validasi — quantity positif, tanggal kadaluarsa ≥ tanggal produksi
const batchSchema = z
  .object({
    product_id: z.string().uuid('Pilih produk terlebih dahulu'),
    batch_quantity: z.coerce.number().int().positive('Jumlah harus lebih dari 0'),
    batch_date: z.string().min(1, 'Tanggal produksi wajib diisi'),
    expiration_date: z.string().min(1, 'Tanggal kadaluarsa wajib diisi'),
    notes: z.string().optional(),
  })
  .refine((d) => d.expiration_date >= d.batch_date, {
    message: 'Tanggal kadaluarsa tidak boleh lebih awal dari tanggal produksi',
    path: ['expiration_date'],
  })

export type BatchFormData = z.infer<typeof batchSchema>

interface Props {
  products: Product[]
  onSubmit: (data: BatchFormData) => Promise<void>
  onCancel: () => void
}

// Preview bahan dipotong — ditarik ad-hoc saat produk dipilih
interface RecipePreview {
  ingredient_name: string
  qty_needed: number
  qty_available: number
  unit: string
  shortage: boolean
}

export function BatchForm({ products, onSubmit, onCancel }: Props) {
  const t = useTranslations('batching')

  const [form, setForm] = useState({
    product_id: '',
    batch_quantity: '',
    batch_date: new Date().toISOString().slice(0, 10),
    expiration_date: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [recipePreview, setRecipePreview] = useState<RecipePreview[]>([])
  const [loadingRecipe, setLoadingRecipe] = useState(false)

  // Ambil resep + stok bahan saat produk berubah
  // Dipakai untuk preview "bahan yang akan dipotong" — mengurangi surprise
  useEffect(() => {
    if (!form.product_id) {
      setRecipePreview([])
      return
    }

    let cancelled = false
    async function loadRecipe() {
      setLoadingRecipe(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('recipes')
        .select('quantity_per_batch, pcs_per_batch, ingredient:ingredients(*)')
        .eq('product_id', form.product_id)

      if (cancelled) return
      if (error) {
        setRecipePreview([])
        setLoadingRecipe(false)
        return
      }

      const qty = Number(form.batch_quantity) || 0
      type RecipeRow = {
        quantity_per_batch: number
        pcs_per_batch: number
        // Supabase dapat mengembalikan relasi sebagai objek tunggal ATAU array
        ingredient: Ingredient | Ingredient[] | null
      }
      const rows = (data ?? []) as unknown as RecipeRow[]
      const items: RecipePreview[] = rows.map((r) => {
        const ing = Array.isArray(r.ingredient) ? r.ingredient[0] : r.ingredient
        const qtyNeeded =
          qty > 0 && r.pcs_per_batch > 0
            ? r.quantity_per_batch * (qty / r.pcs_per_batch)
            : 0
        return {
          ingredient_name: ing?.name ?? '—',
          qty_needed: qtyNeeded,
          qty_available: ing?.quantity_available ?? 0,
          unit: ing?.purchase_unit ?? '',
          shortage: ing ? qtyNeeded > ing.quantity_available : false,
        }
      })
      setRecipePreview(items)
      setLoadingRecipe(false)
    }
    loadRecipe()
    return () => {
      cancelled = true
    }
  }, [form.product_id, form.batch_quantity])

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === form.product_id) ?? null,
    [products, form.product_id]
  )

  const hasShortage = recipePreview.some((r) => r.shortage)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const parsed = batchSchema.safeParse(form)
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
      {/* Produk */}
      <Field label={t('product')} error={errors.product_id} required>
        <select
          value={form.product_id}
          onChange={(e) => setField('product_id', e.target.value)}
          className="w-full px-3 py-2 rounded-md border text-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
        >
          <option value="">{t('selectProduct')}</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      {/* Qty + Tanggal produksi sebaris */}
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('batchQuantity')} error={errors.batch_quantity} required>
          <input
            type="number"
            step="1"
            min="1"
            value={form.batch_quantity}
            onChange={(e) => setField('batch_quantity', e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 rounded-md border text-sm font-mono"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
          />
        </Field>

        <Field label={t('batchDate')} error={errors.batch_date} required>
          <input
            type="date"
            value={form.batch_date}
            onChange={(e) => setField('batch_date', e.target.value)}
            className="w-full px-3 py-2 rounded-md border text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
          />
        </Field>
      </div>

      {/* Expiry date */}
      <Field label={t('expirationDate')} error={errors.expiration_date} required>
        <input
          type="date"
          value={form.expiration_date}
          min={form.batch_date}
          onChange={(e) => setField('expiration_date', e.target.value)}
          className="w-full px-3 py-2 rounded-md border text-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
        />
      </Field>

      {/* Preview bahan dipotong — hanya tampil jika produk dipilih */}
      {selectedProduct && (
        <div
          className="rounded-md border p-3"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}
        >
          <p
            className="text-[10px] uppercase tracking-wide font-bold mb-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Bahan Dipotong
          </p>
          {loadingRecipe ? (
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Memuat resep...
            </p>
          ) : recipePreview.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--color-warning)' }}>
              {t('noIngredientsDeducted')}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {recipePreview.map((r, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center text-xs font-mono"
                  style={{
                    color: r.shortage ? 'var(--color-danger)' : 'var(--color-text)',
                  }}
                >
                  <span className="font-sans">{r.ingredient_name}</span>
                  <span>
                    {r.qty_needed.toFixed(2)} {r.unit}{' '}
                    <span style={{ color: 'var(--color-text-tertiary)' }}>
                      / tersedia {r.qty_available.toFixed(2)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

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

      {/* Info batch_number auto */}
      <p className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
        {t('batchNumber')}: <em>{t('autoGenerated')}</em>
      </p>

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
          disabled={saving || hasShortage}
          className="px-4 py-2 rounded-md text-sm text-white disabled:opacity-60"
          style={{ background: 'var(--color-accent)' }}
          title={hasShortage ? 'Stok bahan tidak cukup' : undefined}
        >
          {saving ? t('saving') : t('save')}
        </button>
      </div>
    </form>
  )
}

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
