# Changelog — Parissa POS

Semua perubahan penting pada proyek ini didokumentasikan di file ini.

---

## [v0.14.1] — 2026-04-18

### Diperbaiki
- **Hydration warning** — `PageSkeleton` sebelumnya me-render `<TableRowSkeleton>`
  (`<tr>`) langsung di dalam `<div>` tanpa `<table><tbody>`, menyebabkan warning
  "In HTML, `<tr>` cannot be a child of `<div>`" dan hydration mismatch di semua
  halaman yang memakai `PageSkeleton` (customers, history, dll). Diperbaiki di
  `src/components/ui/loading-skeleton.tsx` dengan membungkus baris dalam
  `<table><tbody>`.

---

## [v0.14.0] — 2026-04-17

### Ditambahkan — Phase 1D: Customer CRM, Waste Tracking, Audit Trail, History (Task 18.0 & 19.0)

**Task 18.0 — Customer Database & CRM**
- Halaman `/customers` baru dengan 2 tab:
  - **Daftar Pelanggan** — dari view `customer_stats`: nama, telepon, label
    (VIP/Regular/custom), total transaksi, total belanja, produk favorit,
    terakhir beli. Search nama + filter label.
  - **Piutang Overdue** — dari view `overdue_payments`: transaksi `Belum` bayar
    > 3 hari (PRD Section 5.10). Highlight kuning-oranye.
- Dialog edit label pelanggan (+ notes internal). Pilihan label dari master
  `customer_labels` (bisa di-manage, punya warna).
- Aksi CRM overdue: **Mark Followed-up / Mark Bad Debt / Mark Paid**.
  Setiap aksi tercatat di tabel history `sales_followups` (action, notes,
  created_by, timestamp). "Mark Paid" juga update `payment_status='Sudah'`.
- Auto-upsert customer dari transaksi (trigger sudah ada sejak v0.1).

**Task 19.0 — Waste Tracking & Audit Trail**
- Halaman `/waste` baru — catat waste/spoilage dengan form (produk, qty,
  alasan: Expired/Damaged/Sample/Other, tanggal, catatan).
- `waste_cost` dihitung otomatis oleh DB trigger (**Formula 5.9**:
  `quantity × cost_per_unit`) — client kirim `0`, trigger overwrite.
- **Adjusted profit** di halaman Laporan: 3 kartu baru (Total Waste Cost,
  Total Unit Waste, Adjusted Profit) + dimasukkan ke Excel export.
- **Audit trail generic** — trigger `trigger_audit_row` pasang ke 10 tabel
  bisnis inti (sales, products, ingredients, batches, purchases, recipes,
  waste_logs, customers, roles, users). Catat INSERT/UPDATE/DELETE lengkap
  dengan old/new JSONB dan user yang mengubah.
- Halaman `/history` baru — riwayat transaksi dengan search teks, filter
  status bayar (Sudah/Belum/Void), filter tipe (Direct/Pre-order), date range.

### Database
- Migration `007_customer_crm.sql`:
  - Tabel master `customer_labels` (name, color, is_system) + seed VIP/Regular/New.
  - Kolom `sales.followup_status` (pending/followed_up/bad_debt/paid) + CHECK constraint.
  - Tabel `sales_followups` — history aksi CRM (immutable; no UPDATE/DELETE policy).
  - Trigger `trigger_sync_sale_followup_status` — sync `sales.followup_status`.
  - View `customer_stats` — agregasi customer + favorite product + label color.
  - View `overdue_payments` — list piutang > 3 hari, exclude paid/bad_debt.
- Migration `008_waste_and_audit.sql`:
  - `trigger_calculate_waste_cost` (BEFORE INSERT) — Formula 5.9.
  - `trigger_audit_row` — generic audit logger (skip update yang hanya ubah `updated_at`).
  - Pasang trigger audit ke 10 tabel bisnis inti.
  - View `profit_report_with_waste` — total_profit, total_waste_cost, adjusted_profit per hari.
  - Permission baru: `waste`, `audit`, `history` (Owner: 3, Produksi: waste+history, Admin Keuangan: history).
- Helper `current_app_user_id()` resolve `auth.uid()` untuk audit logger.

### Komponen baru
- `src/components/customers/CustomerTable.tsx`, `LabelBadge.tsx`,
  `LabelDialog.tsx`, `OverdueList.tsx`
