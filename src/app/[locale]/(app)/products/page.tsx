'use client'

// ============================================================
// File: src/app/[locale]/(app)/products/page.tsx
// Versi: v0.6.1
// Deskripsi: Halaman Manajemen Produk — daftar semua produk dengan
//            harga, cost/unit (dari BOM), margin, dan status aktif.
//            CRUD: tambah, edit, toggle aktif/nonaktif (soft delete).
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import { calcCostPerUnit, calcIngredientCostPerUnit, calcProfitMargin } from '@/lib/formulas'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { useToast } from '@/lib/hooks/use-toast'
import { ProductTable } from '@/components/products/ProductTable'
import { ProductModal } from '@/components/products/ProductModal'

// Tipe produk yang sudah di-enrich dengan data cost dari BOM
interface ProductWithCost extends Product {
  costPerUnit?: number
  profitMargin?: number
}

export default function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = useTranslations('products')
  const [locale, setLocale] = useState('id')
  const [products, setProducts] = useState<ProductWithCost[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { toast: addToast } = useToast()

  // Ambil locale dari params
  useEffect(() => {
    params.then(({ locale: l }) => setLocale(l))
  }, [params])

  // Fungsi utama: ambil semua produk + hitung cost dari BOM
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Ambil semua produk
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (productError) throw productError

      // Ambil semua resep/BOM dengan join ke ingredients untuk cost per unit bahan
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select(`
          product_id,
          quantity_per_batch,
          pcs_per_batch,
          ingredients (
            purchase_price,
            packaging_size
          )
        `)

      if (recipeError) throw recipeError

      // Hitung cost per unit per produk dari BOM
      const productCostMap: Record<string, number> = {}

      // Kelompokkan resep per produk
      const recipesByProduct: Record<string, typeof recipeData> = {}
      for (const item of recipeData ?? []) {
        if (!recipesByProduct[item.product_id]) {
          recipesByProduct[item.product_id] = []
        }
        recipesByProduct[item.product_id].push(item)
      }

      // Kalkulasi cost per unit untuk setiap produk menggunakan Formula 5.2 + 5.3
      for (const [productId, recipes] of Object.entries(recipesByProduct)) {
        if (!recipes || recipes.length === 0) continue

        // Ambil pcs_per_batch dari resep pertama (semua resep produk sama)
        const pcsPerBatch = recipes[0].pcs_per_batch

        // Bangun daftar RecipeItem untuk kalkulasi
        const recipeItems = recipes.map((r) => {
          const ing = r.ingredients as unknown as { purchase_price: number; packaging_size: number } | null
          const costPerUnitIng = ing
            ? calcIngredientCostPerUnit({
                purchasePrice: ing.purchase_price,
                packagingSize: ing.packaging_size,
              })
            : 0
          return {
            quantityPerBatch: r.quantity_per_batch,
            costPerUnitIngredient: costPerUnitIng,
          }
        })

        productCostMap[productId] = calcCostPerUnit({ recipeItems, pcsPerBatch })
      }

      // Gabungkan data produk dengan cost yang sudah dihitung
      const enriched: ProductWithCost[] = (productData ?? []).map((p) => {
        const cost = productCostMap[p.id]
        return {
          ...p,
          costPerUnit: cost,
          profitMargin: cost
            ? calcProfitMargin({ sellingPrice: p.selling_price, costPerUnit: cost })
            : undefined,
        }
      })

      setProducts(enriched)
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

  // Buka modal tambah produk baru
  function handleAdd() {
    setSelectedProduct(null)
    setModalOpen(true)
  }

  // Buka modal edit produk yang ada
  function handleEdit(product: ProductWithCost) {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  // Toggle aktif/nonaktif (soft delete sesuai FR-020)
  async function handleToggleActive(product: ProductWithCost) {
    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)

    if (error) {
      addToast({ title: t('toggleFailed'), variant: 'error' })
      return
    }

    addToast({ title: !product.is_active ? t('activated') : t('deactivated'), variant: 'success' })
    fetchProducts()
  }

  // Simpan produk baru atau update produk yang diedit
  async function handleSave(
    data: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'image_url'>
  ) {
    const supabase = createClient()

    if (selectedProduct) {
      // Mode edit — update data yang ada
      const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', selectedProduct.id)

      if (error) {
        addToast({ title: t('saveFailed'), variant: 'error' })
        throw error
      }
      addToast({ title: t('updated'), variant: 'success' })
    } else {
      // Mode tambah — insert baris baru
      const { error } = await supabase.from('products').insert(data)

      if (error) {
        addToast({ title: t('saveFailed'), variant: 'error' })
        throw error
      }
      addToast({ title: t('addSuccess'), variant: 'success' })
    }

    // Refresh daftar produk setelah simpan
    await fetchProducts()
  }

  // Tampilkan skeleton saat loading pertama
  if (loading) return <PageSkeleton />

  return (
    <main className="flex-1 p-4 md:p-8 max-w-[1040px] mx-auto w-full font-['Inter']">
      {/* Header halaman dengan tombol tambah — sesuai referensi HTML */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-blue-700 text-[10px] font-bold uppercase leading-4 tracking-wide mb-1">
            {t('inventoryControl')}
          </p>
          <h1 className="text-gray-800 text-3xl font-extrabold leading-9">
            {t('title')}
          </h1>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2.5 bg-blue-700 rounded-sm shadow-sm flex items-center gap-2 text-white text-sm font-semibold hover:bg-blue-800 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          {t('addProduct')}
        </button>
      </div>

      {/* Ringkasan total produk */}
      <div className="flex items-center gap-3 mb-6">
        <StatChip label={t('totalProducts')} value={products.length} />
        <StatChip label={t('active')} value={products.filter((p) => p.is_active).length} color="success" />
        <StatChip label={t('inactive')} value={products.filter((p) => !p.is_active).length} color="muted" />
      </div>

      {/* Tabel daftar produk */}
      <ProductTable
        products={products}
        locale={locale}
        onEdit={handleEdit}
        onToggleActive={handleToggleActive}
      />

      {/* Modal tambah/edit produk */}
      <ProductModal
        product={selectedProduct}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </main>
  )
}

// -------------------------------------------------------------------
// Chip statistik kecil di atas tabel — sesuai referensi HTML
// -------------------------------------------------------------------
function StatChip({
  label,
  value,
  color = 'default',
}: {
  label: string
  value: number
  color?: 'default' | 'success' | 'muted'
}) {
  const valueColorMap = {
    default: 'text-gray-800',
    success: 'text-green-600',
    muted: 'text-zinc-400',
  }

  return (
    <div className="px-4 py-2 bg-white rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-100 flex items-center gap-4 font-['Inter']">
      <div>
        <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-wide">{label}</div>
        <div className={`text-sm font-bold ${valueColorMap[color]}`}>{value}</div>
      </div>
    </div>
  )
}
