# Changelog — Parissa POS

Semua perubahan penting pada proyek ini didokumentasikan di file ini.

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