- `src/components/waste/WasteForm.tsx`, `WasteTable.tsx`
- `src/lib/utils.ts` — helper `formatRupiah()` dan `formatDate()` (Inter locale).

### UI/Nav
- Sidebar menu baru: **Waste** (`/waste`), **Riwayat** (`/history`).
- Types baru: `CustomerLabel`, `CustomerStats`, `SalesFollowup`, `FollowupAction`,
  `FollowupStatus`, `OverduePayment`, `ProfitReportWithWaste`.
- i18n ID/EN: namespace `customers.*`, `waste.*`, `history.*` — seluruh label,
  placeholder, error message bilingual.

### Keputusan desain
- **Label pelanggan = tabel master terpisah** (`customer_labels`) bukan enum —
  agar user bisa tambah/edit/hapus label di Settings; label bawaan `is_system=true`
  tidak bisa dihapus. Kolom `customers.label` tetap VARCHAR (soft link ke nama).
- **Follow-up = tabel history terpisah** (`sales_followups`) dengan kolom cache
  `sales.followup_status` — agar query list overdue cepat, tapi history audit
  tetap lengkap. Tidak ada policy UPDATE/DELETE di `sales_followups`.
- **Audit trigger skip updated_at-only changes** — mencegah noise saat trigger
  lain (mis. `trigger_set_updated_at`) jalan.
- **Halaman `/history` terpisah dari `/pos`** — POS dioptimalkan < 30 detik
  quick-sale; history untuk analisis/audit (search, filter, export).

---

## [v0.13.0] — 2026-04-17

### Ditambahkan — Phase 1D: Daily Production Planner (Task 17.0)
- Komponen dashboard `DailyProductionPlanner` — rekomendasi produksi harian:
  - Tabel per produk: Avg 7d, Pre-order, Stok Siap, Rekomendasi (batch)
  - Perkiraan total pcs (rekomendasi × pcs_per_batch) di bawah nilai batch
  - Badge peringatan "Belum ada resep" jika produk tidak punya BOM
  - Permission gate: hanya user dgn izin `batching` (Owner & Produksi default)
  - Zero-noise: card hide total jika tidak ada rekomendasi > 0
  - Link "Buat Batch →" ke halaman `/batching`
- Migration `006_production_planner.sql` — view `daily_production_planner`:
  - `avg_sales_7d` = SUM(amount) sales 7 hari terakhir / 7 (exclude void)
  - `pending_preorders` = SUM(amount) sale_type='Pre-order' & status
    Pending/Confirmed & pre_order_date >= hari ini
  - `current_stock` = SUM(batch_quantity) batches Completed belum expired
  - `pcs_per_batch` = MAX(recipes.pcs_per_batch) per produk
  - `recommended_batches` = **Formula 5.10**:
    CEIL((avg_sales_7d + pending_preorders - current_stock) / pcs_per_batch),
    min 0; juga 0 bila produk belum punya resep
  - `shortfall` — selisih kebutuhan sebelum dibagi batch (untuk transparansi)
- Tipe baru `ProductionRecommendation` di `types/index.ts`
- Translations ID/EN untuk namespace `planner.*`

### Keputusan desain
- **View DB vs client-side**: pilih view DB (satu sumber kebenaran, konsisten
  dengan pola `ingredients_with_status` & `batches_with_expiry`)
- **Reuse permission `batching`**: tidak bikin key baru agar tidak proliferasi
  (Owner & Produksi sudah punya akses produksi)
- **Current stock = batch Completed belum expired** (PRD 5.7): stok produk jadi
  yang siap dijual, bukan kapasitas produksi

---

## [v0.12.2] — 2026-04-17

### Ditambahkan — Dokumentasi
- **`README.md`** (baru) — living document untuk branch `feature/parissa-pos-mvp`:
  - Deskripsi project, tech stack, getting started, struktur folder
  - Progress checklist Phase 1A–1E
  - Ringkasan rules bisnis, design system, success metrics
  - Akan di-update terus sampai project selesai

### Diubah — Working Rules (CLAUDE.md)
- **RULE 10 — ALWAYS UPDATE README BEFORE PUSH** (baru):
  - Wajib update `README.md` sebelum commit final / siap-push
  - Sinkronkan versi, centang Progress Phase 1, update Tech Stack & Struktur Folder bila perlu
  - README sebagai living document — dilaporkan di SESSION SUMMARY

