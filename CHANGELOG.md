# Changelog — Parissa POS

Semua perubahan penting pada proyek ini didokumentasikan di file ini.

---

## [v0.6.1] — 2026-04-11

### Diperbarui — Design Alignment Phase 1B (Task 7.0 & 8.0)
- Semua komponen Phase 1B diselaraskan dengan desain referensi HTML (`HTML/Dekstop & Tabs.html`, `HTML/Mobile.html`)
- Migrasi dari CSS variables ke Tailwind classes langsung sesuai design system referensi
- `ProductTable` — header `bg-neutral-50`, badge margin `bg-emerald-50 text-emerald-700`, badge aktif `bg-green-100`, bundling badge `bg-blue-700/10`, tombol aksi ghost style
- `ProductModal` — overlay `bg-gray-800/40 backdrop-blur-[2px]`, modal `rounded-2xl shadow-2xl`, input `bg-zinc-100 rounded-sm`, toggle switch sesuai referensi, button `bg-blue-700 rounded-sm`
- `products/page.tsx` — header dengan label `text-blue-700 uppercase` + judul `text-3xl font-extrabold`, StatChip dengan `outline outline-1 outline-zinc-100`
- `RecipeEditor` — CostSummaryCard grid 4 kartu `bg-white rounded-lg outline-zinc-100`, tabel dengan `bg-neutral-50` header, modal sesuai ProductModal
- `PricingCalculator` — preset chips `bg-blue-700/10 rounded-xl`, input `bg-zinc-100 rounded-sm`, hasil kalkulasi dengan warna `bg-emerald-50`/`bg-amber-50`
- `recipes/page.tsx` — header konsisten, ProductPickerPanel `bg-neutral-50` header, item terpilih `bg-blue-50 text-blue-700`

---

## [v0.6.0] — 2026-04-11

### Ditambahkan — Phase 1B: Manajemen Produk (Task 7.0)
- Halaman **Manajemen Produk** (`/products`) — tabel lengkap: nama, harga jual, harga bundling, cost/unit, margin, status aktif
- Komponen `ProductTable` — tabel responsif dengan scroll horizontal mobile, badge bundling, badge status aktif/nonaktif
- Komponen `ProductModal` — modal tambah/edit produk: nama, harga jual, toggle bundling + harga bundling kondisional, toggle status aktif
- **Soft delete** produk via toggle is_active (FR-020) — produk nonaktif tidak terhapus dari database
- Tombol "Resep" di setiap baris produk → link langsung ke halaman resep produk tersebut
- Auto-kalkulasi cost/unit dan profit margin di halaman produk (mengambil data dari BOM/resep)

### Ditambahkan — Phase 1B: Resep/BOM & Pricing Calculator (Task 8.0)
- Halaman **Resep/BOM** (`/recipes`) — layout 2 panel: picker produk di kiri, editor resep di kanan
- Support query param `?product=<id>` untuk deep-link dari halaman produk
- Komponen `RecipeEditor` — tabel bahan baku: qty/batch, satuan, cost/unit bahan, total cost bahan
  - CRUD lengkap: tambah, edit, hapus item resep
  - Preview real-time total cost bahan saat input qty
  - Footer tabel: total cost batch
  - `CostSummaryCard` — kartu ringkasan: total cost batch, pcs/batch, cost/unit, margin saat ini
- Komponen `PricingCalculator` — kalkulator harga minimum (Formula 5.11)
  - Input target margin (%) dengan preset cepat (50%, 70%, 100%, 150%, 200%, 300%)
  - Output: harga jual minimum + indikator apakah harga saat ini sudah cukup
  - Tampilkan margin aktual dari harga jual saat ini

### Ditambahkan — Formula & Tests
- `src/lib/formulas.ts` — semua formula kalkulasi bisnis Parissa (PRD Section 5):
  - 5.1 calcSalePrice, 5.2 calcCostPerUnit, 5.3 calcIngredientCostPerUnit
  - 5.4 calcProfit, 5.5 calcProfitMargin, 5.6 calcStockStatus
  - 5.7 calcPurchaseCostPerUnit, 5.8 calcSuggestedPurchaseQty
  - 5.9 calcWasteCost + calcAdjustedProfit, 5.10 calcProductionRecommendation
  - 5.11 calcMinSellingPrice, helpers: formatRupiah, formatMargin
- `src/lib/formulas.test.ts` — unit tests lengkap untuk semua 12 formula + edge cases

### Ditambahkan — Translations
- `id.json` & `en.json`: translations lengkap untuk modul `products` (tambahan) dan modul `recipes` baru

---

## [v0.5.1] — 2026-04-11

### Diubah
- Regenerasi `002_seed_data.sql` menggunakan data asli dari Airtable CSV export (bukan data sample)
  - 6 produk dengan harga jual asli (Pannacotta Rp20.000, Fresh Creamy Rp28.000)
  - 18 bahan baku dengan harga, supplier, dan kemasan persis dari Airtable
  - 51 resep/BOM lengkap dengan quantity_per_batch dan pcs_per_batch sesuai CSV
  - 53 transaksi penjualan asli (30 Jan – 2 Mar 2026) termasuk nama pelanggan, topping, status bayar
  - 18 data pembelian baseline bahan baku
