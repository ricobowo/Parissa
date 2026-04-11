// ============================================================
// File: src/lib/hooks/use-toast.ts
// Versi: v0.5.0
// Deskripsi: Hook custom untuk menampilkan toast notifikasi
//            Menggunakan state global sederhana tanpa library tambahan
// ============================================================

'use client'

import { useState, useCallback } from 'react'

// Tipe toast yang tersedia
export type ToastVariant = 'default' | 'success' | 'error' | 'warning'

export interface Toast {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

// State global sederhana untuk toast — dibagikan antar komponen
let listeners: Array<(toasts: Toast[]) => void> = []
let globalToasts: Toast[] = []

// Fungsi untuk memberitahu semua listener tentang perubahan
function emitChange() {
  listeners.forEach((listener) => listener([...globalToasts]))
}

/** Tambah toast baru — auto-hilang setelah 4 detik */
export function toast({
  title,
  description,
  variant = 'default',
}: Omit<Toast, 'id'>) {
  const id = Date.now().toString()
  const newToast: Toast = { id, title, description, variant }

  globalToasts = [...globalToasts, newToast]
  emitChange()

  // Auto-hapus setelah 4 detik
  setTimeout(() => {
    globalToasts = globalToasts.filter((t) => t.id !== id)
    emitChange()
  }, 4000)
}

/** Hook untuk subscribe ke toast state */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(globalToasts)

  // Subscribe saat hook digunakan
  useState(() => {
    listeners.push(setToasts)
    return () => {
      listeners = listeners.filter((l) => l !== setToasts)
    }
  })

  // Fungsi hapus toast manual
  const dismiss = useCallback((id: string) => {
    globalToasts = globalToasts.filter((t) => t.id !== id)
    emitChange()
  }, [])

  return { toasts, toast, dismiss }
}
