'use client'

// ============================================================
// File: src/components/pos/SaleForm.tsx
// Versi: v0.8.0
// Deskripsi: Form penjualan lengkap untuk POS Parissa.
//            Required fields: nama pembeli, tanggal, produk (via grid),
//            jumlah, bundling toggle, status bayar.
//            Optional fields: menu detail, topping, tipe penjualan,
//            tanggal pre-order, catatan.
//            Auto-calculate harga real-time (Formula 5.1).
//            v0.8.0 — Redesign Fase 2 #2 (Zentra): semua warna hardcoded
//            diganti ke CSS variables (adaptif dark mode). Input radius
//            10px, card radius 14px, shadow soft, segmented control
//            token-driven, toggle switch pakai --color-accent, sticky
//            footer pakai display-scale 28px + backdrop-blur bg-card/90.
// ============================================================

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Product } from '@/types'
import { calcSalePrice, formatRupiah } from '@/lib/formulas'
import { QuickSaleGrid, CartItems } from './QuickSaleGrid'

// ---- Shared class tokens ----
// Input/textarea/date — radius 10px, bg card, border, focus ring accent
const INPUT_BASE_CLASS =
  'w-full px-4 py-3 bg-[color:var(--color-bg-elevated)] ' +
  'border rounded-[10px] text-sm font-normal text-foreground ' +
  'placeholder:text-muted-foreground ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring ' +
  'transition-colors duration-[var(--motion-base)] ease-[var(--ease-out)]'

const INPUT_NORMAL_CLASS = 'border-border'
const INPUT_ERROR_CLASS = 'border-[color:var(--color-danger)]'

// Micro-label uppercase konsisten
const LABEL_CLASS =
  'text-muted-foreground text-[11px] font-medium uppercase tracking-[0.12em] leading-4'

// Data yang dikirim ke parent saat submit
export interface SaleSubmitData {
  customerName: string
  date: string
  paymentStatus: 'Sudah' | 'Belum'
  isBundling: boolean
  cart: CartItems                    // { productId: qty }
  menuDetail: string
  topping: string
  saleType: 'Direct' | 'Pre-order'
  preOrderDate: string | null
  notes: string
}

interface SaleFormProps {
  /** Daftar produk aktif untuk grid */
  products: Product[]
  /** Sedang proses submit */
  submitting: boolean
  /** Callback submit form */
  onSubmit: (data: SaleSubmitData) => Promise<void>
}