- Trigger management pada seed: disable stock triggers saat insert, re-enable setelah selesai

### Diperbaiki
- Tambahkan `/data/` ke `.gitignore` — folder CSV Airtable berisi data pelanggan asli (privasi)

---

## [v0.5.0] — 2026-04-11

### Ditambahkan
- Shared UI components minimalis Notion-style:
  - `PageHeader` — judul halaman + deskripsi + area aksi reusable
  - `Skeleton`, `CardSkeleton`, `TableRowSkeleton`, `PageSkeleton` — loading state animasi pulse
  - `EmptyState` — tampilan data kosong (ikon + pesan + aksi)
  - Toast notification system: `ToastItem`, `Toaster`, `useToast` hook — pojok kanan bawah, auto-hilang 4 detik
- Toaster dipasang di locale layout agar bisa dipanggil dari semua halaman
- Seed data migrasi Airtable (`002_seed_data.sql`):
  - 6 produk (Vanilla Pannacotta, Earl Grey Pannacotta, Bundling 3pcs, FC Earl Grey, FC Matcha, FC Lotus)
  - 18 bahan baku dengan harga, packaging, stok awal, dan minimum level
  - 36 resep/BOM (6 produk × 6 bahan) dengan quantity_per_batch dan pcs_per_batch
  - 54 transaksi penjualan (sample Maret 2026, termasuk Sudah/Belum, Direct/Pre-order)
  - 9 batch produksi (4 Vanilla, 2 Earl Grey, 1 FC EG, 1 FC Matcha, 1 FC Lotus)
  - 7 pembelian/restock bahan baku

---

## [v0.4.0] — 2026-04-11

### Ditambahkan
- Halaman login (`/[locale]/login`) — tampilan minimalis Notion-style
- Komponen `LoginForm` — autentikasi via Supabase Auth (email + password)
- Helper `src/lib/auth.ts` — getCurrentUser, hasPermission, getAllRoles, getAllUsers
- Middleware update — Supabase session refresh + redirect ke login jika belum terautentikasi
- Route groups: `(auth)` untuk login, `(app)` untuk halaman authenticated dengan AppShell
- `AppShell` layout — Sidebar (desktop 240px, collapsible) + BottomTabs (mobile, max 5 tab)
- Navigasi role-based — menu ditampilkan/disembunyikan berdasarkan permissions user
- Settings > Role Management — tabel permission matrix, CRUD role, toggle permission per modul
- Settings > User Management — assign role, toggle aktif/nonaktif user
- `LanguageToggle` komponen — toggle bahasa ID/EN di header, simpan preferensi ke profil user
- i18n bilingual setup lengkap: next-intl config, locale routing, file terjemahan id.json & en.json

---

## [v0.3.0] — 2026-04-11

### Diubah
- Ganti library `xlsx` (SheetJS) ke `exceljs` — menghilangkan 2 vulnerability (Prototype Pollution + ReDoS)

### Ditambahkan
- Database schema lengkap: 13 tabel (roles, users, products, ingredients, recipes, sales, profit_calculations, batches, purchases, customers, waste_logs, audit_logs, stock_notifications)
- Indeks database untuk performa query pada tabel kunci
- Fungsi `calculate_product_cost()` — hitung cost per unit dari BOM/resep (Formula 5.2)
- Trigger `trg_calculate_profit` — auto-hitung profit saat sale insert/update (Formula 5.4)
- Trigger `trg_deduct_stock_on_sale` — auto-kurangi stok bahan saat penjualan
- Trigger `trg_upsert_customer` — auto-update database pelanggan saat penjualan
- Trigger `trg_update_stock_on_purchase` — auto-tambah stok saat pembelian/restock
- Trigger `trg_*_updated_at` — auto-update timestamp pada tabel yang relevan
- Row Level Security (RLS) untuk semua tabel dengan policy per role
- Fungsi helper `user_has_permission()` dan `user_is_owner()` untuk RLS
- Dashboard KPI views: `dashboard_kpi`, `sales_by_product`, `daily_sales`, `bundling_ratio`
- Seed data: 4 default roles (Owner, Kasir, Produksi, Admin Keuangan) dengan permission matrix

---

## [v0.2.0] — 2026-04-10

### Ditambahkan
- Setup Next.js 16 + TypeScript + Tailwind CSS + App Router
- Integrasi Supabase client (browser + server + middleware)
- shadcn/ui dengan tema monokrom Notion-style (semua warna sebagai CSS variables)
- Konfigurasi next-intl bilingual (ID/EN) dengan locale routing
- File terjemahan `id.json` dan `en.json` (label UI lengkap)
- TanStack React Query provider
- PWA manifest (`public/manifest.json`)
- Konfigurasi `next.config.ts` untuk PWA dan i18n
- TypeScript type definitions untuk semua entitas (`src/types/index.ts`)
- Layout berbasis locale (`src/app/[locale]/layout.tsx`)
- File `.env.local.example` untuk konfigurasi Supabase

---

## [v0.1.0] — 2026-04-10

### Ditambahkan
- Inisialisasi repository dan branch `feature/parissa-pos-mvp`
- File `CHANGELOG.md` dan `VERSION`
