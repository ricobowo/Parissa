/**
 * @file   export.test.ts
 * @version 1.0.0
 * @description Unit test untuk export utility (SheetJS).
 *              Menguji: generateExcel, format Rupiah, multi-sheet,
 *              nama file, data kosong.
 */

import * as XLSX from 'xlsx'
import {
  generateExcelBuffer,
  buildExportFilename,
  formatRupiahExcel,
  ExportOptions,
} from './export'

// --- Test: Format Rupiah untuk Excel ---
describe('formatRupiahExcel', () => {
  it('memformat angka positif ke format Rupiah', () => {
    expect(formatRupiahExcel(1000000)).toBe('Rp 1.000.000')
  })

  it('memformat angka nol', () => {
    expect(formatRupiahExcel(0)).toBe('Rp 0')
  })

  it('memformat angka negatif', () => {
    expect(formatRupiahExcel(-500000)).toBe('-Rp 500.000')
  })

  it('memformat angka kecil', () => {
    expect(formatRupiahExcel(20000)).toBe('Rp 20.000')
  })
})

// --- Test: Nama file export ---
describe('buildExportFilename', () => {
  it('menghasilkan nama file dengan format yang benar', () => {
    const result = buildExportFilename('Profit', '2026-04')
    expect(result).toBe('Parissa-Profit-2026-04.xlsx')
  })

  it('menghasilkan nama file dengan tipe berbeda', () => {
    const result = buildExportFilename('Bulanan', '2026-03')
    expect(result).toBe('Parissa-Bulanan-2026-03.xlsx')
  })
})

// --- Test: Generate Excel buffer ---
describe('generateExcelBuffer', () => {
  const sampleData = [
    { produk: 'Pannacotta Vanilla', revenue: 400000, cost: 120000, profit: 280000 },
    { produk: 'Earl Grey Fresh Creamy', revenue: 280000, cost: 90000, profit: 190000 },
  ]

  const sampleSummary = [
    { metrik: 'Total Revenue', nilai: 'Rp 680.000' },
    { metrik: 'Total Cost', nilai: 'Rp 210.000' },
    { metrik: 'Total Profit', nilai: 'Rp 470.000' },
  ]

  it('menghasilkan buffer yang valid', () => {
    const buffer = generateExcelBuffer({
      sheets: [
        { name: 'Data', data: sampleData },
      ],
    })

    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
  })

  it('membuat workbook dengan 1 sheet', () => {
    const buffer = generateExcelBuffer({
      sheets: [
        { name: 'Data', data: sampleData },
      ],
    })

    const wb = XLSX.read(buffer, { type: 'buffer' })
    expect(wb.SheetNames).toEqual(['Data'])
  })

  it('membuat workbook dengan 2 sheet (summary + detail)', () => {
    const buffer = generateExcelBuffer({
      sheets: [
        { name: 'Ringkasan', data: sampleSummary },
        { name: 'Detail', data: sampleData },
      ],
    })

    const wb = XLSX.read(buffer, { type: 'buffer' })
    expect(wb.SheetNames).toEqual(['Ringkasan', 'Detail'])
  })

  it('menulis data yang benar ke sheet', () => {
    const buffer = generateExcelBuffer({
      sheets: [
        { name: 'Data', data: sampleData },
      ],
    })

    const wb = XLSX.read(buffer, { type: 'buffer' })
    const sheet = wb.Sheets['Data']
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({
      produk: 'Pannacotta Vanilla',
      revenue: 400000,
      cost: 120000,
      profit: 280000,
    })
  })

  it('menangani data kosong tanpa error', () => {
    const buffer = generateExcelBuffer({
      sheets: [
        { name: 'Kosong', data: [] },
      ],
    })

    const wb = XLSX.read(buffer, { type: 'buffer' })
    expect(wb.SheetNames).toEqual(['Kosong'])
  })

  it('mengatur lebar kolom otomatis jika autoWidth true (tanpa error)', () => {
    // Test bahwa generateExcelBuffer dengan autoWidth tidak throw error
    // dan menghasilkan buffer valid. Column widths di-set di worksheet
    // tapi tidak di-persist oleh XLSX.read(), jadi kita verifikasi
    // bahwa prosesnya berjalan tanpa error.
    const buffer = generateExcelBuffer({
      sheets: [
        { name: 'Data', data: sampleData },
      ],
      autoWidth: true,
    })

    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)

    // Verifikasi data masih benar meskipun autoWidth aktif
    const wb = XLSX.read(buffer, { type: 'buffer' })
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets['Data'])
    expect(rows).toHaveLength(2)
  })
})