---

## [v0.12.1] — 2026-04-17

### Diperbaiki — Security Warnings (Supabase Database Linter)
- **`function_search_path_mutable`**: Tambah `SET search_path = public` ke 13 fungsi database (`trigger_deduct_stock_on_sale`, `trigger_restore_stock_on_void`, `guard_min_stock_level_edit`, `trigger_generate_batch_number`, `trigger_deduct_stock_on_batch`, `guard_batch_status_transition`, `user_is_owner`, `calculate_product_cost`, `trigger_upsert_customer`, `trigger_update_stock_on_purchase`, `trigger_calculate_profit`, `trigger_set_updated_at`, `user_has_permission`) — mencegah search_path injection attack
- **`rls_policy_always_true`**: Perbaiki policy `stock_notifications_insert` dari `WITH CHECK (true)` ke `WITH CHECK (user_has_permission('stock'))` — hanya user dengan akses stok yang bisa insert notifikasi
- Migration: `005_fix_security_warnings.sql`

---

## [v0.12.0] — 2026-04-17

### Ditambahkan — Phase 1D: Batching & Expiry Tracker (Task 16.0)
- Halaman **Produksi** (`/batching`) — form batch + tabs List & Kalender Expiry
- Komponen `BatchForm` — Zod validation, preview bahan dipotong (BOM × qty) real-time:
  - Field: produk, batch_quantity (pcs), batch_date, expiration_date, notes
  - Preview per-bahan: qty dibutuhkan vs tersedia, highlight merah jika shortage
  - Tombol Simpan disable otomatis saat stok tidak cukup (selain guard DB)
  - `batch_number` di-generate otomatis oleh trigger (format `PREFIX-YYYYMMDD-NN`)
- Komponen `BatchList` — tabel batch dengan state-machine inline:
  - Planned → In Progress → Completed (linear, divalidasi di DB)
  - Planned / In Progress dapat ditandai Expired
  - Badge expiry dengan sufiks sisa hari (mis. `10 Apr 2026 (2h lagi)`)
  - Warna badge: H-1/expired = `--color-danger`, H-3 = `--color-warning`
- Komponen `ExpiryCalendar` — grid 6×7 per bulan, navigator prev/next:
  - Sel highlight background sesuai bucket (color-mix dengan bg agar soft)
  - Sel hari ini dibatasi border `--color-accent`
  - Nama produk ditampilkan di sel (max 2, sisanya `+N`)
  - Legenda: expired, H-1, H-3, aman
- Komponen dashboard `ExpiryAlerts` — card "Akan Kadaluarsa":
  - Zero-noise: tidak dirender jika tidak ada batch H ≤ 3
  - Hanya batch dengan status Planned / In Progress yang ditampilkan
  - Link "Lihat semua" ke `/batching`
- Migration `004_batching_triggers.sql`:
  - `trg_generate_batch_number` (BEFORE INSERT) — auto-format nomor batch
  - `trg_deduct_stock_on_batch` (AFTER INSERT) — potong stok bahan sesuai BOM
    dengan guard stok negatif (raise exception P0001, pesan berbahasa Indonesia)
  - `trg_guard_batch_status` (BEFORE UPDATE OF status) — state machine strict:
    Completed/Expired = terminal; Planned hanya ke In Progress/Expired; In
    Progress hanya ke Completed/Expired
  - View `batches_with_expiry` — kolom computed `days_until_expiry` dan
    `expiry_bucket` (expired/h1/h3/ok); "Expired" auto-flag sepenuhnya
    computed (tidak mengubah kolom status)
- Tipe baru di `types/index.ts`: `BatchStatus`, `ExpiryBucket`, `BatchWithExpiry`
- Translations ID/EN lengkap untuk namespace `batching.*`
- Semua warna via CSS variables (monokrom + fungsional, dark-mode ready)

### Catatan teknis
- Faktor deduct stok: `quantity_per_batch × (batch_quantity / pcs_per_batch)` —
  resep disimpan per-batch, batch_quantity di schema adalah pcs yang diproduksi
- Expiry tidak memakai cron/edge function — murni computed view (Phase 1 lean)
- Kalender tanpa library eksternal (custom grid), konsisten dengan stack

---

## [v0.11.0] — 2026-04-17

