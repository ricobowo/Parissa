import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format angka ke format Rupiah (PRD Section 5.11).
 * Contoh: 1000000 → "Rp 1.000.000"
 */
export function formatRupiah(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return 'Rp 0'
  return 'Rp ' + new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(n)
}

/**
 * Format tanggal ISO/Date ke locale Indonesia: "15 Apr 2026".
 */
export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return '-'
  const d = typeof iso === 'string' ? new Date(iso) : iso
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
