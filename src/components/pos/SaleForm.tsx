'use client'

// ============================================================
// File: src/components/pos/SaleForm.tsx
// Versi: v0.7.0
// Deskripsi: Form penjualan lengkap untuk POS Parissa.
//            Required fields: nama pembeli, tanggal, produk (via grid),
//            jumlah, bundling toggle, status bayar.
//            Optional fields: menu detail, topping, tipe penjualan,
//            tanggal pre-order, catatan.
//            Auto-calculate harga real-time (Formula 5.1).
//            Desain diselaraskan dengan HTML reference (Mobile.html).
// ============================================================

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Product } from '@/types'
import { calcSalePrice, formatRupiah } from '@/lib/formulas'
import { QuickSaleGrid, CartItems } from './QuickSaleGrid'

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

  // Reset form setelah berhasil submit (dipanggil dari parent)
  function resetForm() {
    setCustomerName('')
    setDate(new Date().toISOString().split('T')[0])
    setPaymentStatus('Sudah')
    setIsBundling(false)
    setCart({})
    setMenuDetail('')
    setTopping('')
    setSaleType('Direct')
    setPreOrderDate('')
    setNotes('')
    setShowOptional(false)
    setErrors({})
  }

  // Expose resetForm via ref pattern — gunakan key reset di parent
  // Parent bisa panggil reset dengan mengubah key komponen

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 pb-44 font-['Inter']"
    >
      {/* ================================================================ */}
      {/* SECTION 1: Required Fields — Nama Pembeli, Tanggal, Status Bayar */}
      {/* ================================================================ */}
      <div className="flex flex-col gap-4">
        {/* Field: Nama Pembeli */}
        <div className="flex flex-col gap-1">
          <label className="text-zinc-600 text-[10px] font-medium uppercase leading-4 tracking-wide">
            {t('customerName')} <span className="text-red-500">*</span>
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
            className={`w-full px-4 py-3.5 bg-white rounded-sm outline outline-1 outline-offset-[-1px] text-base font-normal text-gray-800 placeholder:text-gray-500 focus:outline-blue-700/40 transition-colors ${
              errors.customerName ? 'outline-red-400' : 'outline-zinc-400/20'
            }`}
          />
          {errors.customerName && (
            <p className="text-xs text-red-500">{errors.customerName}</p>
          )}
        </div>

        {/* Row: Tanggal + Status Bayar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
          {/* Field: Tanggal */}
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-zinc-600 text-[10px] font-medium uppercase leading-4 tracking-wide">
              {t('date')} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-4 py-3 bg-white rounded-sm outline outline-1 outline-offset-[-1px] text-base font-normal text-gray-800 focus:outline-blue-700/40 transition-colors ${
                errors.date ? 'outline-red-400' : 'outline-zinc-400/20'
              }`}
            />
            {errors.date && (
              <p className="text-xs text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Field: Status Bayar — segmented control sesuai HTML ref */}
          <div className="flex-1 flex flex-col gap-1 pb-2">
            <label className="text-zinc-600 text-[10px] font-medium uppercase leading-4 tracking-wide">
              {t('paymentStatus')} <span className="text-red-500">*</span>
            </label>
            <div className="p-1 bg-zinc-100 rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-400/10 flex">
              <button
                type="button"
                onClick={() => setPaymentStatus('Sudah')}
                className={`flex-1 py-2 rounded-xs text-center text-xs font-bold leading-4 transition-all ${
                  paymentStatus === 'Sudah'
                    ? 'bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-blue-700'
                    : 'text-zinc-600 hover:text-gray-800'
                }`}
              >
                {t('paid')}
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus('Belum')}
                className={`flex-1 py-2 rounded-xs text-center text-xs font-bold leading-4 transition-all ${
                  paymentStatus === 'Belum'
                    ? 'bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-blue-700'
                    : 'text-zinc-600 hover:text-gray-800'
                }`}
              >
                {t('unpaid')}
              </button>
            </div>
          </div>
        </div>

        {/* Toggle: Bundling Promo — sesuai HTML reference */}
        <div className="p-4 bg-zinc-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-400/10 flex items-center justify-between">
          <div>
            <p className="text-gray-800 text-sm font-bold leading-5">
              {t('bundlingPromo')}
            </p>
            <p className="text-zinc-600 text-xs font-normal leading-4">
              {t('bundlingDescription')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsBundling(!isBundling)}
            className="relative flex-shrink-0"
            aria-checked={isBundling}
            role="switch"
            aria-label="Toggle bundling"
          >
            <div
              className={`w-12 h-6 p-1 rounded-xl flex items-center transition-colors ${
                isBundling ? 'bg-blue-700 justify-end' : 'bg-zinc-400/30 justify-start'
              }`}
            >
              <div className="size-4 bg-white rounded-xl transition-all" />
            </div>
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SECTION 2: Product Grid (Quick Sale) */}
      {/* ================================================================ */}
      {errors.cart && (
        <div className="px-4 py-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs font-semibold text-red-600">{errors.cart}</p>
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
        <div className="bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-400/20 overflow-hidden">
          <div className="px-4 py-3 bg-neutral-50 border-b border-zinc-100">
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-wide">
              {t('orderSummary')} — {totalItems} {t('items')}
            </p>
          </div>
          <div className="divide-y divide-zinc-100">
            {cartSummary.map(({ product, qty, price }) => (
              <div
                key={product.id}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {qty} × {formatRupiah(
                      isBundling && product.bundling_price
                        ? product.bundling_price
                        : product.selling_price
                    )}
                  </p>
                </div>
                <p className="text-sm font-bold text-blue-700 ml-3">
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
        {/* Accordion toggles — sesuai HTML reference */}
        <button
          type="button"
          onClick={() => setShowOptional(!showOptional)}
          className="w-full bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-400/20 overflow-hidden"
        >
          <div className="p-4 flex items-center justify-between">
            <span className="text-gray-800 text-sm font-bold leading-5">
              {t('additionalDetails')}
            </span>
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              className={`transition-transform ${showOptional ? 'rotate-180' : ''}`}
            >
              <path d="M1 1L6 6L11 1" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </button>

        {/* Panel optional fields — tampil saat expanded */}
        {showOptional && (
          <div className="flex flex-col gap-4 px-1">
            {/* Field: Menu Detail */}
            <div className="flex flex-col gap-1">
              <label className="text-zinc-600 text-[10px] font-medium uppercase leading-4 tracking-wide">
                {t('menuDetail')}
              </label>
              <textarea
                value={menuDetail}
                onChange={(e) => setMenuDetail(e.target.value)}
                placeholder={t('menuDetailPlaceholder')}
                rows={2}
                className="w-full px-4 py-3 bg-white rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-400/20 text-sm font-normal text-gray-800 placeholder:text-gray-500 focus:outline-blue-700/40 transition-colors resize-none"
              />
            </div>

            {/* Field: Topping */}
            <div className="flex flex-col gap-1">
              <label className="text-zinc-600 text-[10px] font-medium uppercase leading-4 tracking-wide">
                {t('topping')}
              </label>
              <textarea
                value={topping}
                onChange={(e) => setTopping(e.target.value)}
                placeholder={t('toppingPlaceholder')}
                rows={2}
                className="w-full px-4 py-3 bg-white rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-400/20 text-sm font-normal text-gray-800 placeholder:text-gray-500 focus:outline-blue-700/40 transition-colors resize-none"
              />
            </div>

            {/* Field: Tipe Penjualan — Direct / Pre-order */}
            <div className="flex flex-col gap-1">
              <label className="text-zinc-600 text-[10px] font-medium uppercase leading-4 tracking-wide">
                {t('saleType')}
              </label>
              <div className="p-1 bg-zinc-100 rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-400/10 flex">
                <button
                  type="button"
                  onClick={() => {
                    setSaleType('Direct')
                    setPreOrderDate('')
                  }}
                  className={`flex-1 py-2 rounded-xs text-center text-xs font-bold leading-4 transition-all ${
                    saleType === 'Direct'
                      ? 'bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-blue-700'
                      : 'text-zinc-600 hover:text-gray-800'
                  }`}
                >
                  {t('direct')}
                </button>
                <button
                  type="button"
                  onClick={() => setSaleType('Pre-order')}
                  className={`flex-1 py-2 rounded-xs text-center text-xs font-bold leading-4 transition-all ${
                    saleType === 'Pre-order'
                      ? 'bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-blue-700'
                      : 'text-zinc-600 hover:text-gray-800'
                  }`}
                >
                  {t('preorder')}
                </button>
              </div>
            </div>

            {/* Field: Tanggal Pre-order — tampil hanya jika tipe = Pre-order */}
            {saleType === 'Pre-order' && (
              <div className="flex flex-col gap-1">
                <label className="text-zinc-600 text-[10px] font-medium uppercase leading-4 tracking-wide">
                  {t('preorderDate')} <span className="text-red-500">*</span>
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
                  className={`w-full px-4 py-3 bg-white rounded-sm outline outline-1 outline-offset-[-1px] text-sm font-normal text-gray-800 focus:outline-blue-700/40 transition-colors ${
                    errors.preOrderDate ? 'outline-red-400' : 'outline-zinc-400/20'
                  }`}
                />
                {errors.preOrderDate && (
                  <p className="text-xs text-red-500">{errors.preOrderDate}</p>
                )}
              </div>
            )}

            {/* Field: Catatan */}
            <div className="flex flex-col gap-1">
              <label className="text-zinc-600 text-[10px] font-medium uppercase leading-4 tracking-wide">
                {t('notes')}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('notesPlaceholder')}
                rows={2}
                className="w-full px-4 py-3 bg-white rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-400/20 text-sm font-normal text-gray-800 placeholder:text-gray-500 focus:outline-blue-700/40 transition-colors resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* SECTION 5: Sticky Footer — Total + Tombol Submit */}
      {/* ================================================================ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-slate-50/90 border-t border-slate-200/20 backdrop-blur-md md:sticky md:bottom-auto md:left-auto md:right-auto md:mt-4 md:p-0 md:bg-transparent md:border-0 md:backdrop-blur-none">
        <div className="flex flex-col gap-4 max-w-[1040px] mx-auto">
          {/* Baris total pembayaran */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-zinc-600 text-[10px] font-medium uppercase leading-4 tracking-wide">
                {t('totalPayment')}
              </p>
              <p className="text-slate-900 text-2xl font-extrabold leading-8">
                {formatRupiah(totalPrice)}
              </p>
            </div>
            {totalItems > 0 && (
              <p className="text-zinc-600 text-[10px] font-medium uppercase leading-4 tracking-wide text-right">
                {totalItems} {t('items')}
              </p>
            )}
          </div>

          {/* Tombol simpan transaksi */}
          <button
            type="submit"
            disabled={submitting || totalItems === 0}
            className="w-full py-4 bg-blue-700 rounded-lg flex justify-center items-center gap-2 shadow-[0px_4px_6px_-4px_rgba(0,83,219,0.20),0px_10px_15px_-3px_rgba(0,83,219,0.20)] hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="text-white text-base font-bold leading-6">
                {t('saving')}
              </span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3 2.7L6 10L2.7 6.7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-white text-base font-bold leading-6 uppercase">
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
