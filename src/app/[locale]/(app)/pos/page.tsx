'use client'

// ============================================================
// File: src/app/[locale]/(app)/pos/page.tsx
// Versi: v0.8.0
// Deskripsi: Halaman POS — Input Penjualan cepat (Quick Sale).
//            Fetch produk aktif dari Supabase, render SaleForm,
//            submit multi-produk ke tabel sales.
//            DB triggers otomatis: profit calc (5.4), stock deduction,
//            customer upsert.
//            Target: < 30 detik per transaksi (US-011).
//            v0.8.0 — Redesign Fase 2 #2 (Zentra): pakai <PageHeader>,
//            chip-pill count, buang ikon SVG biru legacy.
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import { calcSalePrice, formatRupiah } from '@/lib/formulas'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { useToast } from '@/lib/hooks/use-toast'
import { SaleForm, SaleSubmitData } from '@/components/pos/SaleForm'
import { PageHeader } from '@/components/shared/PageHeader'

export default function PosPage() {
  const t = useTranslations('pos')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  // Key untuk reset SaleForm setelah submit berhasil
  const [formKey, setFormKey] = useState(0)
  const { toast: addToast } = useToast()

  // Ambil semua produk aktif dari Supabase
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setProducts(data ?? [])
    } catch (err) {
      console.error('Gagal memuat produk:', err)
      addToast({ title: t('loadFailed'), variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // -------------------------------------------------------------------
  // Handle submit penjualan — buat satu row per produk di keranjang.
  // DB triggers menangani: profit calculation, stock deduction, customer upsert.
  // -------------------------------------------------------------------
  async function handleSubmit(data: SaleSubmitData) {
    setSubmitting(true)
    const supabase = createClient()

    try {
      // Ambil current user untuk created_by
      const { data: { user } } = await supabase.auth.getUser()

      // Bangun array sale rows — satu per produk yang ada di keranjang
      const saleRows = Object.entries(data.cart)
        .filter(([, qty]) => qty > 0)
        .map(([productId, qty]) => {
          // Cari produk untuk hitung harga (Formula 5.1)
          const product = products.find((p) => p.id === productId)
          if (!product) return null

          const salePrice = calcSalePrice({
            sellingPrice: product.selling_price,
            bundlingPrice: product.bundling_price,
            isBundling: data.isBundling,
            amount: qty,
          })

          return {
            date: data.date,
            customer_name: data.customerName,
            product_id: productId,
            amount: qty,
            is_bundling: data.isBundling,
            menu_detail: data.menuDetail || null,
            topping: data.topping || null,
            sale_price: salePrice,
            payment_status: data.paymentStatus,
            sale_type: data.saleType,
            pre_order_date: data.preOrderDate || null,
            pre_order_status: data.saleType === 'Pre-order' ? 'Pending' : null,
            notes: data.notes || null,
            created_by: user?.id || null,
          }
        })
        .filter(Boolean)

      // Validasi ada data untuk disimpan
      if (saleRows.length === 0) {
        addToast({ title: t('noProductsToSave'), variant: 'error' })
        setSubmitting(false)
        return
      }

      // Insert semua sale rows sekaligus
      const { error } = await supabase
        .from('sales')
        .insert(saleRows)

      if (error) throw error

      // Hitung total untuk toast summary
      const totalPrice = saleRows.reduce((sum, row) => sum + (row?.sale_price ?? 0), 0)
      const totalItems = saleRows.reduce((sum, row) => sum + (row?.amount ?? 0), 0)

      // Bangun ringkasan produk untuk toast
      const productNames = saleRows
        .map((row) => {
          const p = products.find((prod) => prod.id === row?.product_id)
          return p ? `${p.name} ×${row?.amount}` : null
        })
        .filter(Boolean)
        .join(', ')

      // Toast sukses dengan detail ringkasan (Task 9.6)
      addToast({
        title: t('saleSuccess'),
        description: `${data.customerName} — ${productNames} = ${formatRupiah(totalPrice)} (${data.paymentStatus})`,
        variant: 'success',
      })

      // Reset form dengan mengganti key (remount komponen)
      setFormKey((prev) => prev + 1)

    } catch (err) {
      console.error('Gagal menyimpan penjualan:', err)
      addToast({
        title: t('saleFailed'),
        description: t('saleFailedDescription'),
        variant: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Tampilkan skeleton saat loading pertama
  if (loading) return <PageSkeleton />

  return (
    <main className="flex-1 p-4 md:p-8 max-w-[1040px] mx-auto w-full">
      {/* Header — PageHeader shared (monokrom, adaptif dark) + chip-pill count */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <PageHeader
            kicker={t('kicker')}
            title={t('quickSale')}
            subtitle={t('subtitle')}
          />
        </div>

        {/* Info jumlah produk — chip-pill */}
        <div className="mt-1 shrink-0 px-3 py-1.5 bg-[color:var(--color-bg-secondary)] border border-border rounded-full flex items-center">
          <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.12em]">
            {t('productCount', { count: products.length })}
          </span>
        </div>
      </div>

      {/* Form penjualan — key berubah setiap submit berhasil untuk reset */}
      <SaleForm
        key={formKey}
        products={products}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </main>
  )
}
