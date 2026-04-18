
@sessions/CLAUDE.sessions.md

# CLAUDE.md — Parissa POS System

> **⚠️ DOKUMEN PERMANEN** — Jangan ubah file ini kecuali PRD-Parissa juga diperbarui.
> Versi PRD yang menjadi acuan: **v2.2 (19 April 2026)** — revisi design direction ke "Crafted Minimalism"
> Repository: https://github.com/ricobowo/Parissa.git

---

## 1. Identitas Project

| Field | Value |
|-------|-------|
| **Project** | Parissa — Sistem Point of Sale (POS) |
| **Bisnis** | Dessert & Minuman Premium (Bandung) |
| **Status** | Active Development (bukan maintenance) |
| **Target Pengguna** | UMKM & retail kecil-menengah di Indonesia |
| **Bahasa UI** | Bahasa Indonesia (default) + English (i18n via next-intl) |
| **Data Source Awal** | Airtable Base "Parissa" (app8ia1T8kY7PqeHR) |

**Produk yang dijual:**
- Pannacotta: Vanilla (Rp20.000), Earl Grey (Rp20.000), Bundling 3pcs (Rp50.000)
- Fresh Creamy: Earl Grey (Rp28.000), Matcha (Rp28.000), Lotus (Rp28.000)

---

## 2. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js (App Router) + Tailwind CSS + shadcn/ui |
| **Backend** | Supabase (PostgreSQL + Auth + Edge Functions + Realtime) |
| **Hosting** | Vercel |
| **State Management** | TanStack Query (React Query) |
| **Notifikasi WA** | Fonnte (free tier) — prioritas akhir Phase 1 |
| **Export** | SheetJS (client-side Excel) |
| **PWA** | next-pwa |
| **i18n** | next-intl |

---

## 3. Konvensi Kode (WAJIB DIIKUTI)

- Gunakan **TypeScript strict mode** di semua file
- Komponen UI **wajib dari shadcn/ui**, jangan buat dari scratch
- Styling **hanya dengan Tailwind utility classes**, hindari CSS custom
- **Server Components** untuk data fetching; Client Components hanya jika perlu interaktivitas
- Semua query database melalui **TanStack Query** (`useQuery` / `useMutation`)
- Supabase client: server-side untuk SSR, client-side untuk realtime
- Validasi input dengan **Zod schema** di semua form
- **Error handling wajib** ada di setiap operasi async
- **Loading state** dan **empty state wajib** ada di setiap halaman data
- Semua komentar kode dalam **Bahasa Indonesia**
- Semua pesan error yang user-facing dalam **Bahasa Indonesia**
- Setiap file wajib punya **header versi** (lihat Rule 6)

---

## 4. Struktur Folder (Jangan Diubah)

```
app/
  (auth)/           # halaman login/register
  (dashboard)/      # halaman utama setelah login
  api/              # API routes jika diperlukan

components/
  ui/               # komponen shadcn/ui — JANGAN DIEDIT
  features/         # komponen per fitur bisnis
  shared/           # komponen reusable lintas fitur

lib/
  supabase/         # client dan helper Supabase
  queries/          # TanStack Query hooks
  utils/            # helper functions
  validations/      # Zod schemas
```

---

## 5. Rules Bisnis POS (WAJIB DIKETAHUI)

### 5.1 Transaksi
- Transaksi **tidak boleh dihapus**, hanya bisa di-void dengan alasan (soft delete only)
- Setiap perubahan tercatat di `audit_logs` (timestamp + user)
- Harga penjualan dihitung otomatis:
  ```
  IF is_bundling AND bundling_price EXISTS:
      sale_price = bundling_price × amount
  ELSE:
      sale_price = selling_price × amount
  ```

### 5.2 Profit (Hanya Transaksi "Sudah" Bayar)
```
IF payment_status == "Sudah":
    total_revenue = sale_price
    total_cost    = cost_per_unit × amount
    total_profit  = total_revenue - total_cost
ELSE (payment_status == "Belum"):
    total_revenue = 0
    total_cost    = cost_per_unit × amount
    total_profit  = 0 - total_cost
```

### 5.3 Cost Per Unit
```
cost_per_unit_ingredient = purchase_price / packaging_size
total_batch_cost = SUM(quantity_used[i] × cost_per_unit_ingredient[i])
cost_per_unit = total_batch_cost / pcs_per_batch
```

