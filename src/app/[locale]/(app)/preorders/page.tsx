'use client'

// ============================================================
// File: src/app/[locale]/(app)/preorders/page.tsx
// Versi: v0.7.0
// Deskripsi: Halaman manajemen Pre-order — daftar pre-order dengan
//            filter status (Pending/Confirmed/Delivered/Cancelled).
//            Mark as Delivered → otomatis update payment_status = "Sudah"
//            sehingga tercatat di laporan penjualan (FR-059).
//            DB trigger trg_calculate_profit recalculate profit saat update.
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Sale, Product } from '@/types'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { useToast } from '@/lib/hooks/use-toast'
import { PreorderList } from '@/components/preorders/PreorderList'

// Tipe sale yang sudah join ke product
interface SaleWithProduct extends Sale {
  product: Product
}

export default function PreordersPage() {
  const t = useTranslations('preorders')
  const [preorders, setPreorders] = useState<SaleWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { toast: addToast } = useToast()

  // Ambil semua pre-order dari Supabase (sale_type = 'Pre-order')
  const fetchPreorders = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          product:products (*)
        `)
        .eq('sale_type', 'Pre-order')
        .order('pre_order_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      // Cast hasil join Supabase — gunakan as unknown as (catatan teknis project)
      const typedData = (data ?? []).map((item) => ({
        ...item,
        product: item.product as unknown as Product,
      })) as SaleWithProduct[]

      setPreorders(typedData)
    } catch (err) {
      console.error('Gagal memuat pre-order:', err)
      addToast({ title: t('loadFailed'), variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchPreorders()
  }, [fetchPreorders])

  // -------------------------------------------------------------------
  // Handle perubahan status pre-order.
  // Jika status baru = "Delivered":
  //   - Update pre_order_status = "Delivered"
  //   - Update payment_status = "Sudah" (FR-059: tercatat di laporan)
  //   - DB trigger trg_calculate_profit recalculate profit otomatis
  // -------------------------------------------------------------------
  async function handleStatusChange(saleId: string, newStatus: string) {
    setUpdatingId(saleId)
    const supabase = createClient()

    try {
      // Siapkan payload update
      const updatePayload: Record<string, string> = {
        pre_order_status: newStatus,
      }

      // Jika Delivered → set payment_status ke "Sudah" (auto-record ke sales report)
      if (newStatus === 'Delivered') {
        updatePayload.payment_status = 'Sudah'
      }

      const { error } = await supabase
        .from('sales')
        .update(updatePayload)
        .eq('id', saleId)

      if (error) throw error

      // Cari nama pembeli untuk toast
      const preorder = preorders.find((po) => po.id === saleId)
      const customerName = preorder?.customer_name || 'Pre-order'

      // Toast sesuai status
      const statusMessages: Record<string, string> = {
        Confirmed: t('statusConfirmed'),
        Delivered: t('statusDelivered'),
        Cancelled: t('statusCancelled'),
      }

      addToast({
        title: statusMessages[newStatus] || `Status diperbarui ke ${newStatus}.`,
        variant: newStatus === 'Cancelled' ? 'warning' : 'success',
      })

      // Refresh daftar
      await fetchPreorders()
    } catch (err) {
      console.error('Gagal mengubah status pre-order:', err)
      addToast({ title: t('statusChangeFailed'), variant: 'error' })
    } finally {
      setUpdatingId(null)
    }
  }

  // Hitung statistik untuk header
  const totalPreorders = preorders.length
  const pendingCount = preorders.filter((po) => po.pre_order_status === 'Pending').length
  const confirmedCount = preorders.filter((po) => po.pre_order_status === 'Confirmed').length

  // Tampilkan skeleton saat loading
  if (loading) return <PageSkeleton />

  return (
    <main className="flex-1 p-4 md:p-8 max-w-[1040px] mx-auto w-full font-['Inter']">
      {/* Header halaman — sesuai HTML reference */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-zinc-600 text-xs font-normal uppercase leading-4 tracking-wide mb-1">
            {t('management')}
          </p>
          <h1 className="text-gray-800 text-2xl md:text-3xl font-bold leading-8">
            {t('title')}
          </h1>
        </div>

        {/* Info ringkasan */}
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="px-3 py-1.5 bg-amber-50 rounded-md flex items-center gap-2">
              <span className="size-2 bg-amber-500 rounded-full" />
              <span className="text-amber-700 text-xs font-bold">
                {pendingCount} {t('pending')}
              </span>
            </div>
          )}
          {confirmedCount > 0 && (
            <div className="px-3 py-1.5 bg-blue-50 rounded-md flex items-center gap-2">
              <span className="size-2 bg-blue-500 rounded-full" />
              <span className="text-blue-700 text-xs font-bold">
                {confirmedCount} {t('confirmed')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Daftar pre-order dengan filter */}
      <PreorderList
        preorders={preorders}
        updatingId={updatingId}
        onStatusChange={handleStatusChange}
      />
    </main>
  )
}