### Ditambahkan — Phase 1D: Purchase / Restock (Task 15.0)
- Halaman **Pembelian** (`/purchases`) — form input pembelian + riwayat transaksi
- Komponen `PurchaseForm` — form dengan Zod validation:
  - Field: bahan (dropdown), qty, harga total, supplier, tanggal, catatan
  - **Preview cost/unit realtime (Formula 5.7)** — update otomatis saat user isi qty+harga
  - Mode inline panel (bukan modal) untuk pengalaman desktop yang lebih baik
- Komponen `PurchaseHistoryTable` — tabel riwayat dengan cost/unit computed per baris
- Filter riwayat: bahan (dropdown), supplier (search), rentang tanggal (from-to), tombol reset
- **Auto-update stok** via trigger existing `trg_update_stock_on_purchase` (migration 001)
  - Verifikasi: insert purchase → stok bahan bertambah sesuai `qty_purchased`
- Translations ID/EN untuk seluruh modul `purchases.*`

---

## [v0.10.0] — 2026-04-17

### Ditambahkan — Phase 1D: Stok & Bahan Baku (Task 14.0)
- Halaman **Stok & Bahan** (`/stock`) — daftar bahan baku dengan status otomatis
  - Tabel: nama, qty_available, unit, supplier, min level, status badge
  - Filter status (Aman/Menipis/Habis) + search nama (client-side)
  - Chip ringkasan: total, aman, menipis, habis
  - Monokrom Notion-style, warna status via CSS variables (bukan hardcoded)
- Komponen `StockStatusBadge` — dot + label, warna dari `--color-success/warning/danger`
- Komponen `StockTable` — tabel responsif, no zebra stripe, border-bottom row separator
- Komponen `MinLevelModal` — modal edit `minimum_stock_level` dengan validasi Zod
  - Tombol "Ubah Min Level" hanya tampil untuk user dengan izin `stock.edit_min_level`
- Migration `003_stock_integrity.sql`:
  - **Guard stok negatif** di trigger deduct-on-sale → raise exception berbahasa Indonesia dengan nama bahan, stok tersedia & jumlah dibutuhkan
  - **Void-sale restoration**: kolom `is_void`, `void_reason`, `voided_at`, `voided_by` di tabel sales + trigger `trg_restore_stock_on_void` yang mengembalikan stok saat sale di-void
  - **Permission baru** `stock.edit_min_level` — default true hanya untuk Owner & Admin Keuangan
  - Trigger `guard_min_stock_level_edit` memblokir perubahan `minimum_stock_level` tanpa izin khusus
  - View `ingredients_with_status` — status dihitung di DB (konsisten dengan Formula 5.6)
- Tipe baru `IngredientWithStatus` + permission key `stock.edit_min_level` di `src/types/index.ts`
- Tambah 5 unit test edge case untuk `calcStockStatus`: qty=0, qty negatif, min=0, boundary desimal (total 31 tests pass)
- Stok Navigasi: link `/stock` di Sidebar (sudah ada) + ditambahkan ke BottomTabs mobile
- Translations ID/EN untuk seluruh modul stok (`stock.*`)

### Keputusan desain
- **Trigger DB vs application layer** untuk deduct/restore stok → memilih trigger DB karena atomicity + race-proof + integritas lintas jalur insert
- **Guard stok negatif** via `RAISE EXCEPTION` (bukan CHECK constraint) → pesan user-friendly bilingual yang actionable di toast
- **Permission `stock.edit_min_level` dipisah** dari permission `stock` umum karena perubahan threshold adalah keputusan strategis (pengaruh reorder + cashflow) dan rentan manipulasi

---

## [v0.9.1] — 2026-04-16

### Ditambahkan — Phase 1C: Export ke Excel (Task 13.0)
- Utility `src/lib/export.ts` — `generateExcelBuffer()`, `downloadExcel()`, `buildExportFilename()`, `formatRupiahExcel()`
  - Multi-sheet support (Sheet 1: Ringkasan, Sheet 2+: Detail)
  - Auto-width kolom berdasarkan konten
  - Format Rupiah: "Rp 1.000.000" (string, bukan number)
  - Nama file standar: `Parissa-[Tipe]-[YYYY-MM].xlsx`
- Tombol **"Export Excel"** di halaman laporan (profit report & monthly report)
  - Export respek filter aktif (periode, produk, status bayar)
  - Profit export: 2 sheet (Ringkasan + Detail per Produk)
  - Monthly export: 3 sheet (Ringkasan + Penjualan Harian + Distribusi Produk)