### 5.4 Profit Margin Per Produk
```
profit_margin_pct = ((selling_price - cost_per_unit) / cost_per_unit) × 100
```

### 5.5 Status Stok
```
IF qty_available <= minimum_stock_level:      → "Habis"   (MERAH)
ELSE IF qty_available <= (2 × min_stock):     → "Menipis" (KUNING)
ELSE:                                         → "Aman"    (HIJAU)
```

### 5.6 Waste Cost
```
waste_cost = waste_quantity × cost_per_unit
adjusted_profit = profit_from_sales - total_waste_cost
```

### 5.7 Daily Production Recommendation
```
recommended = CEIL((avg_sales_7d + pending_preorders - current_stock) / pcs_per_batch)
IF recommended < 0: recommended = 0
```

### 5.8 Pricing Calculator
```
min_selling_price = cost_per_unit / (1 - target_margin / 100)
```

### 5.9 Notifikasi WA (Anti-Spam)
```
suggested_qty = (avg_daily_usage_30d × 7) - qty_available
IF suggested_qty < 0: suggested_qty = 0
```
- Max **1× per hari per bahan** (tabel `stock_notifications` dengan UNIQUE constraint)
- Via Fonnte (free) — diimplementasikan di **Phase 1E** (prioritas akhir)

### 5.10 Piutang Overdue
- Transaksi "Belum" bayar lebih dari **3 hari** = "Overdue" (highlight kuning-oranye)

### 5.11 Format & Mata Uang
- Semua harga dalam **Rupiah (IDR)**
- Format tampilan: `Rp 1.000.000` (titik sebagai pemisah ribuan)
- Angka monospace: font JetBrains Mono 13px

---

## 6. Design System — "Crafted Minimalism"

### 6.1 Filosofi
Referensi visual: **Zentra / Linear / Stripe Dashboard** — premium SaaS modern.
Monokrom sebagai basis + aksen fungsional + **subtle depth** (layering, shadow ringan, radius besar, display-scale typography). Content-first tetap, tapi dengan "kerajinan" visual: setiap surface punya hierarchy yang terasa, interaksi punya micro-motion, angka hero punya presence.

**Prinsip:**
- **Layering** — 3 tingkat bg (app → surface → elevated card). Card benar-benar terangkat dari background via shadow ringan + bg lebih terang.
- **Friendly radius** — card `14px`, container besar `18px`, chip/icon button full pill. Tidak kaku.
- **Display-scale hero** — metric penting pakai angka besar (28–48px), bukan 20px seperti sebelumnya.
- **Purposeful color** — aksen biru/pink/teal boleh muncul di chart multi-series, progress bar, insight card. Tapi untuk status/aksi tetap semantic (success/warning/danger).
- **Micro-motion** — semua interaktif punya transisi `motion-fast` (120ms) atau `motion-base` (180ms) dengan `ease-out`.
- **Mobile-first** — desain 360px dulu, lalu tablet & desktop. Interaksi thumb-friendly.
- **Token-only** — komponen dilarang hardcode warna/radius/shadow. Semua via CSS variables.

### 6.2 Design Tokens (lihat `src/app/globals.css`)

**Base & layering:**
```css
--color-bg:             #EFEEEC;   /* app bg (soft off-white) */
--color-bg-secondary:   #F5F4F2;   /* panel/sub-surface */
--color-bg-elevated:    #FFFFFF;   /* card (terangkat) */
--color-bg-hover:       #EDECE9;
--color-border:         #E5E4E1;
--color-border-strong:  #D8D7D3;
--color-text:           #161615;
--color-text-secondary: #6A6A68;
--color-text-tertiary:  #9A9A97;
```

**Aksen fungsional (status/aksi):**
```css
--color-accent:    #2F6FEB;   /* biru — tombol/link utama */
--color-success:   #0E8345;   /* hijau — "Sudah", "Aman" */
--color-warning:   #D9730D;   /* oranye — "Menipis", overdue */
--color-danger:    #DC3545;   /* merah — "Habis", error */
```

**Chart palette (muted accent, untuk data visualization):**
```css
--chart-primary:     #3B82F6;
--chart-secondary:   #93C5FD;
--chart-tertiary:    #BEDBFF;
--chart-accent-pink: #EC4899;
--chart-accent-teal: #14B8A6;
--chart-neutral:     #9CA3AF;
```

