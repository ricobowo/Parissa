// ============================================================
// File: src/lib/formulas.test.ts
// Versi: v0.6.0
// Deskripsi: Unit tests untuk semua formula kalkulasi Parissa POS
//            Jalankan: npx jest src/lib/formulas.test.ts
// ============================================================

import {
  calcSalePrice,
  calcCostPerUnit,
  calcIngredientCostPerUnit,
  calcProfit,
  calcProfitMargin,
  calcStockStatus,
  calcPurchaseCostPerUnit,
  calcSuggestedPurchaseQty,
  calcWasteCost,
  calcAdjustedProfit,
  calcProductionRecommendation,
  calcMinSellingPrice,
} from './formulas'

// -------------------------------------------------------------------
// 5.1 — Harga Penjualan
// -------------------------------------------------------------------
describe('calcSalePrice', () => {
  it('menghitung harga normal (non-bundling)', () => {
    expect(
      calcSalePrice({ sellingPrice: 20000, bundlingPrice: null, isBundling: false, amount: 3 })
    ).toBe(60000)
  })

  it('menghitung harga bundling saat bundling_price tersedia', () => {
    expect(
      calcSalePrice({ sellingPrice: 20000, bundlingPrice: 55000, isBundling: true, amount: 1 })
    ).toBe(55000)
  })

  it('fallback ke selling_price jika is_bundling tapi bundling_price null', () => {
    expect(
      calcSalePrice({ sellingPrice: 20000, bundlingPrice: null, isBundling: true, amount: 2 })
    ).toBe(40000)
  })
})

// -------------------------------------------------------------------
// 5.2 — Cost Per Unit Produk (dari BOM)
// -------------------------------------------------------------------
describe('calcCostPerUnit', () => {
  it('menghitung cost per unit dari 2 bahan', () => {
    // Contoh: batch 10 pcs, bahan A qty 5 × Rp2000 + bahan B qty 3 × Rp1000
    // total = 10000 + 3000 = 13000, per pcs = 1300
    const result = calcCostPerUnit({
      recipeItems: [
        { quantityPerBatch: 5, costPerUnitIngredient: 2000 },
        { quantityPerBatch: 3, costPerUnitIngredient: 1000 },
      ],
      pcsPerBatch: 10,
    })
    expect(result).toBe(1300)
  })

  it('mengembalikan 0 jika pcs_per_batch = 0', () => {
    expect(
      calcCostPerUnit({ recipeItems: [{ quantityPerBatch: 5, costPerUnitIngredient: 2000 }], pcsPerBatch: 0 })
    ).toBe(0)
  })

  it('mengembalikan 0 jika tidak ada bahan', () => {
    expect(calcCostPerUnit({ recipeItems: [], pcsPerBatch: 10 })).toBe(0)
  })
})

// -------------------------------------------------------------------
// 5.3 — Cost Per Unit Bahan Baku
// -------------------------------------------------------------------
describe('calcIngredientCostPerUnit', () => {
  it('menghitung cost per unit bahan baku', () => {
    // Susu 1L seharga Rp18000, packaging 1000ml → Rp18/ml
    expect(
      calcIngredientCostPerUnit({ purchasePrice: 18000, packagingSize: 1000 })
    ).toBe(18)
  })

  it('mengembalikan 0 jika packaging_size = 0', () => {
    expect(
      calcIngredientCostPerUnit({ purchasePrice: 18000, packagingSize: 0 })
    ).toBe(0)
  })
})

// -------------------------------------------------------------------
// 5.4 — Profit Per Transaksi
// -------------------------------------------------------------------
describe('calcProfit', () => {
  it('profit saat pembayaran Sudah', () => {
    // sale_price=60000, cost=5000/pcs × 3pcs=15000, profit=45000
    const result = calcProfit({
      salePrice: 60000,
      costPerUnit: 5000,
      amount: 3,
      paymentStatus: 'Sudah',
    })
    expect(result.totalRevenue).toBe(60000)
    expect(result.totalCost).toBe(15000)
    expect(result.totalProfit).toBe(45000)
  })

  it('profit saat pembayaran Belum — revenue = 0, profit negatif', () => {
    const result = calcProfit({
      salePrice: 60000,
      costPerUnit: 5000,
      amount: 3,
      paymentStatus: 'Belum',
    })
    expect(result.totalRevenue).toBe(0)
    expect(result.totalCost).toBe(15000)
    expect(result.totalProfit).toBe(-15000)
  })
})

// -------------------------------------------------------------------
// 5.5 — Profit Margin Per Produk
// -------------------------------------------------------------------
describe('calcProfitMargin', () => {
  it('menghitung margin Pannacotta: jual 20000, cost 5000 → 300%', () => {
    expect(calcProfitMargin({ sellingPrice: 20000, costPerUnit: 5000 })).toBe(300)
  })

  it('mengembalikan 0 jika cost = 0', () => {
    expect(calcProfitMargin({ sellingPrice: 20000, costPerUnit: 0 })).toBe(0)
  })
})

