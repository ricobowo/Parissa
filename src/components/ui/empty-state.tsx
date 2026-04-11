// ============================================================
// File: src/components/ui/empty-state.tsx
// Versi: v0.5.0
// Deskripsi: Komponen empty state — tampilan saat data kosong
//            Minimalis: ikon + pesan + tombol aksi opsional
// ============================================================

interface EmptyStateProps {
  /** Ikon atau emoji yang ditampilkan (opsional) */
  icon?: string
  /** Judul pesan kosong */
  title: string
  /** Deskripsi tambahan */
  description?: string
  /** Elemen aksi (tombol tambah data, dll) */
  action?: React.ReactNode
}

export function EmptyState({ icon = '○', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Ikon besar */}
      <span
        className="text-4xl mb-4"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        {icon}
      </span>

      {/* Judul */}
      <p className="font-medium mb-1">{title}</p>

      {/* Deskripsi */}
      {description && (
        <p
          className="text-sm max-w-sm mb-4"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {description}
        </p>
      )}

      {/* Tombol aksi */}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
