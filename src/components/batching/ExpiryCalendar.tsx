'use client'

// ============================================================
// File: src/components/batching/ExpiryCalendar.tsx
// Versi: v0.12.0
// Deskripsi: Kalender bulanan menampilkan batch berdasarkan
//            expiration_date. Sel tanggal diberi highlight:
//            - expired/H-1: --color-danger (merah)
//            - H-3:         --color-warning (kuning)
//            - ok:          default (abu-abu)
//            Semua warna via CSS variables (no hardcode).
// ============================================================

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { BatchWithExpiry } from '@/types'

interface Props {
  batches: BatchWithExpiry[]
  onSelectBatch?: (batch: BatchWithExpiry) => void
}

export function ExpiryCalendar({ batches, onSelectBatch }: Props) {
  const t = useTranslations('batching')
  const today = useMemo(() => new Date(), [])
  // Cursor bulan yang sedang ditampilkan
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  // Group batch berdasarkan tanggal expiry (YYYY-MM-DD) — lookup O(1)
  const batchesByDate = useMemo(() => {
    const map = new Map<string, BatchWithExpiry[]>()
    for (const b of batches) {
      if (!map.has(b.expiration_date)) map.set(b.expiration_date, [])
      map.get(b.expiration_date)!.push(b)
    }
    return map
  }, [batches])

  const cells = useMemo(() => buildMonthGrid(cursor), [cursor])
  const monthLabel = cursor.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  const weekdayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

  function goPrev() {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
  }
  function goNext() {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
  }

  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
    >
      {/* Header navigator */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goPrev}
          className="px-3 py-1.5 rounded-md border text-sm"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          aria-label={t('prevMonth')}
        >
          ‹
        </button>
        <p className="text-sm font-semibold capitalize" style={{ color: 'var(--color-text)' }}>
          {monthLabel}
        </p>
        <button
          type="button"
          onClick={goNext}
          className="px-3 py-1.5 rounded-md border text-sm"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          aria-label={t('nextMonth')}
        >
          ›
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdayKeys.map((k) => (
          <div
            key={k}
            className="text-[10px] uppercase tracking-wide text-center py-1 font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {t(`weekday.${k}`)}
          </div>
        ))}
      </div>

      {/* Grid tanggal */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          const iso = toIso(cell.date)
          const cellBatches = batchesByDate.get(iso) ?? []
          const bucket = worstBucket(cellBatches)
          const isToday = sameYmd(cell.date, today)
          const isCurrentMonth = cell.inMonth

          const bg =
            bucket === 'expired' || bucket === 'h1'
              ? 'color-mix(in srgb, var(--color-danger) 12%, var(--color-bg))'
              : bucket === 'h3'
                ? 'color-mix(in srgb, var(--color-warning) 14%, var(--color-bg))'
                : 'var(--color-bg)'

          const textColor =
            bucket === 'expired' || bucket === 'h1'
              ? 'var(--color-danger)'
              : bucket === 'h3'
                ? 'var(--color-warning)'
                : isCurrentMonth
                  ? 'var(--color-text)'
                  : 'var(--color-text-tertiary)'

          return (
            <div
              key={idx}
              className="rounded-md border min-h-[56px] p-1.5 flex flex-col"
              style={{
                background: bg,
                borderColor: isToday ? 'var(--color-accent)' : 'var(--color-border)',
                opacity: isCurrentMonth ? 1 : 0.5,
              }}
            >
              <span
                className="text-[11px] font-semibold leading-none"
                style={{ color: textColor }}
              >
                {cell.date.getDate()}
              </span>
              <div className="mt-1 flex flex-col gap-0.5 overflow-hidden">
                {cellBatches.slice(0, 2).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBatch?.(b)}
                    className="text-[10px] truncate text-left hover:underline"
                    style={{ color: textColor }}
                    title={`${b.batch_number} • ${b.product_name ?? ''}`}
                  >
                    {b.product_name ?? b.batch_number}
                  </button>
                ))}
                {cellBatches.length > 2 && (
                  <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                    +{cellBatches.length - 2}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      <div
        className="flex items-center gap-4 flex-wrap mt-4 pt-3 border-t text-xs"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
      >
        <span className="font-medium">{t('calendarLegend')}:</span>
        <LegendSwatch color="var(--color-danger)" label={t('legendExpired')} />
        <LegendSwatch color="var(--color-danger)" label={t('legendH1')} />
        <LegendSwatch color="var(--color-warning)" label={t('legendH3')} />
        <LegendSwatch color="var(--color-text-tertiary)" label={t('legendOk')} />
      </div>
    </div>
  )
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
      <span>{label}</span>
    </span>
  )
}

// -------------------------------------------------------------------
// Helper: buat grid 6×7 untuk bulan tertentu (minggu = kolom pertama)
// -------------------------------------------------------------------
interface Cell {
  date: Date
  inMonth: boolean
}

function buildMonthGrid(monthStart: Date): Cell[] {
  const year = monthStart.getFullYear()
  const month = monthStart.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay() // 0 = Minggu
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: Cell[] = []
  // Leading days dari bulan sebelumnya
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    cells.push({ date: d, inMonth: false })
  }
  // Hari-hari bulan berjalan
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true })
  }
  // Trailing — genapkan ke kelipatan 7 (42 total = 6 baris)
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date
    const next = new Date(last)
    next.setDate(last.getDate() + 1)
    cells.push({ date: next, inMonth: next.getMonth() === month })
  }
  return cells
}

function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function sameYmd(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// Kembalikan bucket "terburuk" (paling urgent) di antara batch pada 1 sel
function worstBucket(list: BatchWithExpiry[]): BatchWithExpiry['expiry_bucket'] | 'none' {
  if (list.length === 0) return 'none'
  const order: Record<string, number> = { expired: 0, h1: 1, h3: 2, ok: 3 }
  return list.reduce<BatchWithExpiry['expiry_bucket']>(
    (worst, b) => (order[b.expiry_bucket] < order[worst] ? b.expiry_bucket : worst),
    list[0].expiry_bucket
  )
}
