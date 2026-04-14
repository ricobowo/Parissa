'use client'

// ============================================================
// File: src/components/pos/QuickSaleGrid.tsx
// Versi: v0.7.0
// Deskripsi: Grid produk 2 kolom untuk quick-sale mobile.
//            Tap untuk tambah, tombol +/- untuk atur jumlah.
//            Harga otomatis switch ke bundling saat mode bundling aktif.
//            Desain diselaraskan dengan HTML reference (Mobile.html).
// ============================================================

import { useTranslations } from 'next-intl'
import { Product } from '@/types'
import { formatRupiah } from '@/lib/formulas'

// Tipe item keranjang: productId → jumlah
export type CartItems = Record<string, number>

interface QuickSaleGridProps {
  /** Daftar produk aktif yang bisa dipilih */
  products: Product[]
  /** State keranjang: { [productId]: qty } */
  cart: CartItems
  /** Mode bundling aktif — harga pakai bundling_price jika tersedia */
  isBundling: boolean
  /** Callback saat qty produk berubah */
  onUpdateQty: (productId: string, newQty: number) => void
}

export function QuickSaleGrid({
  products,
  cart,
  isBundling,
  onUpdateQty,
}: QuickSaleGridProps) {
  const t = useTranslations('pos')

  return (
    <div className="flex flex-col gap-4">
      {/* Header section: label + refresh */}
      <div className="flex items-center justify-between">
        <p className="text-zinc-600 text-[10px] font-medium font-['Inter'] uppercase leading-4 tracking-wide">
          {t('productMenu')}
        </p>
        <span className="text-blue-700 text-[10px] font-bold font-['Inter'] leading-4">
          {t('productCount', { count: products.length })}
        </span>
      </div>

      {/* Grid produk 2 kolom — sesuai HTML reference */}
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => {
          const qty = cart[product.id] || 0
          const isSelected = qty > 0

          // Tentukan harga yang ditampilkan
          const displayPrice =
            isBundling && product.bundling_price
              ? product.bundling_price
              : product.selling_price

          // Apakah harga bundling sedang aktif untuk produk ini
          const showBundlingPrice = isBundling && product.bundling_price != null

          return (
            <ProductCard
              key={product.id}
              product={product}
              qty={qty}
              isSelected={isSelected}
              displayPrice={displayPrice}
              showBundlingPrice={showBundlingPrice}
              onIncrement={() => onUpdateQty(product.id, qty + 1)}
              onDecrement={() => onUpdateQty(product.id, Math.max(0, qty - 1))}
            />
          )
        })}
      </div>
    </div>
  )
}

// -------------------------------------------------------------------
// Kartu produk individual — sesuai desain HTML reference
// -------------------------------------------------------------------
function ProductCard({
  product,
  qty,
  isSelected,
  displayPrice,
  showBundlingPrice,
  onIncrement,
  onDecrement,
}: {
  product: Product
  qty: number
  isSelected: boolean
  displayPrice: number
  showBundlingPrice: boolean
  onIncrement: () => void
  onDecrement: () => void
}) {
  const t = useTranslations('pos')
  // Kelas outline berbeda untuk kartu yang dipilih vs tidak
  const outlineClass = isSelected
    ? 'outline-blue-700/30 shadow-[0px_0px_0px_1px_rgba(0,83,219,0.10)]'
    : 'outline-zinc-400/20'

  return (
    <div
      className={`min-h-36 p-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] ${outlineClass} flex flex-col justify-between font-['Inter'] transition-all`}
    >
      {/* Bagian atas: gambar + info produk */}
      <div className="flex flex-col gap-1">
        {/* Placeholder gambar produk */}
        <div className="w-full h-20 bg-gray-200 rounded-sm flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-zinc-400 text-xs font-medium uppercase tracking-wide">
              {product.name.substring(0, 2)}
            </span>
          )}
        </div>

        {/* Nama produk */}
        <div className="pt-1">
          <p className="text-gray-800 text-sm font-bold leading-4 line-clamp-2">
            {product.name}
          </p>
        </div>

        {/* Harga — biru bold jika bundling, abu-abu biasa jika reguler */}
        <p
          className={`text-xs leading-4 ${
            showBundlingPrice
              ? 'text-blue-700 font-bold'
              : 'text-zinc-600 font-normal'
          }`}
        >
          {formatRupiah(displayPrice)}
          {showBundlingPrice && (
            <span className="ml-1 text-[9px] font-bold text-blue-700/60 uppercase">
              {t('bundling')}
            </span>
          )}
        </p>
      </div>

      {/* Bagian bawah: kontrol qty (+/-) */}
      <div className="pt-3">
        <div className="flex items-center justify-between">
          {/* Tombol kurang */}
          <button
            type="button"
            onClick={onDecrement}
            disabled={qty === 0}
            className="size-8 rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-400/30 flex justify-center items-center hover:bg-zinc-50 transition-colors disabled:opacity-30"
            aria-label={`Kurangi ${product.name}`}
          >
            <svg width="8" height="2" viewBox="0 0 8 2" fill="none">
              <rect width="8" height="1.5" rx="0.5" fill="#1f2937" />
            </svg>
          </button>

          {/* Jumlah */}
          <span
            className={`text-sm font-bold leading-5 min-w-[20px] text-center ${
              isSelected ? 'text-blue-700' : 'text-gray-800'
            }`}
          >
            {qty}
          </span>

          {/* Tombol tambah */}
          <button
            type="button"
            onClick={onIncrement}
            className="size-8 bg-blue-700 rounded-sm flex justify-center items-center hover:bg-blue-800 transition-colors"
            aria-label={`Tambah ${product.name}`}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="4" y="0" width="2" height="10" rx="0.5" fill="white" />
              <rect x="0" y="4" width="10" height="2" rx="0.5" fill="white" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
