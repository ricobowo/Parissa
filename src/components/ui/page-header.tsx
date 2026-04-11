// ============================================================
// File: src/components/ui/page-header.tsx
// Versi: v0.5.0
// Deskripsi: Komponen header halaman — judul + deskripsi + area aksi kanan
//            Dipakai di semua halaman sebagai header konsisten
// ============================================================

interface PageHeaderProps {
  /** Judul halaman utama */
  title: string
  /** Deskripsi opsional di bawah judul */
  description?: string
  /** Elemen aksi di sisi kanan (tombol, filter, dll) */
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      {/* Bagian kiri: judul dan deskripsi */}
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && (
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Bagian kanan: tombol aksi */}
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}