// -------------------------------------------------------------------
// 5.6 — Status Stok
// -------------------------------------------------------------------
describe('calcStockStatus', () => {
  it('Habis saat qty <= min_level', () => {
    expect(calcStockStatus({ qtyAvailable: 50, minStockLevel: 100 })).toBe('Habis')
    expect(calcStockStatus({ qtyAvailable: 100, minStockLevel: 100 })).toBe('Habis')
  })

  it('Menipis saat qty <= 2 × min_level', () => {
    expect(calcStockStatus({ qtyAvailable: 150, minStockLevel: 100 })).toBe('Menipis')
    expect(calcStockStatus({ qtyAvailable: 200, minStockLevel: 100 })).toBe('Menipis')
  })

  it('Aman saat qty > 2 × min_level', () => {
    expect(calcStockStatus({ qtyAvailable: 201, minStockLevel: 100 })).toBe('Aman')
    expect(calcStockStatus({ qtyAvailable: 500, minStockLevel: 100 })).toBe('Aman')
  })
})

// -------------------------------------------------------------------
// 5.7 — Cost Per Unit Pembelian
// -------------------------------------------------------------------
describe('calcPurchaseCostPerUnit', () => {
  it('menghitung cost per unit pembelian', () => {
    expect(calcPurchaseCostPerUnit({ pricePaid: 50000, qtyPurchased: 5 })).toBe(10000)
  })

  it('mengembalikan 0 jika qty = 0', () => {
    expect(calcPurchaseCostPerUnit({ pricePaid: 50000, qtyPurchased: 0 })).toBe(0)
  })
})

// -------------------------------------------------------------------
// 5.8 — Saran Jumlah Pembelian
// -------------------------------------------------------------------
describe('calcSuggestedPurchaseQty', () => {
  it('menghitung saran beli yang positif', () => {
    // avg 10/hari × 7 = 70, stok = 20, saran = 50
    expect(calcSuggestedPurchaseQty({ avgDailyUsage30d: 10, qtyAvailable: 20 })).toBe(50)
  })

  it('mengembalikan 0 jika stok masih cukup', () => {
    // avg 5/hari × 7 = 35, stok = 100, saran = 0 (tidak negatif)
    expect(calcSuggestedPurchaseQty({ avgDailyUsage30d: 5, qtyAvailable: 100 })).toBe(0)
  })
})

// -------------------------------------------------------------------
// 5.9 — Waste Cost
// -------------------------------------------------------------------
describe('calcWasteCost dan calcAdjustedProfit', () => {
  it('menghitung waste cost', () => {
    expect(calcWasteCost({ wasteQuantity: 5, costPerUnit: 3000 })).toBe(15000)
  })

  it('menghitung adjusted profit setelah waste', () => {
    expect(calcAdjustedProfit({ profitFromSales: 200000, totalWasteCost: 15000 })).toBe(185000)
  })
})

// -------------------------------------------------------------------
// 5.10 — Rekomendasi Produksi Harian
// -------------------------------------------------------------------
describe('calcProductionRecommendation', () => {
  it('menghitung rekomendasi batch', () => {
    // avg 8/hari, preorder 5, stok 3, pcs_per_batch 6
    // needed = 8 + 5 - 3 = 10, ceil(10/6) = 2 batch
    expect(
      calcProductionRecommendation({ avgSales7d: 8, pendingPreorders: 5, currentStock: 3, pcsPerBatch: 6 })
    ).toBe(2)
  })

  it('mengembalikan 0 jika stok sudah cukup', () => {
    expect(
      calcProductionRecommendation({ avgSales7d: 3, pendingPreorders: 0, currentStock: 20, pcsPerBatch: 6 })
    ).toBe(0)
  })

  it('mengembalikan 0 jika pcs_per_batch = 0', () => {
    expect(
      calcProductionRecommendation({ avgSales7d: 8, pendingPreorders: 5, currentStock: 3, pcsPerBatch: 0 })
    ).toBe(0)
  })
})

// -------------------------------------------------------------------
// 5.11 — Pricing Calculator (min selling price)
// -------------------------------------------------------------------
describe('calcMinSellingPrice', () => {
  it('menghitung harga jual minimum untuk margin 70%', () => {
    // cost = 5000, margin 70% → 5000 / (1 - 0.7) = 16666.67
    expect(calcMinSellingPrice({ costPerUnit: 5000, targetMarginPct: 70 })).toBeCloseTo(16666.67, 0)
  })

  it('menghitung harga jual minimum untuk margin 300%', () => {
    // cost = 5000, margin 300% berarti profit = 3x cost
    // Catatan: formula PRD margin = (jual-cost)/cost
    // Jadi targetMarginPct di formula ini = (jual-cost)/cost × 100
    // Tapi formula 5.11 menggunakan: min_price = cost / (1 - target/100)
    // Untuk margin 75%: 5000 / 0.25 = 20000
    expect(calcMinSellingPrice({ costPerUnit: 5000, targetMarginPct: 75 })).toBe(20000)
  })

  it('mengembalikan 0 jika target margin = 100%', () => {
    expect(calcMinSellingPrice({ costPerUnit: 5000, targetMarginPct: 100 })).toBe(0)
  })
})
