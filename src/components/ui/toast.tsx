// ============================================================
// File: src/components/ui/toast.tsx
// Versi: v0.5.0
// Deskripsi: Komponen toast notifikasi — minimalis hitam putih
//            Muncul di pojok kanan bawah, auto-hilang 4 detik
// ============================================================

'use client'

import type { Toast as ToastType, ToastVariant } from '@/lib/hooks/use-toast'

// Mapping warna ikon berdasarkan variant toast
const VARIANT_STYLES: Record<ToastVariant, { icon: string; color: string }> = {
  default: { icon: '●', color: 'var(--color-text-secondary)' },
  success: { icon: '✓', color: 'var(--color-success)' },
  error:   { icon: '✕', color: 'var(--color-danger)' },
  warning: { icon: '!', color: 'var(--color-warning)' },
}

interface ToastProps {
  toast: ToastType
  onDismiss: (id: string) => void
}

export function ToastItem({ toast, onDismiss }: ToastProps) {
  const style = VARIANT_STYLES[toast.variant]

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-lg border shadow-sm max-w-sm animate-in slide-in-from-right"
      style={{
        background: 'var(--color-bg)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Ikon status */}
      <span className="text-sm font-bold mt-0.5" style={{ color: style.color }}>
        {style.icon}
      </span>

      {/* Konten pesan */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.description && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {toast.description}
          </p>
        )}
      </div>

      {/* Tombol dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-xs flex-shrink-0 p-1"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        ✕
      </button>
    </div>
  )
}
