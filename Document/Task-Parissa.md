## Relevant Files

- `src/app/layout.tsx` - Root layout with providers (auth, i18n, theme, query client)
- `src/app/[locale]/page.tsx` - Dashboard page (locale-aware routing for bilingual)
- `src/app/[locale]/pos/page.tsx` - POS / Quick Sale page
- `src/app/[locale]/products/page.tsx` - Product management page
- `src/app/[locale]/recipes/page.tsx` - Recipe/BOM management page
- `src/app/[locale]/stock/page.tsx` - Stock & ingredients page
- `src/app/[locale]/batching/page.tsx` - Batching / production page
- `src/app/[locale]/purchases/page.tsx` - Purchase / restock page
- `src/app/[locale]/reports/page.tsx` - Profit & monthly reports page
- `src/app/[locale]/customers/page.tsx` - Customer database page
- `src/app/[locale]/settings/page.tsx` - Settings (roles, users, language, WA config)
- `src/app/[locale]/preorders/page.tsx` - Pre-order management page
- `src/components/ui/` - shadcn/ui components directory
- `src/components/pos/QuickSaleGrid.tsx` - Mobile quick-sale grid component
- `src/components/pos/SaleForm.tsx` - Full sale form component
- `src/components/dashboard/KpiCards.tsx` - Dashboard KPI metric cards
- `src/components/dashboard/SalesCharts.tsx` - Dashboard charts (bar, donut, stacked)
- `src/components/dashboard/TransactionLists.tsx` - Paid/Unpaid transaction tables
- `src/components/layout/Sidebar.tsx` - Desktop sidebar navigation
- `src/components/layout/BottomTabs.tsx` - Mobile bottom tab navigation
- `src/lib/supabase/client.ts` - Supabase client configuration
- `src/lib/supabase/server.ts` - Supabase server-side client
- `src/lib/supabase/middleware.ts` - Auth middleware
- `src/lib/formulas.ts` - All calculation formulas (Section 5 of PRD)
- `src/lib/formulas.test.ts` - Unit tests for all formulas
- `src/lib/export.ts` - Excel export utility (SheetJS)
- `src/lib/export.test.ts` - Unit tests for export
- `src/lib/i18n/id.json` - Indonesian translations
- `src/lib/i18n/en.json` - English translations
- `src/types/index.ts` - TypeScript type definitions for all entities
- `supabase/migrations/001_initial_schema.sql` - Database schema migration
- `supabase/migrations/002_seed_data.sql` - Seed data from Airtable migration
- `supabase/functions/stock-alert/index.ts` - Edge function for WA stock alerts
- `public/manifest.json` - PWA manifest
- `next.config.js` - Next.js config (PWA, i18n)
- `CHANGELOG.md` - Project changelog
- `VERSION` - Current version number

### Notes

- Unit tests should be placed alongside code files (e.g., `formulas.ts` and `formulas.test.ts`)
- Use `npx jest [optional/path/to/test/file]` to run tests
- All code comments must be in Bahasa Indonesia (RULE 6)
- Every file must have a version header (RULE 6)
- Never run `git push` — say "Ready to push" instead (RULE 4)

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

### Phase 1A — Foundation (Minggu 1-2)

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch: `git checkout -b feature/parissa-pos-mvp`
  - [x] 0.2 Create `CHANGELOG.md` and `VERSION` file (initial version v0.1.0)

- [x] 1.0 Setup project: Next.js + Supabase + Vercel
  - [x] 1.1 Initialize Next.js project with TypeScript, Tailwind CSS, App Router
  - [x] 1.2 Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `shadcn/ui`, `@tanstack/react-query`, `next-intl`, `next-pwa`, `recharts`, `xlsx`
  - [x] 1.3 Configure Supabase client (`src/lib/supabase/client.ts` dan `server.ts`)
  - [x] 1.4 Setup shadcn/ui with monochrome Notion-style theme — define all colors as CSS variables/design tokens in one file (globals.css), base palette black-white-gray, accent colors only for function (status, alerts, primary actions)
  - [x] 1.5 Configure Vercel deployment (connect GitHub repo)
  - [x] 1.6 Create `public/manifest.json` for PWA
  - [x] 1.7 Configure `next.config.js` for PWA and i18n
  - [x] 1.8 Update CHANGELOG.md