**Radius (Zentra-scale):**
```css
--radius-sm:   8px;     /* badge kecil */
--radius-md:   10px;    /* input, button */
--radius-lg:   14px;    /* card standar */
--radius-xl:   18px;    /* hero card / container besar */
--radius-pill: 9999px;  /* chip, icon button, nav pill */
```

**Shadow (soft, untuk elevation bukan dekorasi):**
```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.04);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04);
--shadow-md: 0 4px 12px -2px rgb(0 0 0 / 0.08);
--shadow-lg: 0 12px 28px -4px rgb(0 0 0 / 0.10);
```

**Motion:**
```css
--motion-fast:   120ms;
--motion-base:   180ms;
--motion-slow:   280ms;
--ease-out:      cubic-bezier(0.16, 1, 0.3, 1);
```

### 6.3 Tipografi
| Style | Size (mobile → desktop) | Weight | Penggunaan |
|-------|------------------------|--------|------------|
| Display LG | — / 48px | 600 | Hero metric card (angka utama Gross Volume, dll) |
| Display MD | 28px / 36px | 600 | Judul halaman (H1 PageHeader) |
| Display SM | — / 28px | 600 | Hero number di KPI penting |
| Heading 2 | 18px | 600 | Judul section/card |
| Heading 3 | 14px | 500 | Label grup |
| Body | 14px | 400 | Teks umum, tabel |
| Caption | 12px | 400 | Keterangan, timestamp |
| Micro-label | 11px | 500 | Label uppercase (tracking 0.12em) |
| Monospace | 13px | 400 | Angka Rupiah (JetBrains Mono, tabular-nums) |

Font family: **Inter** (atau system font stack).
Tracking: display scale pakai `letter-spacing: -0.02em`; uppercase label pakai `+0.12em`.

### 6.4 Komponen
- **Card** — `bg-bg-elevated`, border 1px `--color-border`, **radius 14px**, `shadow-xs`. Hover: `shadow-sm` (transition motion-base).
- **Hero card** — radius 18px, bisa pakai `shadow-md`. Boleh background gradient muted untuk 1 "insight card" per halaman (§6.4.1 di bawah).
- **Button primary** — `bg-accent`, teks putih, radius 10px, `shadow-xs`. Hover `bg-accent-hover`. Max 1 tombol aksen per view.
- **Button secondary / outline** — border 1px, bg transparan, radius 10px.
- **Icon button** — square 32/36px, `rounded-pill`, hover `bg-bg-hover`.
- **Nav pill** — rounded-pill, aktif = bg hitam + teks putih (mirip Zentra "Home" tab); inaktif = teks secondary.
- **Input / Select** — radius 10px, border 1px `--color-border`. Focus: ring 2px `--color-accent` alpha 0.2.
- **Badge status** — dot 6px + teks (bukan pill berwarna penuh). 3 varian semantik: success/warning/danger.
- **Chip / Tag** — rounded-pill, bg `--color-bg-secondary`, teks secondary, padding 4px 10px.
- **Tabel** — tanpa zebra stripe, header micro-label uppercase `--color-text-secondary`, row hover `bg-bg-hover/40`.
- **Toast** — pojok kanan bawah, radius 12px, `shadow-md`.
- **Chart** — stacked/multi-series boleh pakai `--chart-*` palette. Single series pakai `--chart-primary` atau neutral. Line chart tipis (2px stroke), bar chart dengan rounded top (4px).

#### 6.4.1 Insight Card (opsional)
Boleh ada **maksimal 1 per halaman** — bg gradient soft (biru→pink→orange) dengan radius-xl, untuk surface "Insight / Recommendation" atau headline metric. Contoh use case: ringkasan AI recommendation, daily production alert utama.

### 6.5 Layout & Navigasi
- **Desktop** — sidebar kiri 240px (collapsible 60px), bg `--color-bg-secondary`, border kanan halus. Max-width konten 1040px, padding 24px.
- **Mobile** — bottom tab bar 4–5 tab sesuai role, padding 16px.
- **Quick-sale grid** — 2 kolom mobile, 3 kolom tablet, form samping desktop.
- **Spacing scale** — gap antar section: 24px mobile / 32px desktop. Padding card: 16–20px (density Zentra).
- **Mobile-first** — desain mulai 360px, diperluas ke 768px dan 1024px+. Thumb-friendly.

