/**
 * @file   export.ts
 * @version 1.0.0
 * @description Utility export data ke Excel (.xlsx) menggunakan SheetJS.
 *              Mendukung multi-sheet, format Rupiah, auto-width kolom.
 *              Digunakan di semua halaman laporan Parissa POS.
 */

import * as XLSX from 'xlsx'

// -------------------------------------------------------------------
// Tipe
// -------------------------------------------------------------------

export interface SheetConfig {
  /** Nama sheet di workbook */
  name: string
  /** Array of objects — setiap object jadi 1 baris */
  data: Record<string, unknown>[]
}

export interface ExportOptions {
  /** Daftar sheet yang akan dibuat */
  sheets: SheetConfig[]
  /** Otomatis atur lebar kolom berdasarkan konten (default: false) */
  autoWidth?: boolean
}

// -------------------------------------------------------------------
// Format Rupiah untuk cell Excel (string, bukan number)
// Berbeda dari formatRupiah() di formulas.ts yang pakai Intl —
// ini menghasilkan string sederhana tanpa simbol non-breaking space.
// -------------------------------------------------------------------
export function formatRupiahExcel(amount: number): string {
  const isNegative = amount < 0
  const abs = Math.abs(amount)
  const formatted = abs.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`
}

// -------------------------------------------------------------------
// Nama file export standar
// Format: Parissa-[TipeReport]-[YYYY-MM].xlsx
// -------------------------------------------------------------------
export function buildExportFilename(reportType: string, period: string): string {
  return `Parissa-${reportType}-${period}.xlsx`
}

// -------------------------------------------------------------------
// Generate Excel workbook sebagai Buffer
// Digunakan untuk testing dan juga sebagai basis downloadExcel()
// -------------------------------------------------------------------
export function generateExcelBuffer(options: ExportOptions): Buffer {
  const { sheets, autoWidth = false } = options
  const wb = XLSX.utils.book_new()

  for (const sheetConfig of sheets) {
    const ws = XLSX.utils.json_to_sheet(sheetConfig.data)

    // Auto-width: hitung lebar kolom berdasarkan konten
    if (autoWidth && sheetConfig.data.length > 0) {
      const keys = Object.keys(sheetConfig.data[0])
      const colWidths = keys.map((key) => {
        // Lebar minimum = panjang header
        let maxLen = key.length

        // Cek setiap baris untuk lebar terpanjang
        for (const row of sheetConfig.data) {
          const val = row[key]
          const len = val != null ? String(val).length : 0
          if (len > maxLen) maxLen = len
        }

        // Tambah padding 2 karakter
        return { wch: maxLen + 2 }
      })

      ws['!cols'] = colWidths
    }

    XLSX.utils.book_append_sheet(wb, ws, sheetConfig.name)
  }

  // Tulis workbook ke buffer
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  return buffer
}

// -------------------------------------------------------------------
// Download Excel di browser (client-side)
// Trigger download file .xlsx dari data yang diberikan.
// -------------------------------------------------------------------
export function downloadExcel(options: ExportOptions & { filename: string }): void {
  const { filename, ...exportOptions } = options
  const wb = XLSX.utils.book_new()

  for (const sheetConfig of exportOptions.sheets) {
    const ws = XLSX.utils.json_to_sheet(sheetConfig.data)

    // Auto-width
    if (exportOptions.autoWidth && sheetConfig.data.length > 0) {
      const keys = Object.keys(sheetConfig.data[0])
      const colWidths = keys.map((key) => {
        let maxLen = key.length
        for (const row of sheetConfig.data) {
          const val = row[key]
          const len = val != null ? String(val).length : 0
          if (len > maxLen) maxLen = len
        }
        return { wch: maxLen + 2 }
      })
      ws['!cols'] = colWidths
    }

    XLSX.utils.book_append_sheet(wb, ws, sheetConfig.name)
  }

  // Trigger download di browser
  XLSX.writeFile(wb, filename)
}