- **12 unit tests** di `src/lib/export.test.ts` — semua pass
  - Test: format Rupiah, nama file, buffer valid, multi-sheet, data kosong, autoWidth
- Setup Jest + ts-jest dengan `tsconfig.jest.json` terpisah
- Install `xlsx` (SheetJS) v0.18.5 sebagai dependency

---

## [v0.9.0] — 2026-04-16

### Ditambahkan — Phase 1C: Laporan Profit & Bulanan (Task 12.0)
- Halaman **Laporan** (`/reports`) — 2 tab: Laporan Profit & Laporan Bulanan
- Komponen `ReportFilters` — Filter periode (12 bulan terakhir), produk, status bayar
- Komponen `ProfitSummaryCards` (12.1) — 3 kartu: Total Revenue, Total Cost, Total Profit
  - Indikator pertumbuhan month-over-month (arrow + persentase hijau/merah)
- Komponen `ProfitMarginTable` (12.2) — Tabel margin per produk:
  - Kolom: Produk, Revenue, Cost, Profit, Margin %, Unit terjual
  - Baris total di footer, angka monospace JetBrains Mono
  - Style: no zebra stripe, gray border-bottom separator
- Komponen `MonthlyCharts` (12.3) — 3 chart interaktif:
  - **Bar chart**: Penjualan harian dalam 1 bulan
  - **Line chart**: Trend revenue & profit (dual line, dashed profit)
  - **Pie chart**: Distribusi produk (grayscale + blue aksen)
- Month-over-month comparison (12.4) — Growth % pada summary cards dan monthly summary
- Summary metrics (12.5) — 4 kartu: Total Revenue, Growth %, Best Seller, Avg Txns/Hari
- Formula baru `calcGrowthPercent` di `formulas.ts` (5.12)
- Translation keys namespace `reports` di `id.json` dan `en.json` (~40 keys per locale)
- Tab navigation underline style (monokrom, bukan pill/button)
- Data dari Supabase: query `sales` + `profit_calculations` + `products`, aggregate client-side
- Fully responsive: scroll pada mobile, grid layout desktop

### Diperbaiki
- Install `@types/jest` yang hilang dari devDependencies (pre-existing build error)

---

## [v0.8.1] — 2026-04-14

### Diperbaiki — Task 4.5: Verifikasi Bilingual (ID/EN)
- Ganti **100+ hardcoded strings** di 10 file komponen → `useTranslations()` dari next-intl
- Halaman yang diperbaiki: Dashboard, POS, Products, Recipes, Preorders, Settings
- Komponen yang diperbaiki: KpiCards, TransactionLists, SalesCharts, SaleForm, QuickSaleGrid, PreorderList
- Tambah **~30 translation keys baru** per locale di `id.json` dan `en.json`:
  - Namespace `dashboard`: overview, filter labels, KPI subtitles, transaction labels
  - Namespace `pos`: productCount
  - Namespace `products`: inventoryControl, totalProducts, toast messages
  - Namespace `recipes`: catalogProcurement, selectedProduct, activeCount/inactiveCount
  - Namespace `preorders`: paymentLabel
  - Namespace `settings`: rolesDesc, usersDesc, languageDesc, whatsappDesc

### Diperbaiki — Task 5.6: PWA Installability
- Tambah **ikon PWA** placeholder 192×192 dan 512×512 PNG di `public/icons/`
- Manifest `public/manifest.json` sudah valid mereferensi kedua ikon

---

## [v0.8.0] — 2026-04-11

### Ditambahkan — Phase 1C: Dashboard (Task 11.0)
- Halaman **Dashboard** (`/`) — Performance Hub dengan 6 KPI cards, 3 chart, tabel transaksi
- Komponen `KpiCards` (FR-006) — 6 kartu metrik: Total Revenue, Total Cost, Total Profit, Unpaid, Total Units, Transactions
  - Grid responsif: 2 kolom mobile, 3 tablet, 6 desktop
  - Monochrome style: outline border, no shadow, warna hanya pada angka status
- Komponen `SalesCharts` — 3 chart interaktif menggunakan Recharts:
  - **Bar chart** (FR-007): Distribusi penjualan per produk — horizontal bar, blue-700/80
  - **Donut chart** (FR-008): Bundling vs Non-Bundling — 2 warna (blue-700, slate-200), label persentase di tengah
  - **Stacked bar chart** (FR-009): Revenue harian per produk — 14 hari terakhir, grayscale palette
