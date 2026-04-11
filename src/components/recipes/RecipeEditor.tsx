'use client'

// ============================================================
// File: src/components/recipes/RecipeEditor.tsx
// Versi: v0.6.1
// Deskripsi: Komponen editor resep per produk — tampilkan daftar bahan,
//            qty per batch, cost per bahan, total cost.
//            CRUD: tambah, edit, hapus item resep (Formula 5.2 + 5.3)
//            Desain diselaraskan dengan HTML reference (Tailwind).
// ============================================================

import { useState } from 'react'
import { Recipe, Ingredient, Product } from '@/types'
import {
  calcIngredientCostPerUnit,
  calcCostPerUnit,
  calcProfitMargin,
  formatRupiah,
  formatMargin,
} from '@/lib/formulas'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/hooks/use-toast'

// Tipe resep yang sudah join ke ingredient
interface RecipeWithIngredient extends Recipe {
  ingredient: Ingredient
}

interface RecipeEditorProps {
  product: Product
  recipes: RecipeWithIngredient[]
  ingredients: Ingredient[]  // semua bahan baku untuk dropdown
  onRecipeChange: () => void // callback setelah simpan/hapus
}

// Form data untuk tambah/edit item resep
interface RecipeItemForm {
  ingredient_id: string
  quantity_per_batch: string
  pcs_per_batch: string
}

const EMPTY_FORM: RecipeItemForm = {
  ingredient_id: '',
  quantity_per_batch: '',
  pcs_per_batch: '',
}

