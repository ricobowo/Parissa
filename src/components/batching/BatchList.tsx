'use client'

// ============================================================
// File: src/components/batching/BatchList.tsx
// Versi: v0.12.0
// Deskripsi: Tabel batch produksi dengan state-machine inline:
//            Planned → In Progress → Completed
//            Planned / In Progress dapat juga ditandai Expired.
//            Warna badge expiry (H-3 kuning, H-1/expired merah) via
//            CSS variables. Semua transisi divalidasi oleh trigger DB.
// ============================================================

import { useTranslations } from 'next-intl'
import type { BatchStatus, BatchWithExpiry, ExpiryBucket } from '@/types'

interface Props {
  batches: BatchWithExpiry[]
  onChangeStatus: (batch: BatchWithExpiry, next: BatchStatus) => void
}

export function BatchList({ batches, onChangeStatus }: Props) {
  const t = useTranslations('batching')

  if (batches.length === 0) {
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
            className="text-[11px] uppercase tracking-wide border-b"
            style={{
              color: 'var(--color-text-secondary)',
              borderColor: 'var(--color-border)',
            }}
          >
            <th className="text-left font-medium py-3 px-4">{t('batchNumber')}</th>
            <th className="text-left font-medium py-3 px-4">{t('product')}</th>
            <th className="text-right font-medium py-3 px-4">Qty</th>
            <th className="text-left font-medium py-3 px-4">{t('batchDate')}</th>
            <th className="text-left font-medium py-3 px-4">{t('expirationDate')}</th>
            <th className="text-left font-medium py-3 px-4">{t('status')}</th>
            <th className="text-right font-medium py-3 px-4">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((b) => (
            <tr
              key={b.id}
              className="border-b last:border-b-0"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-text)' }}>
                {b.batch_number}
              </td>
              <td className="py-3 px-4" style={{ color: 'var(--color-text)' }}>
                {b.product_name ?? '—'}
              </td>
              <td className="py-3 px-4 text-right font-mono" style={{ color: 'var(--color-text)' }}>
                {b.batch_quantity}
              </td>
              <td className="py-3 px-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {formatDate(b.batch_date)}
              </td>
              <td className="py-3 px-4 text-xs">
                <ExpiryBadge date={b.expiration_date} bucket={b.expiry_bucket} days={b.days_until_expiry} />
              </td>
              <td className="py-3 px-4">
                <StatusDot status={b.status} label={t(`statuses.${b.status}`)} />
              </td>
              <td className="py-3 px-4 text-right">
                <StatusActions batch={b} onChangeStatus={onChangeStatus} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// -------------------------------------------------------------------
// Badge expiry — warna via CSS variable sesuai bucket
// -------------------------------------------------------------------
function ExpiryBadge({
  date,
  bucket,
  days,
}: {
  date: string
  bucket: ExpiryBucket
  days: number
}) {
  const color =
    bucket === 'expired' || bucket === 'h1'
      ? 'var(--color-danger)'
      : bucket === 'h3'
        ? 'var(--color-warning)'
        : 'var(--color-text-secondary)'

  let suffix = ''
  if (bucket === 'expired') suffix = ` (lewat ${Math.abs(days)}h)`
  else if (days === 0) suffix = ' (hari ini)'
  else if (bucket === 'h1' || bucket === 'h3') suffix = ` (${days}h lagi)`

  return (
    <span className="font-mono" style={{ color }}>
      {formatDate(date)}
      <span className="ml-1 text-[10px]">{suffix}</span>
    </span>
  )
}

// -------------------------------------------------------------------
// Dot + label untuk status — konsisten dengan gaya badge minimalis
// -------------------------------------------------------------------
function StatusDot({ status, label }: { status: BatchStatus; label: string }) {
  const color =
    status === 'Completed'
      ? 'var(--color-success)'
      : status === 'In Progress'
        ? 'var(--color-accent)'
        : status === 'Expired'
          ? 'var(--color-danger)'
          : 'var(--color-text-tertiary)'

  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      <span style={{ color: 'var(--color-text)' }}>{label}</span>
    </span>
  )
}

// -------------------------------------------------------------------
// Tombol aksi status — hanya tampilkan transisi valid sesuai state machine
// -------------------------------------------------------------------
function StatusActions({
  batch,
  onChangeStatus,
}: {
  batch: BatchWithExpiry
  onChangeStatus: (b: BatchWithExpiry, next: BatchStatus) => void
}) {
  const t = useTranslations('batching')
  const s = batch.status

  if (s === 'Completed' || s === 'Expired') {
    return <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>—</span>
  }

  return (
    <div className="flex justify-end gap-2 flex-wrap">
      {s === 'Planned' && (
        <ActionBtn onClick={() => onChangeStatus(batch, 'In Progress')}>
          {t('startProduction')}
        </ActionBtn>
      )}
      {s === 'In Progress' && (
        <ActionBtn onClick={() => onChangeStatus(batch, 'Completed')} variant="primary">
          {t('markCompleted')}
        </ActionBtn>
      )}
      <ActionBtn onClick={() => onChangeStatus(batch, 'Expired')} variant="danger">
        {t('markExpired')}
      </ActionBtn>
    </div>
  )
}

function ActionBtn({
  children,
  onClick,
  variant = 'default',
}: {
  children: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'primary' | 'danger'
}) {
  const bg =
    variant === 'primary'
      ? 'var(--color-accent)'
      : variant === 'danger'
        ? 'transparent'
        : 'transparent'
  const color =
    variant === 'primary'
      ? '#fff'
      : variant === 'danger'
        ? 'var(--color-danger)'
        : 'var(--color-text)'
  const border =
    variant === 'primary' ? 'transparent' : 'var(--color-border)'

  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2.5 py-1 rounded-md text-[11px] font-medium border"
      style={{ background: bg, color, borderColor: border }}
    >
      {children}
    </button>
  )
}

function formatDate(iso: string): string {
  // Tampilkan DD MMM YYYY sesuai locale ID — ringan, tanpa lib tambahan
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