export function SaleForm({ products, submitting, onSubmit }: SaleFormProps) {
  const t = useTranslations('pos')

  // --- State form required fields ---
  const [customerName, setCustomerName] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [paymentStatus, setPaymentStatus] = useState<'Sudah' | 'Belum'>('Sudah')
  const [isBundling, setIsBundling] = useState(false)
  const [cart, setCart] = useState<CartItems>({})

  // --- State form optional fields ---
  const [menuDetail, setMenuDetail] = useState('')
  const [topping, setTopping] = useState('')
  const [saleType, setSaleType] = useState<'Direct' | 'Pre-order'>('Direct')
  const [preOrderDate, setPreOrderDate] = useState('')
  const [notes, setNotes] = useState('')

  // --- State UI ---
  const [showOptional, setShowOptional] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Hitung total item di keranjang
  const totalItems = useMemo(
    () => Object.values(cart).reduce((sum, qty) => sum + qty, 0),
    [cart]
  )

  // Hitung total harga menggunakan Formula 5.1 — real-time update
  const totalPrice = useMemo(() => {
    let total = 0
    for (const [productId, qty] of Object.entries(cart)) {
      if (qty <= 0) continue
      const product = products.find((p) => p.id === productId)
      if (!product) continue

      total += calcSalePrice({
        sellingPrice: product.selling_price,
        bundlingPrice: product.bundling_price,
        isBundling,
        amount: qty,
      })
    }
    return total
  }, [cart, products, isBundling])

  // Daftar produk yang ada di keranjang (untuk ringkasan)
  const cartSummary = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([productId, qty]) => {
        const product = products.find((p) => p.id === productId)
        if (!product) return null
        const price = calcSalePrice({
          sellingPrice: product.selling_price,
          bundlingPrice: product.bundling_price,
          isBundling,
          amount: qty,
        })
        return { product, qty, price }
      })
      .filter(Boolean) as { product: Product; qty: number; price: number }[]
  }, [cart, products, isBundling])

  // Update qty produk di keranjang
  function handleUpdateQty(productId: string, newQty: number) {
    setCart((prev) => {
      const updated = { ...prev }
      if (newQty <= 0) {
        delete updated[productId]
      } else {
        updated[productId] = newQty
      }
      return updated
    })
    // Hapus error produk jika sudah ada item
    if (errors.cart) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.cart
        return next
      })
    }
  }

  // Validasi form sebelum submit
  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!customerName.trim()) {
      newErrors.customerName = t('customerNameRequired')
    }

    if (!date) {
      newErrors.date = t('dateRequired')
    }

    if (totalItems === 0) {
      newErrors.cart = t('selectMinProduct')
    }

    if (saleType === 'Pre-order' && !preOrderDate) {
      newErrors.preOrderDate = t('preorderDateRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    await onSubmit({
      customerName: customerName.trim(),
      date,
      paymentStatus,
      isBundling,
      cart,
      menuDetail: menuDetail.trim(),
      topping: topping.trim(),
      saleType,
      preOrderDate: saleType === 'Pre-order' ? preOrderDate : null,
      notes: notes.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-44">
      {/* ================================================================ */}
      {/* SECTION 1: Required Fields — Nama Pembeli, Tanggal, Status Bayar */}
      {/* ================================================================ */}
      <div className="flex flex-col gap-4">
        {/* Field: Nama Pembeli */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>
            {t('customerName')} <span className="text-[color:var(--color-danger)]">*</span>
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value)
              if (errors.customerName) {
                setErrors((p) => { const n = { ...p }; delete n.customerName; return n })
              }
            }}
            placeholder={t('customerNamePlaceholder')}
            className={`${INPUT_BASE_CLASS} ${
              errors.customerName ? INPUT_ERROR_CLASS : INPUT_NORMAL_CLASS
            }`}
          />
          {errors.customerName && (
            <p className="text-xs text-[color:var(--color-danger)] mt-0.5">
              {errors.customerName}
            </p>
          )}
        </div>

        {/* Row: Tanggal + Status Bayar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
          {/* Field: Tanggal */}
          <div className="flex-1 flex flex-col gap-1.5">
            <label className={LABEL_CLASS}>
              {t('date')} <span className="text-[color:var(--color-danger)]">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${INPUT_BASE_CLASS} ${
                errors.date ? INPUT_ERROR_CLASS : INPUT_NORMAL_CLASS
              }`}
            />
            {errors.date && (
              <p className="text-xs text-[color:var(--color-danger)] mt-0.5">
                {errors.date}
              </p>
            )}
          </div>

          {/* Field: Status Bayar — segmented control token-driven */}
          <div className="flex-1 flex flex-col gap-1.5">
            <label className={LABEL_CLASS}>
              {t('paymentStatus')} <span className="text-[color:var(--color-danger)]">*</span>
            </label>
            <SegmentedControl
              value={paymentStatus}
              options={[
                { value: 'Sudah', label: t('paid') },
                { value: 'Belum', label: t('unpaid') },
              ]}
              onChange={(v) => setPaymentStatus(v as 'Sudah' | 'Belum')}
            />
          </div>
        </div>

        {/* Toggle: Bundling Promo — card token-driven */}
        <div
          className="
            p-4 bg-[color:var(--color-bg-secondary)] border border-border
            rounded-[14px] flex items-center justify-between
          "
        >
          <div className="min-w-0 pr-3">
            <p className="text-foreground text-sm font-semibold leading-5">
              {t('bundlingPromo')}
            </p>
            <p className="text-muted-foreground text-xs font-normal leading-4 mt-0.5">
              {t('bundlingDescription')}
            </p>
          </div>
          <ToggleSwitch
            checked={isBundling}
            onChange={setIsBundling}
            ariaLabel="Toggle bundling"
          />
        </div>
      </div>

      {/* ================================================================ */}
      {/* SECTION 2: Product Grid (Quick Sale) */}
      {/* ================================================================ */}
      {errors.cart && (
        <div
          className="
            px-4 py-3 rounded-[10px]
            bg-[color:var(--color-danger)]/10
            border border-[color:var(--color-danger)]/30
          "
        >
          <p className="text-xs font-semibold text-[color:var(--color-danger)]">
            {errors.cart}
          </p>
        </div>
      )}

      <QuickSaleGrid
        products={products}
        cart={cart}
        isBundling={isBundling}
        onUpdateQty={handleUpdateQty}
      />

      {/* ================================================================ */}
      {/* SECTION 3: Ringkasan Keranjang (tampil jika ada item) */}
      {/* ================================================================ */}
      {cartSummary.length > 0 && (
        <div
          className="
            bg-card border border-border rounded-[14px] overflow-hidden
            shadow-[var(--shadow-xs)]
          "
        >
          <div className="px-5 py-3 bg-[color:var(--color-bg-secondary)] border-b border-border">
            <p className={LABEL_CLASS}>
              {t('orderSummary')} — {totalItems} {t('items')}
            </p>
          </div>
          <div className="divide-y divide-border">
            {cartSummary.map(({ product, qty, price }) => (
              <div
                key={product.id}
                className="px-5 py-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono tabular-nums">
                    {qty} × {formatRupiah(
                      isBundling && product.bundling_price
                        ? product.bundling_price
                        : product.selling_price
                    )}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[color:var(--color-accent)] ml-3 font-mono tabular-nums">
                  {formatRupiah(price)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SECTION 4: Optional Fields (Collapsible) */}
      {/* ================================================================ */}
      <div className="flex flex-col gap-3">
        {/* Accordion trigger — card radius 14, hover shadow-sm */}
        <button
          type="button"
          onClick={() => setShowOptional(!showOptional)}
          className="
            w-full bg-card border border-border rounded-[14px] overflow-hidden
            shadow-[var(--shadow-xs)]
            transition-shadow duration-[var(--motion-base)] ease-[var(--ease-out)]
            hover:shadow-[var(--shadow-sm)]
          "
        >
          <div className="p-4 flex items-center justify-between">
            <span className="text-foreground text-sm font-semibold leading-5">
              {t('additionalDetails')}
            </span>
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              className={`transition-transform duration-[var(--motion-base)] ease-[var(--ease-out)] ${
                showOptional ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="text-muted-foreground"
              />
            </svg>
          </div>
        </button>

        {/* Panel optional fields — tampil saat expanded */}
        {showOptional && (
          <div className="flex flex-col gap-4 px-1">
            {/* Field: Menu Detail */}
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>{t('menuDetail')}</label>
              <textarea
                value={menuDetail}
                onChange={(e) => setMenuDetail(e.target.value)}
                placeholder={t('menuDetailPlaceholder')}
                rows={2}
                className={`${INPUT_BASE_CLASS} ${INPUT_NORMAL_CLASS} resize-none`}
              />
            </div>

            {/* Field: Topping */}
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>{t('topping')}</label>
              <textarea
                value={topping}
                onChange={(e) => setTopping(e.target.value)}
                placeholder={t('toppingPlaceholder')}
                rows={2}
                className={`${INPUT_BASE_CLASS} ${INPUT_NORMAL_CLASS} resize-none`}
              />
            </div>

            {/* Field: Tipe Penjualan — Direct / Pre-order */}
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>{t('saleType')}</label>
              <SegmentedControl
                value={saleType}
                options={[
                  { value: 'Direct', label: t('direct') },
                  { value: 'Pre-order', label: t('preorder') },
                ]}
                onChange={(v) => {
                  setSaleType(v as 'Direct' | 'Pre-order')
                  if (v === 'Direct') setPreOrderDate('')
                }}
              />
            </div>

            {/* Field: Tanggal Pre-order — tampil hanya jika tipe = Pre-order */}
            {saleType === 'Pre-order' && (
              <div className="flex flex-col gap-1.5">
                <label className={LABEL_CLASS}>
                  {t('preorderDate')} <span className="text-[color:var(--color-danger)]">*</span>
                </label>
                <input
                  type="date"
                  value={preOrderDate}
                  onChange={(e) => {
                    setPreOrderDate(e.target.value)
                    if (errors.preOrderDate) {
                      setErrors((p) => { const n = { ...p }; delete n.preOrderDate; return n })
                    }
                  }}
                  className={`${INPUT_BASE_CLASS} ${
                    errors.preOrderDate ? INPUT_ERROR_CLASS : INPUT_NORMAL_CLASS
                  }`}
                />
                {errors.preOrderDate && (
                  <p className="text-xs text-[color:var(--color-danger)] mt-0.5">
                    {errors.preOrderDate}
                  </p>
                )}
              </div>
            )}

            {/* Field: Catatan */}
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>{t('notes')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('notesPlaceholder')}
                rows={2}
                className={`${INPUT_BASE_CLASS} ${INPUT_NORMAL_CLASS} resize-none`}
              />
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* SECTION 5: Sticky Footer — Total + Tombol Submit                 */}
      {/* Token-driven: bg-card/90 + backdrop-blur, border-t border-border */}
      {/* ================================================================ */}
      <div
        className="
          fixed bottom-0 left-0 right-0 z-40 p-4
          bg-[color:var(--color-bg-elevated)]/90 backdrop-blur-md
          border-t border-border
          md:sticky md:bottom-auto md:left-auto md:right-auto
          md:mt-4 md:p-0 md:bg-transparent md:border-0 md:backdrop-blur-none
        "
      >
        <div className="flex flex-col gap-4 max-w-[1040px] mx-auto">
          {/* Baris total pembayaran */}
          <div className="flex items-end justify-between">
            <div>
              <p className={LABEL_CLASS}>{t('totalPayment')}</p>
              <p
                className="
                  text-foreground font-semibold
                  text-[28px] leading-[1.1] tracking-[-0.02em]
                  font-mono tabular-nums mt-1
                "
              >
                {formatRupiah(totalPrice)}
              </p>
            </div>
            {totalItems > 0 && (
              <p className={`${LABEL_CLASS} text-right`}>
                {totalItems} {t('items')}
              </p>
            )}
          </div>

          {/* Tombol simpan transaksi — primary accent button */}
          <button
            type="submit"
            disabled={submitting || totalItems === 0}
            className="
              w-full py-4 rounded-[10px]
              bg-[color:var(--color-accent)] text-white
              flex justify-center items-center gap-2
              shadow-[var(--shadow-sm)]
              transition-all duration-[var(--motion-base)] ease-[var(--ease-out)]
              hover:brightness-110 hover:shadow-[var(--shadow-md)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[var(--shadow-sm)]
            "
          >
            {submitting ? (
              <span className="text-white text-base font-semibold leading-6">
                {t('saving')}
              </span>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M13.3 2.7L6 10L2.7 6.7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-white text-sm font-semibold leading-6 uppercase tracking-[0.08em]">
                  {t('saveTransaction')}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

// ===================================================================
// Komponen internal — Segmented Control (2 opsi) token-driven
// ===================================================================
function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div
      className="
        p-1 bg-[color:var(--color-bg-secondary)] border border-border
        rounded-[10px] flex
      "
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              flex-1 py-2 rounded-[8px] text-center text-xs font-semibold leading-4
              transition-all duration-[var(--motion-base)] ease-[var(--ease-out)]
              ${
                active
                  ? 'bg-[color:var(--color-bg-elevated)] text-[color:var(--color-accent)] shadow-[var(--shadow-xs)]'
                  : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ===================================================================
// Komponen internal — Toggle Switch token-driven
// ===================================================================
function ToggleSwitch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
      aria-checked={checked}
      role="switch"
      aria-label={ariaLabel}
    >
      <div
        className={`
          w-12 h-6 p-1 rounded-full flex items-center
          transition-colors duration-[var(--motion-base)] ease-[var(--ease-out)]
          ${
            checked
              ? 'bg-[color:var(--color-accent)] justify-end'
              : 'bg-[color:var(--color-border-strong)] justify-start'
          }
        `}
      >
        <div className="size-4 bg-white rounded-full shadow-[var(--shadow-xs)] transition-all duration-[var(--motion-base)] ease-[var(--ease-out)]" />
      </div>
    </button>
  )
}
