'use client'

// ============================================================
// File: src/components/products/ProductModal.tsx
// Versi: v0.6.1
// Deskripsi: Modal form untuk tambah dan edit produk.
//            Field: nama, harga jual, harga bundling, toggle is_bundling + is_active.
//            Desain diselaraskan dengan HTML reference (Tailwind).
// ============================================================

import { useState, useEffect } from 'react'
import { Product } from '@/types'

interface ProductFormData {
  name: string
  selling_price: string   // string untuk input, konversi ke number saat submit
  bundling_price: string
  is_bundling: boolean
  is_active: boolean
}

interface ProductModalProps {
  /** Null berarti mode tambah baru, ada value berarti mode edit */
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'image_url'>) => Promise<void>
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  selling_price: '',
  bundling_price: '',
  is_bundling: false,
  is_active: true,
}

export function ProductModal({ product, isOpen, onClose, onSave }: ProductModalProps) {
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({})

  // Isi form saat edit produk yang ada
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        selling_price: String(product.selling_price),
        bundling_price: product.bundling_price ? String(product.bundling_price) : '',
        is_bundling: product.is_bundling,
        is_active: product.is_active,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [product, isOpen])

  // Jangan render jika modal tidak terbuka
  if (!isOpen) return null

  // Validasi form sebelum submit
  function validate(): boolean {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {}

    if (!form.name.trim()) {
      newErrors.name = 'Nama produk wajib diisi'
    }

    const harga = parseFloat(form.selling_price)
    if (!form.selling_price || isNaN(harga) || harga <= 0) {
      newErrors.selling_price = 'Harga jual harus lebih dari 0'
    }

    // Harga bundling wajib jika is_bundling = true
    if (form.is_bundling) {
      const hargaBundling = parseFloat(form.bundling_price)
      if (!form.bundling_price || isNaN(hargaBundling) || hargaBundling <= 0) {
        newErrors.bundling_price = 'Harga bundling wajib diisi untuk produk bundling'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      await onSave({
        name: form.name.trim(),
        selling_price: parseFloat(form.selling_price),
        bundling_price: form.is_bundling && form.bundling_price
          ? parseFloat(form.bundling_price)
          : null,
        is_bundling: form.is_bundling,
        is_active: form.is_active,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  // Handle perubahan field is_bundling — reset bundling_price jika dimatikan
  function handleBundlingToggle(checked: boolean) {
    setForm((prev) => ({
      ...prev,
      is_bundling: checked,
      bundling_price: checked ? prev.bundling_price : '',
    }))
    if (!checked) {
      setErrors((prev) => ({ ...prev, bundling_price: undefined }))
    }
  }

  return (
    // Overlay gelap dengan blur ringan
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-800/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Panel modal */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden font-['Inter']">

        {/* Header modal */}
        <div className="px-8 py-6 border-b border-zinc-100 flex items-start justify-between">
          <div>
            <p className="text-blue-700 text-[10px] font-bold uppercase tracking-wide leading-4">
              MANAJEMEN PRODUK
            </p>
            <h2 className="text-zinc-900 text-xl font-extrabold leading-7 mt-0.5">
              {product ? 'Edit Produk' : 'Tambah Produk'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-colors text-lg leading-none mt-0.5"
            aria-label="Tutup"
          >
            ×
          </button>
        </div>

        {/* Body form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-5">

          {/* Field: Nama Produk */}
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-600 text-[10px] font-normal uppercase leading-4 tracking-wide">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="cth. Vanilla Pannacotta"
              className={`w-full bg-zinc-100 rounded-sm px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-700/20 ${
                errors.name ? 'ring-2 ring-red-400' : ''
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Field: Harga Jual */}
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-600 text-[10px] font-normal uppercase leading-4 tracking-wide">
              Harga Jual (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.selling_price}
              onChange={(e) => setForm((p) => ({ ...p, selling_price: e.target.value }))}
              placeholder="cth. 20000"
              min="0"
              className={`w-full bg-zinc-100 rounded-sm px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-700/20 ${
                errors.selling_price ? 'ring-2 ring-red-400' : ''
              }`}
            />
            {errors.selling_price && (
              <p className="text-xs text-red-500">{errors.selling_price}</p>
            )}
          </div>

          {/* Toggle: Produk Bundling */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-semibold text-gray-800">Produk Bundling</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Aktifkan jika produk ini dijual dalam paket bundling
              </p>
            </div>
            {/* Toggle switch sesuai referensi HTML */}
            <button
              type="button"
              onClick={() => handleBundlingToggle(!form.is_bundling)}
              className="relative flex-shrink-0"
              aria-checked={form.is_bundling}
              role="switch"
            >
              <div className={`w-9 h-5 rounded-xl transition-colors ${
                form.is_bundling ? 'bg-blue-700' : 'bg-zinc-400/30'
              }`} />
              <div className={`size-4 absolute top-0.5 bg-white rounded-xl border transition-all ${
                form.is_bundling
                  ? 'left-[18px] border-white shadow-sm'
                  : 'left-0.5 border-gray-300'
              }`} />
            </button>
          </div>

          {/* Field: Harga Bundling — hanya tampil jika is_bundling */}
          {form.is_bundling && (
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-600 text-[10px] font-normal uppercase leading-4 tracking-wide">
                Harga Bundling (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.bundling_price}
                onChange={(e) => setForm((p) => ({ ...p, bundling_price: e.target.value }))}
                placeholder="cth. 55000"
                min="0"
                className={`w-full bg-zinc-100 rounded-sm px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-700/20 ${
                  errors.bundling_price ? 'ring-2 ring-red-400' : ''
                }`}
              />
              {errors.bundling_price && (
                <p className="text-xs text-red-500">{errors.bundling_price}</p>
              )}
            </div>
          )}

          {/* Toggle: Status Aktif */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-semibold text-gray-800">Status Aktif</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Produk nonaktif tidak muncul di POS
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
              className="relative flex-shrink-0"
              aria-checked={form.is_active}
              role="switch"
            >
              <div className={`w-9 h-5 rounded-xl transition-colors ${
                form.is_active ? 'bg-blue-700' : 'bg-zinc-400/30'
              }`} />
              <div className={`size-4 absolute top-0.5 bg-white rounded-xl border transition-all ${
                form.is_active
                  ? 'left-[18px] border-white shadow-sm'
                  : 'left-0.5 border-gray-300'
              }`} />
            </button>
          </div>

          {/* Tombol aksi footer */}
          <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-3 outline outline-1 outline-offset-[-1px] outline-zinc-200 rounded-sm text-zinc-600 text-sm font-semibold text-center hover:bg-zinc-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 relative bg-blue-700 rounded-sm text-white text-sm font-semibold text-center shadow-md hover:bg-blue-800 transition-colors disabled:opacity-60"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
