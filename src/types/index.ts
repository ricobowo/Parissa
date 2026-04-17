// ============================================================
// File: src/types/index.ts
// Versi: v0.1.0
// Deskripsi: Definisi tipe TypeScript untuk semua entitas Parissa POS
// ============================================================

// --- Roles ---
export interface Role {
  id: string
  name: string
  name_en: string | null
  permissions: Record<string, boolean>
  is_system: boolean
  created_at: string
}

// --- Users ---
export interface User {
  id: string
  email: string
  name: string
  phone: string | null
  role_id: string | null
  language: 'id' | 'en'
  is_active: boolean
  created_at: string
  updated_at: string
  role?: Role
}

// --- Products ---
export interface Product {
  id: string
  name: string
  selling_price: number
  bundling_price: number | null
  is_bundling: boolean
  is_active: boolean
  image_url: string | null
  created_at: string
  updated_at: string
}

// --- Ingredients ---
export interface Ingredient {
  id: string
  name: string
  purchase_unit: string
  supplier: string | null
  purchase_price: number
  packaging_size: number
  minimum_stock_level: number
  quantity_available: number
  created_at: string
  updated_at: string
}

// Ingredient + status dari view ingredients_with_status (Formula 5.6)
export interface IngredientWithStatus extends Ingredient {
  stock_status: StockStatus
}

// --- Recipe / BOM ---
export interface Recipe {
  id: string
  product_id: string
  ingredient_id: string
  quantity_per_batch: number
  pcs_per_batch: number
  product?: Product
  ingredient?: Ingredient
}

// --- Sales ---
export interface Sale {
  id: string
  date: string
  customer_name: string
  product_id: string
  amount: number
  is_bundling: boolean
  menu_detail: string | null
  topping: string | null
  sale_price: number
  payment_status: 'Sudah' | 'Belum'
  sale_type: 'Direct' | 'Pre-order'
  pre_order_date: string | null
  pre_order_status: 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled' | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Soft-delete (migration 003)
  is_void: boolean
  void_reason: string | null
  voided_at: string | null
  voided_by: string | null
  // Follow-up status (migration 007)
  followup_status: 'pending' | 'followed_up' | 'bad_debt' | 'paid' | null
  product?: Product
  profit_calculation?: ProfitCalculation
}

// --- Profit Calculations ---
export interface ProfitCalculation {
  id: string
  sale_id: string
  total_revenue: number
  total_cost: number
  total_profit: number
  created_at: string
}

// --- Batches ---
export type BatchStatus = 'Planned' | 'In Progress' | 'Completed' | 'Expired'

export interface Batch {
  id: string
  product_id: string
  batch_number: string
  batch_date: string
  batch_quantity: number
  expiration_date: string
  status: BatchStatus
  notes: string | null
  created_by: string | null
  created_at: string
  product?: Product
}

// --- Daily Production Planner (Formula 5.10) ---
// Row dari view daily_production_planner — 1 baris per produk aktif.
export interface ProductionRecommendation {
  product_id: string
  product_name: string
  product_active: boolean
  avg_sales_7d: number        // rata-rata harian 7 hari terakhir
  pending_preorders: number   // qty pre-order Pending/Confirmed ke depan
  current_stock: number       // batch Completed belum expired
  pcs_per_batch: number       // dari recipes; 0 = belum punya resep
  shortfall: number           // selisih kebutuhan (sebelum dibagi batch)
  recommended_batches: number // hasil Formula 5.10
}

// Batch + kolom computed dari view batches_with_expiry
export type ExpiryBucket = 'expired' | 'h1' | 'h3' | 'ok'
export interface BatchWithExpiry extends Batch {
  product_name: string | null
  days_until_expiry: number
  expiry_bucket: ExpiryBucket
}

// --- Purchases ---
export interface Purchase {
  id: string
  ingredient_id: string
  qty_purchased: number
  price_paid: number
  supplier: string | null
  date: string
  notes: string | null
  created_by: string | null
  created_at: string
  ingredient?: Ingredient
}

// --- Customers ---
export interface Customer {
  id: string
  name: string
  phone: string | null
  label: string | null
  notes: string | null
  first_purchase_date: string | null
  last_purchase_date: string | null
  total_transactions: number
  total_spending: number
  created_at: string
  updated_at: string
}

// --- Waste Logs ---
export interface WasteLog {
  id: string
  product_id: string
  quantity: number
  reason: 'Expired' | 'Damaged' | 'Sample' | 'Other'
  waste_cost: number
  date: string
  notes: string | null
  created_by: string | null
  created_at: string
  product?: Product
}

// --- Audit Logs ---
export interface AuditLog {
  id: string
  table_name: string
  record_id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  changed_by: string | null
  changed_at: string
}

// --- Stock Notifications ---
export interface StockNotification {
  id: string
  ingredient_id: string
  notification_date: string
  status: string
  sent_at: string
}

// --- Status stok (untuk UI) ---
export type StockStatus = 'Aman' | 'Menipis' | 'Habis'

// --- Permission keys per modul ---
export type ModulePermission =
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'recipes'
  | 'stock'
  | 'batching'
  | 'purchases'
  | 'reports'
  | 'customers'
  | 'settings'
  | 'waste'
  | 'history'
  | 'audit'
  | 'stock.edit_min_level'

// --- Customer Labels (master data) ---
export type CustomerLabelColor =
  | 'gray' | 'blue' | 'green' | 'orange' | 'red' | 'purple'

export interface CustomerLabel {
  id: string
  name: string
  color: CustomerLabelColor
  is_system: boolean
  created_at: string
  updated_at: string
}

// Row dari view customer_stats — customer + favorite product + label color
export interface CustomerStats extends Customer {
  favorite_product_id: string | null
  favorite_product_name: string | null
  label_color: CustomerLabelColor | null
}

// --- Sales Followups (CRM history) ---
export type FollowupAction =
  | 'followed_up' | 'marked_bad_debt' | 'payment_received'
  | 'note_added' | 'reopened'

export type FollowupStatus =
  | 'pending' | 'followed_up' | 'bad_debt' | 'paid'

export interface SalesFollowup {
  id: string
  sale_id: string
  action: FollowupAction
  notes: string | null
  created_by: string | null
  created_at: string
}

// Row dari view overdue_payments
export interface OverduePayment {
  sale_id: string
  sale_date: string
  customer_name: string
  customer_phone: string | null
  product_name: string
  amount: number
  sale_price: number
  payment_status: 'Belum'
  notes: string | null
  followup_status: FollowupStatus | null
  days_overdue: number
  created_at: string
}

// --- Profit Report With Waste (view row) ---
export interface ProfitReportWithWaste {
  date: string
  total_revenue: number
  total_cost: number
  total_profit: number
  total_waste_cost: number
  total_waste_qty: number
  adjusted_profit: number
}