- [x] 2.0 Database schema & migrations
  - [x] 2.1 Create `supabase/migrations/001_initial_schema.sql` with all tables from PRD Section 8.2 (roles, users, products, ingredients, recipes, sales, profit_calculations, batches, purchases, customers, waste_logs, audit_logs, stock_notifications)
  - [x] 2.2 Create database triggers: auto-calculate profit on sale insert, auto-deduct stock on sale, auto-upsert customer on sale, auto-update stock on purchase
  - [x] 2.3 Setup Row Level Security (RLS) policies per role
  - [x] 2.4 Create database views for dashboard KPIs (total revenue, cost, profit, unpaid)
  - [x] 2.5 Run migration and verify schema in Supabase dashboard
  - [x] 2.6 Update CHANGELOG.md

- [x] 3.0 Auth + flexible role management
  - [x] 3.1 Setup Supabase Auth (email + password)
  - [x] 3.2 Create login page (`src/app/[locale]/login/page.tsx`)
  - [x] 3.3 Create auth middleware (`src/lib/supabase/middleware.ts`) — redirect unauthenticated users
  - [x] 3.4 Seed default roles (Owner, Kasir, Produksi, Admin Keuangan) with default permissions JSONB
  - [x] 3.5 Create Settings > Role Management page — CRUD roles, edit permission matrix per modul
  - [x] 3.6 Create Settings > User Management page — add/edit/deactivate users, assign roles
  - [x] 3.7 Implement role-based navigation (show/hide menu items based on permissions)
  - [x] 3.8 Update CHANGELOG.md

- [x] 4.0 i18n bilingual setup (ID/EN)
  - [x] 4.1 Configure next-intl with `id` and `en` locales
  - [x] 4.2 Create translation files: `src/lib/i18n/id.json` and `en.json` (all UI labels, placeholders, error messages, button text)
  - [x] 4.3 Create language toggle component in header
  - [x] 4.4 Save language preference to user profile in database
  - [x] 4.5 Verify all pages render correctly in both languages
  - [x] 4.6 Update CHANGELOG.md

- [x] 5.0 PWA setup + layout + base UI
  - [x] 5.1 Configure next-pwa service worker and manifest
  - [x] 5.2 Create responsive layout: Sidebar for desktop (`src/components/layout/Sidebar.tsx`), BottomTabs for mobile (`src/components/layout/BottomTabs.tsx`)
  - [x] 5.3 Implement role-based navigation — different menu items per role
  - [x] 5.4 Ensure all colors use CSS variables (dark mode ready) — dark mode toggle NOT implemented in Phase 1, only the code structure is prepared
  - [x] 5.5 Create shared components (minimalist, monochrome): page header, loading skeleton, empty state, toast notifications — no shadows, no decorative colors, generous whitespace
  - [x] 5.6 Test PWA installability on Android/iOS
  - [x] 5.7 Update CHANGELOG.md

- [x] 6.0 Migrasi data dari Airtable
  - [x] 6.1 Export semua 9 tabel Airtable ke CSV
  - [x] 6.2 Create migration script (`supabase/migrations/002_seed_data.sql`) — transform Airtable data ke schema baru
  - [x] 6.3 Map Airtable Linked Records ke Foreign Keys
  - [x] 6.4 Verify migrated data: 6 produk, 18 bahan baku, 54 transaksi, 9 batch
  - [x] 6.5 Update CHANGELOG.md

### Phase 1B — Core POS & Products (Minggu 3-4)

- [x] 7.0 Manajemen Produk
  - [x] 7.1 Create products list page with table (nama, harga, cost, margin, status)
  - [x] 7.2 Create add/edit product form (modal or page)
  - [x] 7.3 Implement soft delete (is_active = false)
  - [x] 7.4 Connect product to Recipe/BOM display
  - [x] 7.5 Update CHANGELOG.md

