// ============================================================
// File: src/components/customers/LabelBadge.tsx
// Versi: v0.14.0
// Deskripsi: Badge kecil untuk menampilkan label pelanggan (VIP, dll.)
//            Warna dari master customer_labels.color, fallback ke gray.
// ============================================================

import type { CustomerLabelColor } from '@/types'

// Peta warna label ke CSS variable / hex (mengikuti design system monokrom)
const COLOR_MAP: Record<CustomerLabelColor, { bg: string; text: string; dot: string }> = {
  gray:   { bg: 'var(--color-bg-hover)', text: 'var(--color-text-secondary)', dot: 'var(--color-text-tertiary)' },
  blue:   { bg: '#EAF3FB',               text: '#1F5B8A',                      dot: 'var(--color-accent)' },
  green:  { bg: '#E8F3E8',               text: '#0F5C0F',                      dot: 'var(--color-success)' },
  orange: { bg: '#FCEEDC',               text: '#8A4A09',                      dot: 'var(--color-warning)' },
  red:    { bg: '#FBE8E8',               text: '#8A1F1F',                      dot: 'var(--color-danger)' },
  purple: { bg: '#F1E9FA',               text: '#5A2E8A',                      dot: '#8B5CF6' },
}

interface Props {
  label: string | null | undefined
  color?: CustomerLabelColor | null
}

export function LabelBadge({ label, color }: Props) {
  if (!label) return <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>
  const c = COLOR_MAP[color ?? 'gray'] ?? COLOR_MAP.gray
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: c.bg, color: c.text }}
    >
      <span className="size-1.5 rounded-full" style={{ background: c.dot }} />
      {label}
    </span>
  )
}