### 6.6 Dark Mode
Aktif via class `.dark` di `<html>` (next-themes). Semua token punya pasangan dark (lihat `globals.css`). Prinsip parity:
- `--color-bg` lebih gelap dari `--color-bg-elevated` (layering tetap terasa)
- Shadow alpha lebih tinggi (0.3–0.6) supaya elevation tetap terbaca
- Aksen sedikit lebih cerah (kontras WCAG AA minimum 4.5:1)
- Chart palette sedikit di-brighten

---

## 7. Fitur & Functional Requirements (Ringkasan)

### Phase 1A — Foundation
- Auth (email + password), flexible role management (JSONB permissions, tidak hardcode)
- Default roles: Owner, Kasir, Produksi, Admin Keuangan (bisa diubah/ditambah/dihapus)
- i18n bilingual (ID default/EN), PWA, layout sidebar + bottom tabs

### Phase 1B — Core POS & Produk
- POS Form: Required (Nama Pembeli, Tanggal, Produk, Jumlah, Bundling, Status Bayar) + Optional (Menu detail, Topping, Tipe Penjualan, Tanggal Pre-order, Catatan)
- Quick-sale grid mobile (2×3 kartu produk, tap to add, +/-)
- Harga & profit auto-calculated, bundling dinamis
- Manajemen Produk CRUD (soft delete), Resep/BOM CRUD, Pricing Calculator
- Pre-Order management

### Phase 1C — Dashboard & Laporan
- 6 kartu metrik: Total Revenue, Total Cost, Total Profit, Unpaid, Total Purchase Amount, Total Transactions
- Charts: Bar distribusi produk, Donut bundling vs non-bundling, Stacked bar revenue over time
- Filter: status bayar, produk, periode
- Tabel transaksi Paid dan Unpaid terpisah
- Laporan profit + laporan bulanan + export Excel (.xlsx)

### Phase 1D — Stok, Batching, Pelanggan
- Stok & Bahan Baku: list, status otomatis, auto-deduct saat penjualan/batching
- Purchase/Restock CRUD + auto-update stok
- Batching CRUD + Expiry Tracker (kalender, H-3 & H-1 berwarna) + alert expired
- Daily Production Planner (di dashboard Produksi)
- Customer Database (auto-populate dari transaksi), label VIP, histori pembelian
- Waste/Spoilage Tracking
- Simple CRM: highlight overdue, tandai "Sudah difollow-up" / "Bad debt"
- Audit Trail

### Phase 1E — Polish & WhatsApp
- Riwayat Transaksi: search + filter
- Notifikasi WhatsApp via Fonnte (stok Menipis/Habis, max 1×/hari/bahan)
- Testing, bug fix, UAT, deploy production

### Out of Scope (Tidak Pernah Diimplementasikan)
Multi-outlet, marketplace integration, payment gateway, loyalty program, barcode scanning, tracking pengiriman, manajemen supplier, aplikasi native mobile.

### Next Phase (Phase 2)
Forecasting stok, auto-PO, analitik lanjutan (cohort, CLV), retur/refund, multiple payment method tracking detail.

---

## 8. Database Schema (Tabel Utama)

```
roles              — id, name, name_en, permissions (JSONB), is_system
users              — id, email, name, phone, role_id, language, is_active
products           — id, name, selling_price, bundling_price, is_bundling, is_active, image_url
ingredients        — id, name, purchase_unit, supplier, purchase_price, packaging_size, minimum_stock_level, quantity_available
recipes            — id, product_id, ingredient_id, quantity_per_batch, pcs_per_batch
sales              — id, date, customer_name, product_id, amount, is_bundling, menu_detail, topping, sale_price, payment_status, sale_type, pre_order_date, pre_order_status, notes, created_by
profit_calculations — id, sale_id (UNIQUE), total_revenue, total_cost, total_profit
batches            — id, product_id, batch_number, batch_date, batch_quantity, expiration_date, status, notes, created_by
purchases          — id, ingredient_id, qty_purchased, price_paid, supplier, date, notes, created_by
customers          — id, name (UNIQUE), phone, label, total_transactions, total_spending, first_purchase_date, last_purchase_date
waste_logs         — id, product_id, quantity, reason, waste_cost, date, created_by
audit_logs         — id, table_name, record_id, action, old_values (JSONB), new_values (JSONB), changed_by, changed_at
stock_notifications — id, ingredient_id, notification_date, status, sent_at — UNIQUE(ingredient_id, notification_date)
```

