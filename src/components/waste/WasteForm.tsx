// ============================================================
// File: src/components/waste/WasteForm.tsx
// Versi: v0.14.0
// Deskripsi: Form catat waste/spoilage produk.
//            waste_cost dihitung otomatis oleh DB trigger (Formula 5.9),
//            jadi client hanya kirim product_id, quantity, reason, date, notes.
// ============================================================

'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Product } from '@/types'

export type WasteReason = 'Expired' | 'Damaged' | 'Sample' | 'Other'

export interface WasteFormData {
  product_id: string
  quantity: number
  reason: WasteReason
  date: string
  notes: string | null
}

interface Props {
  products: Product[]
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: WasteFormData) => Promise<void>
}

export function WasteForm({ products, isOpen, onClose, onSubmit }: Props) {
  const t = useTranslations('waste.form')
  const tReason = useTranslations('waste.reason')

  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState<number | ''>('')
  const [reason, setReason] = useState<WasteReason>('Expired')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form setiap kali dialog dibuka
  useEffect(() => {
    if (isOpen) {
      setProductId('')
      setQuantity('')
      setReason('Expired')
      setDate(new Date().toISOString().slice(0, 10))
      setNotes('')
      setError(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!productId) { setError('Pilih produk.'); return }
    if (!quantity || Number(quantity) <= 0) { setError('Jumlah harus > 0.'); return }

    setSaving(true)
    try {
      await onSubmit({
        product_id: productId,
        quantity: Number(quantity),
        reason,
        date,
        notes: notes.trim() || null,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  const reasons: WasteReason[] = ['Expired', 'Damaged', 'Sample', 'Other']

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg border p-6"
        style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          {t('title')}
        </h2>

        <Field label={t('product')}>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-3 py-2 rounded-md border text-sm"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
            required
          >
            <option value="">{t('selectProduct')}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t('quantity')}>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 rounded-md border text-sm font-mono"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              required
            />
          </Field>

          <Field label={t('date')}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-md border text-sm"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              required
            />
          </Field>
        </div>

        <Field label={t('reason')}>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as WasteReason)}
            className="w-full px-3 py-2 rounded-md border text-sm"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            {reasons.map((r) => (
              <option key={r} value={r}>{tReason(r)}</option>
            ))}
          </select>
        </Field>

        <Field label={t('notes')}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-md border text-sm resize-none"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </Field>

        {error && (
          <p className="text-xs mb-3" style={{ color: 'var(--color-danger)' }}>
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-md border text-sm"
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
            className="px-4 py-2 rounded-md text-sm text-white"
            style={{ background: 'var(--color-accent)' }}
          >
            {saving ? '...' : t('save')}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-bold uppercase tracking-wide mb-1"
        style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
      {children}
    </label>
  )
}
