// ============================================================
// File: src/components/ui/toaster.tsx
// Versi: v0.5.0
// Deskripsi: Provider Toaster — render semua toast aktif di pojok kanan bawah
//            Ditaruh di root layout agar bisa dipanggil dari mana saja
// ============================================================

'use client'

import { useToast } from '@/lib/hooks/use-toast'
import { ToastItem } from './toast'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 md:bottom-6 md:right-6">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  )
}