export function RecipeEditor({ product, recipes, ingredients, onRecipeChange }: RecipeEditorProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<RecipeWithIngredient | null>(null)
  const [form, setForm] = useState<RecipeItemForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof RecipeItemForm, string>>>({})
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast: addToast } = useToast()

  // Hitung cost per unit bahan baku (Formula 5.3)
  function getIngredientCostPerUnit(ing: Ingredient): number {
    return calcIngredientCostPerUnit({
      purchasePrice: ing.purchase_price,
      packagingSize: ing.packaging_size,
    })
  }

  // Ambil pcs_per_batch dari resep pertama (seragam per produk)
  const pcsPerBatch = recipes.length > 0 ? recipes[0].pcs_per_batch : 0

  // Bangun daftar RecipeItem untuk kalkulasi cost per unit (Formula 5.2)
  const recipeItemsForCalc = recipes.map((r) => ({
    quantityPerBatch: r.quantity_per_batch,
    costPerUnitIngredient: getIngredientCostPerUnit(r.ingredient),
  }))

  // Hitung cost per unit produk
  const costPerUnit = pcsPerBatch > 0
    ? calcCostPerUnit({ recipeItems: recipeItemsForCalc, pcsPerBatch })
    : 0

  // Hitung margin saat ini (Formula 5.5)
  const currentMargin = costPerUnit > 0
    ? calcProfitMargin({ sellingPrice: product.selling_price, costPerUnit })
    : null

  // Total cost keseluruhan batch
  const totalBatchCost = recipeItemsForCalc.reduce(
    (sum, r) => sum + r.quantityPerBatch * r.costPerUnitIngredient,
    0
  )

  // Buka modal tambah item baru
  function handleAddItem() {
    setEditingRecipe(null)
    setForm({
      ...EMPTY_FORM,
      pcs_per_batch: pcsPerBatch > 0 ? String(pcsPerBatch) : '',
    })
    setErrors({})
    setModalOpen(true)
  }

  // Buka modal edit item yang ada
  function handleEditItem(recipe: RecipeWithIngredient) {
    setEditingRecipe(recipe)
    setForm({
      ingredient_id: recipe.ingredient_id,
      quantity_per_batch: String(recipe.quantity_per_batch),
      pcs_per_batch: String(recipe.pcs_per_batch),
    })
    setErrors({})
    setModalOpen(true)
  }

  // Hapus item resep
  async function handleDeleteItem(recipe: RecipeWithIngredient) {
    if (!confirm(`Hapus ${recipe.ingredient.name} dari resep ini?`)) return

    setDeletingId(recipe.id)
    const supabase = createClient()
    const { error } = await supabase.from('recipes').delete().eq('id', recipe.id)

    if (error) {
      addToast({ title: 'Gagal menghapus bahan dari resep.', variant: 'error' })
    } else {
      addToast({ title: 'Bahan berhasil dihapus dari resep.', variant: 'success' })
      onRecipeChange()
    }
    setDeletingId(null)
  }

  // Validasi form
  function validate(): boolean {
    const newErrors: Partial<Record<keyof RecipeItemForm, string>> = {}

    if (!form.ingredient_id) newErrors.ingredient_id = 'Pilih bahan baku'

    const qty = parseFloat(form.quantity_per_batch)
    if (!form.quantity_per_batch || isNaN(qty) || qty <= 0) {
      newErrors.quantity_per_batch = 'Qty harus lebih dari 0'
    }

    const pcs = parseFloat(form.pcs_per_batch)
    if (!form.pcs_per_batch || isNaN(pcs) || pcs <= 0) {
      newErrors.pcs_per_batch = 'Pcs per batch harus lebih dari 0'
    }

    // Cek duplikasi bahan (kecuali saat edit item yang sama)
    const isDuplicate = recipes.some(
      (r) => r.ingredient_id === form.ingredient_id && r.id !== editingRecipe?.id
    )
    if (isDuplicate) newErrors.ingredient_id = 'Bahan ini sudah ada di resep'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Simpan item resep (insert atau update)
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    const supabase = createClient()
    const payload = {
      product_id: product.id,
      ingredient_id: form.ingredient_id,
      quantity_per_batch: parseFloat(form.quantity_per_batch),
      pcs_per_batch: parseFloat(form.pcs_per_batch),
    }

    try {
      if (editingRecipe) {
        const { error } = await supabase
          .from('recipes')
          .update(payload)
          .eq('id', editingRecipe.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('recipes').insert(payload)
        if (error) throw error
      }

      addToast({ title: 'Resep berhasil disimpan!', variant: 'success' })
      setModalOpen(false)
      onRecipeChange()
    } catch (err) {
      console.error(err)
      addToast({ title: 'Gagal menyimpan resep.', variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 font-['Inter']">
      {/* --- Ringkasan Biaya (Cost Summary) --- */}
      <CostSummaryCard
        costPerUnit={costPerUnit}
        totalBatchCost={totalBatchCost}
        pcsPerBatch={pcsPerBatch}
        sellingPrice={product.selling_price}
        currentMargin={currentMargin}
      />

      {/* --- Header tabel bahan dengan tombol tambah --- */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
          Komposisi Bahan
          <span className="ml-2 px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-bold text-zinc-600 normal-case tracking-normal">
            {recipes.length} bahan
          </span>
        </h3>
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-blue-700 rounded-sm text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-800 transition-colors shadow-sm"
        >
          <span className="text-sm leading-none">+</span>
          Tambah Bahan
        </button>
      </div>

      {/* --- Tabel bahan baku resep --- */}
      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100">
          <p className="text-sm text-zinc-400">
            Produk ini belum memiliki resep. Tambahkan bahan pertama.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100 overflow-hidden">
          <table className="w-full min-w-[560px] text-sm">
            {/* Header tabel */}
            <thead>
              <tr className="bg-neutral-50 border-b border-zinc-100">
                <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
                  Bahan Baku
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
                  Qty/Batch
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
                  Satuan
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
                  Cost/Unit Bahan
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
                  Total Cost Bahan
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => {
                const costPerUnitIng = getIngredientCostPerUnit(recipe.ingredient)
                const totalCostBahan = recipe.quantity_per_batch * costPerUnitIng
                const isDeleting = deletingId === recipe.id

                return (
                  <tr
                    key={recipe.id}
                    className="border-t border-zinc-100 hover:bg-zinc-50 transition-colors"
                    style={{ opacity: isDeleting ? 0.4 : 1 }}
                  >
                    {/* Nama bahan */}
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {recipe.ingredient.name}
                    </td>
                    {/* Qty per batch */}
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-800">
                      {recipe.quantity_per_batch.toLocaleString('id-ID')}
                    </td>
                    {/* Satuan */}
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {recipe.ingredient.purchase_unit}
                    </td>
                    {/* Cost per unit bahan */}
                    <td className="px-6 py-4 text-right text-sm font-medium text-zinc-600">
                      {formatRupiah(costPerUnitIng)}
                    </td>
                    {/* Total cost bahan untuk batch ini */}
                    <td className="px-6 py-4 text-right text-sm font-bold text-blue-700">
                      {formatRupiah(totalCostBahan)}
                    </td>
                    {/* Tombol aksi */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditItem(recipe)}
                          className="px-2.5 py-1 rounded-sm text-xs font-medium text-zinc-600 outline outline-1 outline-offset-[-1px] outline-zinc-200 hover:bg-zinc-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(recipe)}
                          disabled={isDeleting}
                          className="px-2.5 py-1 rounded-sm text-xs font-medium text-red-600 outline outline-1 outline-offset-[-1px] outline-zinc-200 hover:bg-red-50 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {/* Footer tabel: total cost batch */}
            <tfoot>
              <tr className="border-t-2 border-zinc-200 bg-neutral-50/50">
                <td colSpan={4} className="px-6 py-4 text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
                  Total Cost Batch ({pcsPerBatch} pcs)
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-gray-800">
                  {formatRupiah(totalBatchCost)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* --- Modal tambah/edit item resep --- */}
      {modalOpen && (
        <RecipeItemModal
          form={form}
          errors={errors}
          saving={saving}
          isEdit={!!editingRecipe}
          ingredients={ingredients}
          existingIngredientIds={recipes
            .filter((r) => r.id !== editingRecipe?.id)
            .map((r) => r.ingredient_id)}
          onChange={(field, value) => setForm((p) => ({ ...p, [field]: value }))}
          onSubmit={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

// -------------------------------------------------------------------
// Kartu ringkasan biaya — grid 4 metrik di atas tabel
// -------------------------------------------------------------------
function CostSummaryCard({
  costPerUnit,
  totalBatchCost,
  pcsPerBatch,
  sellingPrice,
  currentMargin,
}: {
  costPerUnit: number
  totalBatchCost: number
  pcsPerBatch: number
  sellingPrice: number
  currentMargin: number | null
}) {
  // Warna margin: ≥100% emerald, <100% amber, null zinc
  const marginColorClass = currentMargin == null
    ? 'text-zinc-400'
    : currentMargin >= 100
    ? 'text-emerald-600'
    : 'text-amber-600'

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Total biaya batch */}
      <div className="bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100 px-5 pt-4 pb-5">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide mb-2">
          Total Cost Batch
        </p>
        <p className="text-xl font-bold text-gray-800">
          {formatRupiah(totalBatchCost)}
        </p>
      </div>
      {/* Pcs per batch */}
      <div className="bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100 px-5 pt-4 pb-5">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide mb-2">
          Pcs per Batch
        </p>
        <p className="text-xl font-bold text-gray-800">
          {pcsPerBatch > 0 ? pcsPerBatch : '—'}
        </p>
      </div>
      {/* Cost per unit */}
      <div className="bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100 px-5 pt-4 pb-5">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide mb-2">
          Cost/Unit
        </p>
        <p className="text-xl font-bold text-blue-700">
          {costPerUnit > 0 ? formatRupiah(costPerUnit) : '—'}
        </p>
      </div>
      {/* Margin saat ini */}
      <div className="bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100 px-5 pt-4 pb-5">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide mb-2">
          Margin Saat Ini
        </p>
        <p className={`text-xl font-bold ${marginColorClass}`}>
          {currentMargin != null ? formatMargin(currentMargin) : '—'}
        </p>
      </div>
    </div>
  )
}

// -------------------------------------------------------------------
// Modal form tambah/edit item resep
// -------------------------------------------------------------------
function RecipeItemModal({
  form,
  errors,
  saving,
  isEdit,
  ingredients,
  existingIngredientIds,
  onChange,
  onSubmit,
  onClose,
}: {
  form: RecipeItemForm
  errors: Partial<Record<keyof RecipeItemForm, string>>
  saving: boolean
  isEdit: boolean
  ingredients: Ingredient[]
  existingIngredientIds: string[]
  onChange: (field: keyof RecipeItemForm, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}) {
  // Preview kalkulasi cost saat input berubah
  const selectedIngredient = ingredients.find((i) => i.id === form.ingredient_id)
  const costPreview = selectedIngredient && form.quantity_per_batch
    ? calcIngredientCostPerUnit({
        purchasePrice: selectedIngredient.purchase_price,
        packagingSize: selectedIngredient.packaging_size,
      }) * parseFloat(form.quantity_per_batch || '0')
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-800/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden font-['Inter']">
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-100 flex items-start justify-between">
          <div>
            <p className="text-blue-700 text-[10px] font-bold uppercase tracking-wide leading-4">
              RESEP / BOM
            </p>
            <h2 className="text-zinc-900 text-xl font-extrabold leading-7 mt-0.5">
              {isEdit ? 'Edit Bahan Resep' : 'Tambah Bahan ke Resep'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-colors text-lg leading-none mt-0.5"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="px-8 py-6 flex flex-col gap-5">
          {/* Dropdown bahan baku */}
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-600 text-[10px] font-normal uppercase leading-4 tracking-wide">
              Bahan Baku <span className="text-red-500">*</span>
            </label>
            <select
              value={form.ingredient_id}
              onChange={(e) => onChange('ingredient_id', e.target.value)}
              className={`w-full bg-zinc-100 rounded-sm px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-700/20 ${
                errors.ingredient_id ? 'ring-2 ring-red-400' : ''
              }`}
            >
              <option value="">— Pilih bahan baku —</option>
              {ingredients
                .filter((i) => !existingIngredientIds.includes(i.id) || i.id === form.ingredient_id)
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.purchase_unit})
                  </option>
                ))}
            </select>
            {errors.ingredient_id && (
              <p className="text-xs text-red-500">{errors.ingredient_id}</p>
            )}
            {/* Info harga bahan yang dipilih */}
            {selectedIngredient && (
              <p className="text-xs text-zinc-500">
                Harga beli: {formatRupiah(selectedIngredient.purchase_price)} / {selectedIngredient.packaging_size} {selectedIngredient.purchase_unit}
                {' → '}{formatRupiah(calcIngredientCostPerUnit({
                  purchasePrice: selectedIngredient.purchase_price,
                  packagingSize: selectedIngredient.packaging_size,
                }))} per {selectedIngredient.purchase_unit}
              </p>
            )}
          </div>

          {/* Qty per batch */}
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-600 text-[10px] font-normal uppercase leading-4 tracking-wide">
              Qty per Batch <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.quantity_per_batch}
              onChange={(e) => onChange('quantity_per_batch', e.target.value)}
              placeholder="cth. 500"
              min="0"
              step="0.01"
              className={`w-full bg-zinc-100 rounded-sm px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-700/20 ${
                errors.quantity_per_batch ? 'ring-2 ring-red-400' : ''
              }`}
            />
            {errors.quantity_per_batch && (
              <p className="text-xs text-red-500">{errors.quantity_per_batch}</p>
            )}
            {/* Preview total cost bahan ini */}
            {costPreview != null && costPreview > 0 && (
              <p className="text-xs text-blue-700 font-semibold">
                Total cost bahan ini: {formatRupiah(costPreview)}
              </p>
            )}
          </div>

          {/* Pcs per batch */}
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-600 text-[10px] font-normal uppercase leading-4 tracking-wide">
              Pcs per Batch <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.pcs_per_batch}
              onChange={(e) => onChange('pcs_per_batch', e.target.value)}
              placeholder="cth. 10"
              min="1"
              className={`w-full bg-zinc-100 rounded-sm px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-700/20 ${
                errors.pcs_per_batch ? 'ring-2 ring-red-400' : ''
              }`}
            />
            {errors.pcs_per_batch && (
              <p className="text-xs text-red-500">{errors.pcs_per_batch}</p>
            )}
            <p className="text-xs text-zinc-400">
              Berapa pcs produk yang dihasilkan dari 1 batch ini
            </p>
          </div>

          {/* Footer tombol */}
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
              className="flex-1 py-3 bg-blue-700 rounded-sm text-white text-sm font-semibold text-center shadow-md hover:bg-blue-800 transition-colors disabled:opacity-60"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
