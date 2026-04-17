// ============================================================
// File: src/components/customers/OverdueList.tsx
// Versi: v0.14.0
// Deskripsi: Daftar piutang overdue (> 3 hari, PRD Section 5.10).
//            Highlight kuning-oranye. Aksi: mark Followed-up / Bad Debt / Paid.
// ============================================================

import { useTranslations } from 'next-intl'
import type { OverduePayment, FollowupAction } from '@/types'
import { formatRupiah, formatDate } from '@/lib/utils'

interface Props {
  items: OverduePayment[]
  busyId: string | null
  onAction: (saleId: string, action: FollowupAction) => Promise<void>
}

export function OverdueList({ items, busyId, onAction }: Props) {
  const t = useTranslations('customers')
  const tFollow = useTranslations('customers.followup')
  const tStatus = useTranslations('customers.status')

  if (items.length === 0) {
    return (
      <div
        className="border rounded-md p-12 text-center text-sm"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)' }}
      >
        {t('noOverdue')}
      </div>
    )
  }

  return (
    <div
      className="border rounded-md overflow-x-auto"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr
            className="text-left border-b"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <Th>{t('columnName')}</Th>
            <Th>{t('columnProduct')}</Th>
            <Th>{t('columnLastPurchase')}</Th>
            <Th className="text-right">{t('columnDaysOverdue')}</Th>
            <Th className="text-right">{t('columnAmount')}</Th>
            <Th>{t('columnLabel')}</Th>
            <Th className="text-right">{t('columnActions')}</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => {
            const busy = busyId === it.sale_id
            // Highlight baris dengan border kuning/oranye di sisi kiri
            return (
              <tr
                key={it.sale_id}
                className="border-b"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'color-mix(in srgb, var(--color-warning) 5%, transparent)',
                }}
              >
                <Td>
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {it.customer_name}
                  </span>
                  {it.customer_phone && (
                    <span className="block text-[11px]"
                      style={{ color: 'var(--color-text-tertiary)' }}>
                      {it.customer_phone}
                    </span>
                  )}
                </Td>
                <Td style={{ color: 'var(--color-text-secondary)' }}>
                  {it.product_name}
                </Td>
                <Td style={{ color: 'var(--color-text-secondary)' }}>
                  {formatDate(it.sale_date)}
                </Td>
                <Td className="text-right font-mono text-[13px] tabular-nums">
                  <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                    {it.days_overdue}
                  </span>
                </Td>
                <Td className="text-right font-mono text-[13px] tabular-nums">
                  {formatRupiah(it.sale_price)}
                </Td>
                <Td>
                  <StatusDot status={it.followup_status} labelFn={tStatus} />
                </Td>
                <Td>
                  <div className="flex justify-end gap-2 flex-wrap">
                    <ActionBtn
                      onClick={() => onAction(it.sale_id, 'followed_up')}
                      disabled={busy}
                      label={tFollow('markFollowedUp')}
                    />
                    <ActionBtn
                      onClick={() => onAction(it.sale_id, 'payment_received')}
                      disabled={busy}
                      label={tFollow('markPaid')}
                      tone="success"
                    />
                    <ActionBtn
                      onClick={() => onAction(it.sale_id, 'marked_bad_debt')}
                      disabled={busy}
                      label={tFollow('markBadDebt')}
                      tone="danger"
                    />
                  </div>
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wide ${className}`}>
      {children}
    </th>
  )
}

function Td({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <td className={`px-3 py-2.5 align-top ${className}`} style={style}>
      {children}
    </td>
  )
}

function StatusDot({
  status,
  labelFn,
}: {
  status: string | null
  labelFn: (k: string) => string
}) {
  if (!status) return <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>
  const colorMap: Record<string, string> = {
    pending:     'var(--color-warning)',
    followed_up: 'var(--color-accent)',
    bad_debt:    'var(--color-danger)',
    paid:        'var(--color-success)',
  }
  const dot = colorMap[status] ?? 'var(--color-text-tertiary)'
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px]">
      <span className="size-1.5 rounded-full" style={{ background: dot }} />
      <span style={{ color: 'var(--color-text-secondary)' }}>
        {labelFn(status)}
      </span>
    </span>
  )
}

function ActionBtn({
  onClick,
  disabled,
  label,
  tone = 'default',
}: {
  onClick: () => void
  disabled: boolean
  label: string
  tone?: 'default' | 'success' | 'danger'
}) {
  const toneMap: Record<string, string> = {
    default: 'var(--color-text)',
    success: 'var(--color-success)',
    danger:  'var(--color-danger)',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-2 py-1 rounded border text-[11px] hover:bg-[var(--color-bg-hover)] disabled:opacity-50"
      style={{
        borderColor: 'var(--color-border)',
        color: toneMap[tone],
        background: 'var(--color-bg)',
      }}
    >
      {label}
    </button>
  )
}