- [x] 8.0 Resep/BOM & Pricing Calculator
  - [x] 8.1 Create recipe page per product — list ingredients, qty, cost per ingredient, total cost
  - [x] 8.2 Implement CRUD for recipe items (add/remove ingredient, change qty)
  - [x] 8.3 Auto-recalculate cost_per_unit and profit_margin when recipe changes
  - [x] 8.4 Create Pricing Calculator component — input target margin %, output min selling price (Formula 5.11)
  - [x] 8.5 Create and run unit tests for all BOM calculation formulas (`src/lib/formulas.test.ts`)
  - [x] 8.6 Update CHANGELOG.md

- [x] 9.0 POS — Input Penjualan
  - [x] 9.1 Create sale form with required/optional fields as defined in FR-013
  - [x] 9.2 Create QuickSaleGrid component for mobile — 2x3 product grid, tap to add, +/- quantity
  - [x] 9.3 Implement auto price calculation (Formula 5.1) — client-side, real-time update
  - [x] 9.4 Implement dynamic bundling — allow any combination, not just Pannacotta 3-pack
  - [x] 9.5 On submit: save to sales table, trigger profit calculation (Formula 5.4), trigger stock deduction
  - [x] 9.6 Show success toast with summary (product, amount, price)
  - [ ] 9.7 Test on mobile device — verify quick-sale flow < 30 seconds
  - [x] 9.8 Update CHANGELOG.md

- [x] 10.0 Pre-order management
  - [x] 10.1 Add sale_type field to POS form (Direct/Pre-order)
  - [x] 10.2 Create pre-order list page — filter by status (Pending/Confirmed/Delivered/Cancelled)
  - [x] 10.3 Allow status change from list (mark as Delivered → auto-record in sales report)
  - [x] 10.4 Update CHANGELOG.md

### Phase 1C — Dashboard & Reports (Minggu 5-6)

- [x] 11.0 Dashboard
  - [x] 11.1 Create 6 KPI cards component (Revenue, Cost, Profit, Unpaid, Total Units, Total Txns) — monochrome style (gray border, no colored background), color only on numbers/status badges via CSS variables
  - [x] 11.2 Create filter dropdowns (payment status, product)
  - [x] 11.3 Create bar chart: Sales Distribution By Product — default grayscale palette, product colors muted/pastel
  - [x] 11.4 Create donut chart: Bundling vs Non-Bundling — 2 shades of gray (dark/light), no vivid colors
  - [x] 11.5 Create stacked bar chart: Sales Revenue Over Time — grayscale default, product colors as minimal differentiators only
  - [x] 11.6 Create Paid/Unpaid transaction detail tables — no zebra striping, gray border-bottom row separator, minimal status badges (small colored dot + text, not full colored pill)
  - [x] 11.7 Make dashboard fully responsive (scroll cards mobile, grid desktop)
  - [x] 11.8 Update CHANGELOG.md

- [x] 12.0 Laporan Profit & Bulanan
  - [x] 12.1 Create profit report page — Total Revenue, Cost, Profit with filters (period, product, payment status)
  - [x] 12.2 Create profit margin per product table
  - [x] 12.3 Create monthly report page — bar chart daily sales, line chart revenue+profit trend, pie chart product distribution
  - [x] 12.4 Implement month-over-month comparison (this month vs last month, growth %)
  - [x] 12.5 Create summary metrics: total revenue, growth %, best seller, avg daily transactions
  - [x] 12.6 Update CHANGELOG.md

- [x] 13.0 Export ke Excel
  - [x] 13.1 Install and configure SheetJS (xlsx library)
  - [x] 13.2 Create export utility (`src/lib/export.ts`) — accepts data array, generates .xlsx with Rupiah formatting
  - [x] 13.3 Add "Export ke Excel" button to all report pages
  - [x] 13.4 Ensure export respects active filters
  - [x] 13.5 Write unit tests for export utility
  - [x] 13.6 Update CHANGELOG.md

### Phase 1D — Stock, Batching, Customer (Minggu 7-8)

- [x] 14.0 Stock & Bahan Baku
  - [x] 14.1 Create ingredients list page — name, qty, unit, status (Aman/Menipis/Habis), min level
  - [x] 14.2 Implement auto status calculation (Formula 5.6) with color indicators
  - [x] 14.3 Implement auto stock deduction on sale (based on BOM × qty sold)
  - [x] 14.4 Implement auto stock increase on purchase/restock
  - [x] 14.5 Write unit tests for stock formulas
  - [x] 14.6 Update CHANGELOG.md