- Komponen `TransactionLists` (FR-011) — tabel Paid & Unpaid terpisah:
  - No zebra striping, gray border-bottom separator
  - Minimal status badges (dot + text), max 20 transaksi per tabel
- **Filter dropdowns** (FR-010): Status bayar (Sudah/Belum/All) + Produk selector
  - Filter mempengaruhi tabel transaksi
  - Tombol reset filter muncul saat filter aktif
- **Fully responsive** (FR-012): scroll vertikal mobile, grid layout desktop
- Data dari Supabase views: `dashboard_kpi`, `sales_by_product`, `bundling_ratio`, `daily_sales`

---

## [v0.7.0] — 2026-04-11

### Ditambahkan — Phase 1B: POS — Input Penjualan (Task 9.0)
- Halaman **POS / Quick Sale** (`/pos`) — input penjualan cepat dengan target < 30 detik per transaksi (US-011)
- Komponen `QuickSaleGrid` — grid produk 2 kolom mobile-first, tap +/- untuk atur jumlah:
  - Kartu produk: placeholder gambar, nama, harga, counter qty
  - Highlight biru saat produk terpilih (outline-blue-700/30)
  - Harga otomatis switch ke bundling_price saat mode bundling aktif
- Komponen `SaleForm` — form penjualan lengkap sesuai FR-013:
  - **Required fields:** Nama Pembeli, Tanggal (default hari ini), Produk (via grid), Jumlah, Bundling toggle, Status Bayar (segmented control Sudah/Belum)
  - **Optional fields (collapsible):** Menu Detail, Topping, Tipe Penjualan (Direct/Pre-order), Tanggal Pre-order (kondisional), Catatan
  - Ringkasan pesanan real-time — list produk terpilih, qty, subtotal
  - Sticky footer: total pembayaran + tombol "SIMPAN TRANSAKSI"
- **Auto price calculation** (Formula 5.1) — harga dihitung real-time setiap kali qty atau bundling toggle berubah
- **Dynamic bundling** (FR-015) — bundling toggle berlaku untuk semua produk yang punya bundling_price, bukan hanya Pannacotta 3-pack
- **Multi-produk per transaksi** — user bisa pilih beberapa produk sekaligus, tiap produk jadi 1 sale row
- **Submit flow:** Insert ke tabel sales → DB trigger otomatis:
  - `trg_calculate_profit` — hitung profit per transaksi (Formula 5.4)
  - `trg_deduct_stock_on_sale` — kurangi stok bahan dari BOM
  - `trg_upsert_customer` — auto-update database pelanggan
- **Toast sukses** dengan ringkasan: nama pembeli, produk, total harga, status bayar
- **Form auto-reset** setelah submit berhasil via key remount pattern
- Validasi form: nama wajib, minimal 1 produk, tanggal pre-order wajib jika tipe Pre-order

### Ditambahkan — Phase 1B: Pre-order Management (Task 10.0)
- Halaman **Pre-order Management** (`/preorders`) — daftar semua pre-order dengan filter status
- Komponen `PreorderList` — daftar pre-order dengan:
  - **Filter tabs:** All / Pending / Confirmed / Delivered / Cancelled (scrollable, badge count)
  - **Kartu pre-order:** avatar inisial, nama pembeli, produk × qty, tanggal pesan, tanggal ambil, total harga, status bayar
  - **Border warna per status:** amber (Pending), blue (Confirmed), emerald (Delivered), zinc (Cancelled)
  - **Tombol aksi kontekstual:** Pending → Konfirmasi/Batalkan, Confirmed → Tandai Delivered/Batalkan
- **Sale type field** sudah terintegrasi di SaleForm POS (Direct/Pre-order toggle + tanggal pre-order kondisional)
- **Mark as Delivered** (FR-059):
  - Update `pre_order_status = "Delivered"`
  - Update `payment_status = "Sudah"` → otomatis tercatat di laporan penjualan
  - DB trigger `trg_calculate_profit` recalculate profit otomatis
- Toast notifikasi per aksi status change

### Diperbarui — Translations
- `id.json` & `en.json`: 20+ key baru untuk modul POS + 20+ key baru untuk modul Pre-orders

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
