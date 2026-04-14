'use client'

// ============================================================
// File: src/app/[locale]/(app)/recipes/page.tsx
// Versi: v0.6.1
// Deskripsi: Halaman Resep/BOM — pilih produk dari daftar,
//            tampilkan editor resep dan pricing calculator.
//            Perubahan resep auto-recalculate cost dan margin.
//            Desain diselaraskan dengan HTML reference (Tailwind).
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Product, Ingredient, Recipe } from '@/types'
import { calcCostPerUnit, calcIngredientCostPerUnit, formatRupiah } from '@/lib/formulas'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { useToast } from '@/lib/hooks/use-toast'
import { RecipeEditor } from '@/components/recipes/RecipeEditor'
import { PricingCalculator } from '@/components/recipes/PricingCalculator'

// Tipe resep dengan join ingredient
interface RecipeWithIngredient extends Recipe {
  ingredient: Ingredient
}

export default function RecipesPage() {
  const t = useTranslations('recipes')
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [recipes, setRecipes] = useState<RecipeWithIngredient[]>([])
  const [loadingInit, setLoadingInit] = useState(true)
  const [loadingRecipes, setLoadingRecipes] = useState(false)
  const { toast: addToast } = useToast()

  // Produk yang sedang dipilih
  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? null

  // Hitung cost per unit produk terpilih dari resep yang diload
  const costPerUnit = (() => {
    if (!selectedProduct || recipes.length === 0) return 0
    const pcsPerBatch = recipes[0].pcs_per_batch
    return calcCostPerUnit({
      recipeItems: recipes.map((r) => ({
        quantityPerBatch: r.quantity_per_batch,
        costPerUnitIngredient: calcIngredientCostPerUnit({
          purchasePrice: r.ingredient.purchase_price,
          packagingSize: r.ingredient.packaging_size,
        }),
      })),
      pcsPerBatch,
    })
  })()

  // Load awal: ambil semua produk + semua bahan baku
  useEffect(() => {
    async function init() {
      const supabase = createClient()

      const [{ data: productData }, { data: ingredientData }] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('ingredients').select('*').order('name'),
      ])

      setProducts(productData ?? [])
      setIngredients(ingredientData ?? [])

      // Jika ada query param ?product=xxx, pre-select produk tersebut
      const preselect = searchParams.get('product')
      if (preselect && productData?.some((p) => p.id === preselect)) {
        setSelectedProductId(preselect)
      }

      setLoadingInit(false)
    }

    init().catch((err) => {
      console.error('Gagal memuat data awal resep:', err)
      addToast({ title: t('initLoadFailed'), variant: 'error' })
      setLoadingInit(false)
    })
  }, [searchParams, addToast])

  // Load resep saat produk dipilih berubah
  const fetchRecipes = useCallback(async () => {
    if (!selectedProductId) {
      setRecipes([])
      return
    }

    setLoadingRecipes(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          ingredient:ingredients (*)
        `)
        .eq('product_id', selectedProductId)
        .order('created_at')

      if (error) throw error
      setRecipes((data as RecipeWithIngredient[]) ?? [])
    } catch (err) {
      console.error('Gagal memuat resep:', err)
      addToast({ title: t('recipesLoadFailed'), variant: 'error' })
    } finally {
      setLoadingRecipes(false)
    }
  }, [selectedProductId, addToast])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  if (loadingInit) return <PageSkeleton />

  return (
    <main className="flex-1 p-4 md:p-8 max-w-[1040px] mx-auto w-full font-['Inter']">
      {/* Header halaman — sesuai referensi HTML */}
      <div className="mb-6">
        <p className="text-blue-700 text-[10px] font-bold uppercase leading-4 tracking-wide mb-1">
          {t('catalogProcurement')}
        </p>
        <h1 className="text-gray-800 text-3xl font-extrabold leading-9">
          {t('title')}
        </h1>
        <p className="text-zinc-600 text-sm mt-1">
          {t('description')}
        </p>
      </div>

      {/* Layout: pilih produk di kiri, editor di kanan */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Panel kiri: daftar produk untuk dipilih */}
        <aside className="w-full md:w-60 flex-shrink-0">
          <ProductPickerPanel
            products={products}
            selectedId={selectedProductId}
            onSelect={setSelectedProductId}
          />
        </aside>

        {/* Panel kanan: konten resep */}
        <div className="flex-1 min-w-0 space-y-5">
          {!selectedProduct ? (
            // State kosong — belum pilih produk
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100">
              <div className="w-10 h-10 rounded-full mb-4 bg-zinc-100 flex items-center justify-center">
                <span className="text-lg">📋</span>
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-1">
                {t('selectProduct')}
              </p>
              <p className="text-xs text-zinc-400 text-center">
                {t('selectProductHint')}
              </p>
            </div>
          ) : (
            <>
              {/* Header nama produk yang dipilih */}
              <div className="flex items-center justify-between px-5 py-4 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100">
                <div>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide mb-0.5">
                    {t('selectedProduct')}
                  </p>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-800">
                      {selectedProduct.name}
                    </h2>
                    {selectedProduct.is_bundling && (
                      <span className="px-1.5 py-0.5 bg-blue-700/10 rounded text-[10px] font-bold text-blue-700 uppercase">
                        Bundling
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {t('sellingPriceLabel')} <span className="font-bold text-blue-700">{formatRupiah(selectedProduct.selling_price)}</span>
                  </p>
                </div>
              </div>

              {/* Editor resep */}
              {loadingRecipes ? (
                <div className="py-8 text-center text-sm text-zinc-400">
                  {t('loadingRecipes')}
                </div>
              ) : (
                <RecipeEditor
                  product={selectedProduct}
                  recipes={recipes}
                  ingredients={ingredients}
                  onRecipeChange={fetchRecipes}
                />
              )}

              {/* Pricing Calculator — hanya tampilkan jika ada resep */}
              {recipes.length > 0 && (
                <PricingCalculator
                  costPerUnit={costPerUnit}
                  currentSellingPrice={selectedProduct.selling_price}
                />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

// -------------------------------------------------------------------
// Panel picker produk di sisi kiri
// -------------------------------------------------------------------
function ProductPickerPanel({
  products,
  selectedId,
  onSelect,
}: {
  products: Product[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  const t = useTranslations('recipes')
  const activeProducts = products.filter((p) => p.is_active)
  const inactiveProducts = products.filter((p) => !p.is_active)

  return (
    <div className="bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100 overflow-hidden font-['Inter']">
      {/* Header panel */}
      <div className="px-4 py-3 bg-neutral-50 border-b border-zinc-100">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
          {t('selectProduct')}
        </p>
      </div>

      {/* Daftar produk aktif */}
      <div>
        {activeProducts.length > 0 && (
          <>
            <div className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wide border-b border-zinc-100 bg-neutral-50/50">
              {t('activeCount', { count: activeProducts.length })}
            </div>
            {activeProducts.map((p) => (
              <ProductPickerItem
                key={p.id}
                product={p}
                selected={p.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </>
        )}

        {/* Daftar produk nonaktif */}
        {inactiveProducts.length > 0 && (
          <>
            <div className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wide border-t border-zinc-100 border-b bg-neutral-50/50">
              {t('inactiveCount', { count: inactiveProducts.length })}
            </div>
            {inactiveProducts.map((p) => (
              <ProductPickerItem
                key={p.id}
                product={p}
                selected={p.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </>
        )}

        {/* State kosong */}
        {products.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-zinc-400">
            {t('noProductsYet')}
          </div>
        )}
      </div>
    </div>
  )
}

// Item individual dalam panel picker
function ProductPickerItem({
  product,
  selected,
  onSelect,
}: {
  product: Product
  selected: boolean
  onSelect: (id: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product.id)}
      className={`w-full text-left px-4 py-3 flex items-center justify-between border-b border-zinc-100 transition-colors ${
        selected ? 'bg-blue-50' : 'hover:bg-zinc-50'
      }`}
      style={{ opacity: product.is_active ? 1 : 0.5 }}
    >
      <div className="min-w-0">
        <p className={`text-sm font-medium truncate ${selected ? 'text-blue-700' : 'text-gray-800'}`}>
          {product.name}
        </p>
        <p className="text-[10px] mt-0.5 text-zinc-500">
          {product.is_bundling
            ? `Bundling • Rp ${product.selling_price.toLocaleString('id-ID')}`
            : `Rp ${product.selling_price.toLocaleString('id-ID')}`
          }
        </p>
      </div>
      {/* Indikator item dipilih */}
      {selected && (
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-blue-700" />
      )}
    </button>
  )
}
