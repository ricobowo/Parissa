// ============================================================
// File: src/components/customers/LabelDialog.tsx
// Versi: v0.14.0
// Deskripsi: Dialog untuk edit label & notes pelanggan.
//            Pilihan label diambil dari master customer_labels.
// ============================================================

'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { CustomerStats, CustomerLabel } from '@/types'

interface Props {
  customer: CustomerStats | null
  labels: CustomerLabel[]
  isOpen: boolean
  onClose: () => void
  onSave: (customerId: string, label: string | null, notes: string | null) => Promise<void>
}

export function LabelDialog({ customer, labels, isOpen, onClose, onSave }: Props) {
  const t = useTranslations('customers.labelDialog')
  const tCommon = useTranslations('common')
  const [selectedLabel, setSelectedLabel] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sinkron state ketika customer berubah
  useEffect(() => {
    if (customer) {
      setSelectedLabel(customer.label ?? '')
      setNotes(customer.notes ?? '')
      setError(null)
    }
  }, [customer])

  if (!isOpen || !customer) return null

  async function handleSave() {
    if (!customer) return
    setSaving(true)
    setError(null)
    try {
      await onSave(
        customer.id,
        selectedLabel || null,
        notes.trim() || null
      )
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
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
          {t('title')}
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {customer.name}
        </p>

        {/* Pilih label */}
        <label className="block text-xs font-bold uppercase tracking-wide mb-2"
          style={{ color: 'var(--color-text-secondary)' }}>
          {t('selectLabel')}
        </label>
        <select
          value={selectedLabel}
          onChange={(e) => setSelectedLabel(e.target.value)}
          className="w-full px-3 py-2 rounded-md border text-sm mb-4"
          style={{
            background: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        >
          <option value="">{t('noLabel')}</option>
          {labels.map((l) => (
            <option key={l.id} value={l.name}>{l.name}</option>
          ))}
        </select>

        {/* Notes */}
        <label className="block text-xs font-bold uppercase tracking-wide mb-2"
          style={{ color: 'var(--color-text-secondary)' }}>
          {t('notes')}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-md border text-sm mb-4 resize-none"
          style={{
            background: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        />

        {error && (
          <p className="text-xs mb-3" style={{ color: 'var(--color-danger)' }}>
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-md border text-sm"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              background: 'transparent',
            }}
          >
            {tCommon('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-md text-sm text-white"
            style={{ background: 'var(--color-accent)' }}
          >
            {saving ? tCommon('loading') : tCommon('save')}
          </button>
        </div>
      </div>
    </div>
  )
}
