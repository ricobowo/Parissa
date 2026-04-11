// ============================================================
// File: src/lib/formulas.ts
// Versi: v0.6.0
// Deskripsi: Semua formula kalkulasi bisnis Parissa POS
//            Sesuai PRD Section 5 — dikaji ulang, tidak dari Airtable langsung
// ============================================================

// -------------------------------------------------------------------
// 5.1 — Harga Penjualan
// Harga = bundling_price × qty (jika bundling) atau selling_price × qty
// -------------------------------------------------------------------
export function calcSalePrice(params: {
  sellingPrice: number
  bundlingPrice: number | null
  isBundling: boolean
  amount: number
}): number {
  const { sellingPrice, bundlingPrice, isBundling, amount } = params

  // Gunakan bundling price jika is_bundling dan bundling_price tersedia
  if (isBundling && bundlingPrice != null) {
    return bundlingPrice * amount
  }
  return sellingPrice * amount
}

// -------------------------------------------------------------------
// 5.2 — Cost Per Unit Produk (dari BOM/Resep)
// total_batch_cost = Σ (qty_used[i] × cost_per_unit_ingredient[i])
// cost_per_unit = total_batch_cost / pcs_per_batch
// -------------------------------------------------------------------
export interface RecipeItem {
  quantityPerBatch: number     // jumlah bahan per batch
  costPerUnitIngredient: number // harga per unit bahan
}

export function calcCostPerUnit(params: {
  recipeItems: RecipeItem[]
  pcsPerBatch: number
}): number {
  const { recipeItems, pcsPerBatch } = params

  // Hindari pembagian dengan nol
  if (pcsPerBatch <= 0) return 0

  // Jumlahkan semua biaya bahan per batch
  const totalBatchCost = recipeItems.reduce((sum, item) => {
    return sum + item.quantityPerBatch * item.costPerUnitIngredient
  }, 0)

  return totalBatchCost / pcsPerBatch
}

// -------------------------------------------------------------------
// 5.3 — Cost Per Unit Bahan Baku
// cost_per_unit_ingredient = purchase_price / packaging_size
// -------------------------------------------------------------------
export function calcIngredientCostPerUnit(params: {
  purchasePrice: number
  packagingSize: number
}): number {
  const { purchasePrice, packagingSize } = params

  // Hindari pembagian dengan nol
  if (packagingSize <= 0) return 0

  return purchasePrice / packagingSize
}

// -------------------------------------------------------------------
// 5.4 — Profit Per Transaksi
// Jika Sudah: profit = sale_price - (cost_per_unit × amount)
// Jika Belum: profit = 0 - (cost_per_unit × amount) (hanya catat biaya)
// -------------------------------------------------------------------
export interface ProfitResult {
  totalRevenue: number
  totalCost: number
  totalProfit: number
}

export function calcProfit(params: {
  salePrice: number
  costPerUnit: number
  amount: number
  paymentStatus: 'Sudah' | 'Belum'
}): ProfitResult {
  const { salePrice, costPerUnit, amount, paymentStatus } = params

  const totalCost = costPerUnit * amount

  if (paymentStatus === 'Sudah') {
    return {
      totalRevenue: salePrice,
      totalCost,
      totalProfit: salePrice - totalCost,
    }
  }

  // Status "Belum" — revenue = 0, hanya catat biaya
  return {
    totalRevenue: 0,
    totalCost,
    totalProfit: -totalCost,
  }
}

// -------------------------------------------------------------------
// 5.5 — Profit Margin Per Produk (%)
// margin = ((selling_price - cost_per_unit) / cost_per_unit) × 100
// -------------------------------------------------------------------
export function calcProfitMargin(params: {
  sellingPrice: number
  costPerUnit: number
}): number {
  const { sellingPrice, costPerUnit } = params

  // Hindari pembagian dengan nol
  if (costPerUnit <= 0) return 0

  return ((sellingPrice - costPerUnit) / costPerUnit) * 100
}

// -------------------------------------------------------------------
// 5.6 — Status Stok Bahan Baku
// Habis   : qty <= min_level
// Menipis : qty <= 2 × min_level
// Aman    : qty > 2 × min_level
// -------------------------------------------------------------------
export type StockStatus = 'Aman' | 'Menipis' | 'Habis'

export function calcStockStatus(params: {
  qtyAvailable: number
  minStockLevel: number
}): StockStatus {
  const { qtyAvailable, minStockLevel } = params

  if (qtyAvailable <= minStockLevel) return 'Habis'
  if (qtyAvailable <= 2 * minStockLevel) return 'Menipis'
  return 'Aman'
}

// -------------------------------------------------------------------
// 5.7 — Cost Per Unit Pembelian
// cost_per_unit = price_paid / qty_purchased
// -------------------------------------------------------------------
export function calcPurchaseCostPerUnit(params: {
  pricePaid: number
  qtyPurchased: number
}): number {
  const { pricePaid, qtyPurchased } = params

  if (qtyPurchased <= 0) return 0

  return pricePaid / qtyPurchased
}

// -------------------------------------------------------------------
// 5.8 — Saran Jumlah Pembelian (untuk notifikasi WA)
// suggested = (avg_daily_usage_30d × 7) - qty_available
// Minimum 0 (tidak bisa negatif)
// -------------------------------------------------------------------
export function calcSuggestedPurchaseQty(params: {
  avgDailyUsage30d: number
  qtyAvailable: number
}): number {
  const { avgDailyUsage30d, qtyAvailable } = params

  const suggested = avgDailyUsage30d * 7 - qtyAvailable
  return Math.max(0, suggested)
}

// -------------------------------------------------------------------
// 5.9 — Waste Cost & Adjusted Profit
// waste_cost = waste_quantity × cost_per_unit
// adjusted_profit = profit_from_sales - total_waste_cost
// -------------------------------------------------------------------
export function calcWasteCost(params: {
  wasteQuantity: number
  costPerUnit: number
}): number {
  return params.wasteQuantity * params.costPerUnit
}

export function calcAdjustedProfit(params: {
  profitFromSales: number
  totalWasteCost: number
}): number {
  return params.profitFromSales - params.totalWasteCost
}

// -------------------------------------------------------------------
// 5.10 — Rekomendasi Produksi Harian
// recommended = CEIL((avg_sales_7d + pending_preorders - current_stock) / pcs_per_batch)
// Minimum 0
// -------------------------------------------------------------------
export function calcProductionRecommendation(params: {
  avgSales7d: number
  pendingPreorders: number
  currentStock: number
  pcsPerBatch: number
}): number {
  const { avgSales7d, pendingPreorders, currentStock, pcsPerBatch } = params

  if (pcsPerBatch <= 0) return 0

  const needed = avgSales7d + pendingPreorders - currentStock
  return Math.max(0, Math.ceil(needed / pcsPerBatch))
}

// -------------------------------------------------------------------
// 5.11 — Pricing Calculator
// min_selling_price = cost_per_unit / (1 - target_margin/100)
// -------------------------------------------------------------------
export function calcMinSellingPrice(params: {
  costPerUnit: number
  targetMarginPct: number
}): number {
  const { costPerUnit, targetMarginPct } = params

  // target margin tidak boleh 100% atau lebih
  if (targetMarginPct >= 100) return 0

  return costPerUnit / (1 - targetMarginPct / 100)
}

// -------------------------------------------------------------------
// Helper: Format Rupiah
// -------------------------------------------------------------------
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// -------------------------------------------------------------------
// Helper: Format persentase margin
// -------------------------------------------------------------------
export function formatMargin(margin: number): string {
  return `${margin.toFixed(1)}%`
}