**Catatan schema:**
- Semua tabel menggunakan UUID primary key (`gen_random_uuid()`)
- Supabase Auth + RLS per role
- Setiap perubahan schema **wajib** dibuatkan migration file

---

## 9. Success Metrics

| Metrik | Target |
|--------|--------|
| Waktu input penjualan | < 30 detik |
| Akurasi profit | Selisih < 1% vs manual |
| Kehabisan stok | Turun 80% dalam 3 bulan |
| Adopsi tim | 100% dalam 2 minggu |
| Dashboard load | < 2 detik (4G) |
| Pre-order fulfillment | > 95% tepat waktu |
| Piutang overdue | Turun 50% dalam 2 bulan |

---

## 10. Working Rules Claude (WAJIB)

### RULE 1 — EXPLAIN BEFORE DOING
Sebelum edit file: sebutkan nama file + bagian + alasan. Tunggu konfirmasi.
**Exception:** Jika Rico bilang "lanjutkan" / "kerjakan" / "sudah dikonfirmasi" — skip konfirmasi untuk sesi itu.

### RULE 2 — COMMAND TRANSPARENCY
Format setiap terminal command:
```
COMMAND RUNNING: $ <command>
WHAT IT DOES:    <penjelasan>
RESULT:          ✅/❌ <hasil>
```

### RULE 3 — SESSION SUMMARY
Di akhir setiap sesi:
```
SESSION SUMMARY — [tanggal]
Files changed:        [list]
What was added:       [deskripsi]
What was fixed:       [deskripsi]
What was removed:     [deskripsi]
Current version:      vX.Y.Z
Next suggested steps: [list]
```

### RULE 4 — NEVER GIT PUSH
Jangan pernah jalankan `git push`.
Katakan: "Ready to push. Please follow the GitHub upload steps."

### RULE 5 — ALWAYS UPDATE CHANGELOG
Setiap perubahan: update `CHANGELOG.md`, bump version, update file `VERSION`.

### RULE 6 — VERSION HEADER + KOMENTAR BAHASA INDONESIA
Setiap file baru harus punya header versi, contoh:
```typescript
/**
 * @file   NamaFile.tsx
 * @version 1.0.0
 * @description Deskripsi singkat file ini
 */
```
Semua komentar kode dalam Bahasa Indonesia.

### RULE 7 — TANYA JIKA AMBIGU
Selalu tanya jika ada ambiguitas sebelum mulai coding. Buat rencana (plan) terlebih dahulu sebelum menulis kode.

### RULE 8 — MIGRATION WAJIB
Jika mengubah schema database, selalu buat migration file terpisah — jangan langsung edit schema.

### RULE 9 — TRI-STATE UI
Setiap fitur baru wajib dilengkapi: **loading state**, **error state**, **empty state**.

### RULE 10 — ALWAYS UPDATE README BEFORE PUSH
Setiap commit final sebelum siap-push (akhir fase/fitur), **wajib update `README.md`**:
- Sinkronkan **versi saat ini** dengan `VERSION` & `CHANGELOG.md`
- Centang / tambahkan item di **Progress Phase 1**
- Update **Tech Stack** bila ada dependency baru
- Update **Struktur Folder** bila ada perubahan signifikan
- README.md adalah **"living document"** — terus direvisi sampai project selesai
- Laporkan update README di `SESSION SUMMARY` (RULE 3)

---

## 11. Development Timeline

| Phase | Waktu | Fokus |
|-------|-------|-------|
| 1A | 28 Apr – 11 Mei | Foundation: setup, auth, i18n, PWA, layout |
| 1B | 12 – 25 Mei | Core POS, produk, resep, pre-order |
| 1C | 26 Mei – 8 Jun | Dashboard, laporan, export Excel |
| 1D | 9 – 22 Jun | Stok, batching, pelanggan, CRM, audit |
| 1E | 23 Jun – 6 Jul | Polish, WhatsApp notif, testing, deploy |

**Target selesai Phase 1: awal Juli 2026**

---

*File ini di-generate dari PRD-Parissa v2.1 (10 April 2026). Perbarui hanya jika PRD diperbarui.*