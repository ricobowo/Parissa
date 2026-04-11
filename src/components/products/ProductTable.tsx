'use client'

// ============================================================
// File: src/components/products/ProductTable.tsx
// Versi: v0.6.1
// Deskripsi: Tabel daftar produk — nama, harga jual, cost/unit,
//            margin, status aktif, dan tombol aksi edit/toggle.
//            Desain diselaraskan dengan HTML reference (Tailwind).
// ============================================================

import Link from 'next/link'
import { Product } from '@/types'
import { formatRupiah, formatMargin } from '@/lib/formulas'

interface ProductWithCost extends Product {
  /** Cost per unit dihitung dari BOM — bisa null jika belum ada resep */
  costPerUnit?: number
  /** Margin dihitung dari harga jual dan cost */
  profitMargin?: number
}

interface ProductTableProps {
  products: ProductWithCost[]
  locale: string
  onEdit: (product: ProductWithCost) => void
  onToggleActive: (product: ProductWithCost) => void
}

export function ProductTable({ products, locale, onEdit, onToggleActive }: ProductTableProps) {
  // State kosong
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100">
        <p className="text-sm text-zinc-400 font-['Inter']">
          Belum ada produk. Tambahkan produk pertama Anda.
        </p>
      </div>
    )
  }

  return (
    // Wrapper scroll horizontal untuk mobile
    <div className="w-full overflow-x-auto bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100 overflow-hidden">
      <table className="w-full min-w-[700px] text-sm font-['Inter']">
        {/* Header tabel */}
        <thead>
          <tr className="bg-neutral-50 border-b border-zinc-100">
            <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
              Nama Produk
            </th>
            <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
              Harga Jual
            </th>
            <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
              Harga Bundling
            </th>
            <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
              Cost/Unit
            </th>
            <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
              Margin
            </th>
            <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
              Status
            </th>
            <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
              Aksi
            </th>
          </tr>
        </thead>

        {/* Baris data produk */}
        <tbody>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              locale={locale}
              onEdit={onEdit}
              onToggleActive={onToggleActive}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// -------------------------------------------------------------------
// Baris individual produk
// -------------------------------------------------------------------
function ProductRow({
  product,
  locale,
  onEdit,
  onToggleActive,
}: {
  product: ProductWithCost
  locale: string
  onEdit: (p: ProductWithCost) => void
  onToggleActive: (p: ProductWithCost) => void
}) {
  const hasRecipe = product.costPerUnit != null && product.costPerUnit > 0
  const margin = product.profitMargin

  // Tentukan warna badge margin: ≥100% hijau emerald, <100% amber
  const marginBadgeClass = margin != null && margin >= 100
    ? 'bg-emerald-50 text-emerald-700'
    : 'bg-amber-50 text-amber-700'

  return (
    <tr
      className="border-t border-zinc-100 hover:bg-zinc-50 transition-colors"
      style={{ opacity: product.is_active ? 1 : 0.55 }}
    >
      {/* Nama produk + badge bundling */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">
            {product.name}
          </span>
          {product.is_bundling && (
            <span className="px-1.5 py-0.5 bg-blue-700/10 rounded text-[10px] font-bold text-blue-700 uppercase tracking-wide">
              Bundling
            </span>
          )}
        </div>
      </td>

      {/* Harga jual */}
      <td className="px-6 py-4 text-right text-sm font-bold text-blue-700">
        {formatRupiah(product.selling_price)}
      </td>

      {/* Harga bundling — em dash jika tidak ada */}
      <td className="px-6 py-4 text-right text-sm font-normal text-zinc-600">
        {product.bundling_price ? formatRupiah(product.bundling_price) : '—'}
      </td>

      {/* Cost per unit — em dash jika belum ada resep */}
      <td className="px-6 py-4 text-right text-sm font-medium">
        {hasRecipe ? (
          <span className="text-gray-800">{formatRupiah(product.costPerUnit!)}</span>
        ) : (
          <span className="text-zinc-400">—</span>
        )}
      </td>

      {/* Margin — badge warna-warni */}
      <td className="px-6 py-4 text-right">
        {hasRecipe && margin != null ? (
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${marginBadgeClass}`}>
            {formatMargin(margin)}
          </span>
        ) : (
          <span className="text-zinc-400 text-sm">—</span>
        )}
      </td>

      {/* Badge status aktif / nonaktif */}
      <td className="px-6 py-4">
        {product.is_active ? (
          <span className="inline-block px-2 py-1 bg-green-100 rounded text-[10px] font-bold text-green-700 uppercase">
            Aktif
          </span>
        ) : (
          <span className="inline-block px-2 py-1 bg-zinc-100 rounded text-[10px] font-bold text-zinc-500 uppercase">
            Nonaktif
          </span>
        )}
      </td>

      {/* Tombol aksi */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          {/* Tombol lihat resep */}
          <Link
            href={`/${locale}/recipes?product=${product.id}`}
            className="px-2.5 py-1 rounded-sm text-xs font-medium text-blue-700 outline outline-1 outline-offset-[-1px] outline-zinc-200 hover:bg-blue-50 transition-colors"
          >
            Resep
          </Link>

          {/* Tombol edit */}
          <button
            onClick={() => onEdit(product)}
            className="px-2.5 py-1 rounded-sm text-xs font-medium text-zinc-600 outline outline-1 outline-offset-[-1px] outline-zinc-200 hover:bg-zinc-50 transition-colors"
          >
            Edit
          </button>

          {/* Tombol toggle aktif/nonaktif */}
          <button
            onClick={() => onToggleActive(product)}
            className={`px-2.5 py-1 rounded-sm text-xs font-medium outline outline-1 outline-offset-[-1px] outline-zinc-200 hover:bg-zinc-50 transition-colors ${
              product.is_active ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {product.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
        </div>
      </td>
    </tr>
  )
}
