// ============================================================
// File: src/components/ui/loading-skeleton.tsx
// Versi: v0.5.0
// Deskripsi: Komponen skeleton loading — animasi pulse minimalis
//            Tersedia varian: card, table row, dan generic
// ============================================================

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

/** Elemen skeleton dasar — kotak abu dengan animasi pulse */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md', className)}
      style={{ background: 'var(--color-bg-secondary)' }}
    />
  )
}

/** Skeleton untuk KPI card (tinggi 96px) */
export function CardSkeleton() {
  return (
    <div
      className="p-4 rounded-lg border"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-7 w-32 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

/** Skeleton untuk baris tabel (1 baris) */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 px-2">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

/** Skeleton untuk halaman penuh — header + 6 card + tabel */
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton judul halaman */}
      <Skeleton className="h-8 w-48" />

      {/* Skeleton 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Skeleton tabel */}
      <div>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
