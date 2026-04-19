'use client'

// ============================================================
// File: src/components/pos/QuickSaleGrid.tsx
// Versi: v0.8.0
// Deskripsi: Grid produk quick-sale.
//            Tap untuk tambah, tombol +/- untuk atur jumlah.
//            Harga otomatis switch ke bundling saat mode bundling aktif.
//            Style "Crafted Minimalism" (Zentra): card radius 14px,
//            shadow-xs + hover shadow-sm, selected state ring accent.
//            Tombol +/- icon-button pill (rounded-full). Adaptif dark.
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

  // Empty state — belum ada produk aktif (RULE 9 tri-state)
  if (products.length === 0) {
    return (
      <div
        className="
          bg-card border border-border rounded-[14px]
          shadow-[var(--shadow-xs)]
          px-5 py-12 text-center
        "
      >
        <p className="text-foreground text-sm font-medium">
          {t('noProductsAvailable')}
        </p>
        <p className="text-muted-foreground text-xs mt-1">
          {t('noProductsHint')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header section: label micro-uppercase + count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.12em] leading-4">
          {t('productMenu')}
        </p>
        <span className="text-muted-foreground text-[11px] font-medium tabular-nums">
          {t('productCount', { count: products.length })}
        </span>
      </div>

      {/* Grid produk — 2 kolom mobile, 3 kolom tablet+ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
// Kartu produk individual — style Zentra, token-driven
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

  // Selected: border accent + ring halus; default: border + shadow-xs
  const stateClass = isSelected
    ? 'border-[color:var(--color-accent)] ring-1 ring-[color:var(--color-accent)]/20 shadow-[var(--shadow-sm)]'
    : 'border-border shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)]'

  return (
    <div
      className={`
        min-h-36 p-3 bg-card border rounded-[14px]
        flex flex-col justify-between
        transition-all duration-[var(--motion-base)] ease-[var(--ease-out)]
        ${stateClass}
      `}
    >
      {/* Bagian atas: placeholder gambar + info produk */}
      <div className="flex flex-col gap-1">
        {/* Placeholder gambar produk — bg-secondary (token), radius pill-ish */}
        <div className="w-full h-20 bg-[color:var(--color-bg-secondary)] rounded-[10px] flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            // Inisial 2 huruf sebagai placeholder (dipertahankan utk ID cepat)
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.12em]">
              {product.name.substring(0, 2)}
            </span>
          )}
        </div>

        {/* Nama produk */}
        <div className="pt-1">
          <p className="text-foreground text-sm font-semibold leading-tight line-clamp-2">
            {product.name}
          </p>
        </div>

        {/* Harga — accent color jika bundling aktif */}
        <p
          className={`text-xs leading-4 font-mono tabular-nums ${
            showBundlingPrice
              ? 'text-[color:var(--color-accent)] font-semibold'
              : 'text-muted-foreground font-normal'
          }`}
        >
          {formatRupiah(displayPrice)}
          {showBundlingPrice && (
            <span className="ml-1 text-[9px] font-semibold text-[color:var(--color-accent)]/70 uppercase tracking-[0.1em]">
              {t('bundling')}
            </span>
          )}
        </p>
      </div>

      {/* Bagian bawah: kontrol qty (+/-) — icon-button pill */}
      <div className="pt-3">
        <div className="flex items-center justify-between">
          {/* Tombol kurang */}
          <button
            type="button"
            onClick={onDecrement}
            disabled={qty === 0}
            className="
              size-8 rounded-full border border-border bg-card text-foreground
              flex justify-center items-center
              transition-colors duration-[var(--motion-base)] ease-[var(--ease-out)]
              hover:bg-[color:var(--color-bg-hover)]
              disabled:opacity-30 disabled:cursor-not-allowed
            "
            aria-label={`Kurangi ${product.name}`}
          >
            <svg width="8" height="2" viewBox="0 0 8 2" fill="none" aria-hidden="true">
              <rect width="8" height="1.5" rx="0.5" fill="currentColor" />
            </svg>
          </button>

          {/* Jumlah */}
          <span
            className={`text-sm font-semibold leading-5 min-w-[20px] text-center font-mono tabular-nums ${
              isSelected ? 'text-[color:var(--color-accent)]' : 'text-foreground'
            }`}
          >
            {qty}
          </span>

          {/* Tombol tambah */}
          <button
            type="button"
            onClick={onIncrement}
            className="
              size-8 rounded-full bg-[color:var(--color-accent)] text-white
              flex justify-center items-center
              shadow-[var(--shadow-xs)]
              transition-all duration-[var(--motion-base)] ease-[var(--ease-out)]
              hover:brightness-110 hover:shadow-[var(--shadow-sm)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            "
            aria-label={`Tambah ${product.name}`}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <rect x="4" y="0" width="2" height="10" rx="0.5" fill="currentColor" />
              <rect x="0" y="4" width="10" height="2" rx="0.5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