- [x] 15.0 Purchase / Restock
  - [x] 15.1 Create purchase form — ingredient, qty, price, supplier, date, notes
  - [x] 15.2 Auto-calculate cost per unit (Formula 5.7)
  - [x] 15.3 Auto-update ingredient stock after purchase
  - [x] 15.4 Create purchase history page with filters (ingredient, supplier, date range)
  - [x] 15.5 Update CHANGELOG.md

- [x] 16.0 Batching & Expiry Tracker
  - [x] 16.1 Create batch form — product, qty, production date, expiry date, status, notes
  - [x] 16.2 Auto-deduct ingredient stock on batch creation (BOM × batch qty)
  - [x] 16.3 Create batch list with status management (Planned → In Progress → Completed → Expired)
  - [x] 16.4 Create Expiry Tracker calendar view — highlight H-3 (yellow) and H-1 (red)
  - [x] 16.5 Show expiry alerts on dashboard
  - [x] 16.6 Update CHANGELOG.md

- [ ] 17.0 Daily Production Planner
  - [ ] 17.1 Calculate avg sales per product (last 7 days) + pending pre-orders
  - [ ] 17.2 Apply Formula 5.10 to recommend batch quantities
  - [ ] 17.3 Display recommendation card on production staff dashboard
  - [ ] 17.4 Update CHANGELOG.md

- [ ] 18.0 Customer Database & CRM
  - [ ] 18.1 Auto-populate customers table from sales (upsert on customer_name)
  - [ ] 18.2 Create customer list page — name, total txns, total spending, favorite product, last purchase
  - [ ] 18.3 Allow label assignment (VIP, Regular, custom labels)
  - [ ] 18.4 Create overdue payment list — transactions "Belum" > 3 days (FR-054)
  - [ ] 18.5 Allow marking as "Followed-up" or "Bad debt"
  - [ ] 18.6 Update CHANGELOG.md

- [ ] 19.0 Waste Tracking & Audit Trail
  - [ ] 19.1 Create waste log form — product, qty, reason (Expired/Damaged/Sample/Other), date
  - [ ] 19.2 Auto-calculate waste cost (Formula 5.9)
  - [ ] 19.3 Include waste in profit reports (adjusted_profit = profit - waste_cost)
  - [ ] 19.4 Implement audit trail — log INSERT/UPDATE/DELETE on key tables with old/new values
  - [ ] 19.5 Create transaction history page with search and filters
  - [ ] 19.6 Update CHANGELOG.md

### Phase 1E — Polish & WhatsApp (Minggu 9-10)

- [ ] 20.0 Notifikasi WhatsApp via Fonnte (PRIORITAS AKHIR)
  - [ ] 20.1 Create Supabase Edge Function `stock-alert` — triggered by stock status change
  - [ ] 20.2 Integrate with Fonnte free API — send message to owner phone number
  - [ ] 20.3 Message content: ingredient name, qty left, min level, suggested purchase (Formula 5.8)
  - [ ] 20.4 Implement anti-spam: max 1 notification per ingredient per day (stock_notifications table)
  - [ ] 20.5 Create WA configuration page in Settings (phone number, enable/disable)
  - [ ] 20.6 Update CHANGELOG.md

- [ ] 21.0 Testing & Deployment
  - [ ] 21.1 End-to-end testing: complete sale flow (POS → profit calc → stock deduction → dashboard update)
  - [ ] 21.2 End-to-end testing: batch creation → stock deduction → expiry tracking
  - [ ] 21.3 End-to-end testing: purchase → stock increase → status update
  - [ ] 21.4 Mobile responsive testing on 3+ devices (small phone, large phone, tablet)
  - [ ] 21.5 Bilingual testing — verify all pages in ID and EN
  - [ ] 21.6 Performance testing — dashboard load < 2s on 4G
  - [ ] 21.7 Bug fixing and polish
  - [ ] 21.8 User acceptance testing with Rico + team
  - [ ] 21.9 Deploy to Vercel production
  - [ ] 21.10 Final CHANGELOG.md and VERSION update (v1.0.0)