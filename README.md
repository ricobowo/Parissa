# Parissa — Point of Sale (POS)

> Sistem Point of Sale untuk bisnis dessert & minuman premium (Bandung).
> Dibangun untuk UMKM & retail kecil-menengah di Indonesia.

**Branch:** `feature/parissa-pos-mvp`
**Versi saat ini:** `v0.15.0`
**Status:** 🚧 Active Development — Phase 1 (Target selesai: awal Juli 2026)
**Repository:** https://github.com/ricobowo/Parissa.git

---

## 📖 Tentang Project

Parissa adalah POS web-based yang fokus pada kemudahan pencatatan transaksi, tracking stok & batching, serta laporan profit yang akurat. Dirancang mobile-first agar bisa dipakai satu tangan di toko, dan siap jadi PWA untuk dipasang seperti aplikasi native.

**Produk yang dikelola:**
- Pannacotta — Vanilla, Earl Grey, Bundling 3pcs
- Fresh Creamy — Earl Grey, Matcha, Lotus

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + Tailwind CSS v4 + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions + Realtime) |
| State | TanStack Query (React Query) |
| i18n | next-intl (ID default / EN) |
| PWA | @ducanh2912/next-pwa |
| Charts | Recharts |
| Export | SheetJS (xlsx) |
| Notifikasi WA | Fonnte (Phase 1E) |
| Hosting | Vercel |
| Testing | Jest + ts-jest |

---

## 🚀 Getting Started

### Prasyarat
- Node.js 20+
- npm / pnpm / yarn
- Akun Supabase (untuk environment variables)

### Instalasi

```bash
# Clone repository
git clone https://github.com/ricobowo/Parissa.git
cd Parissa

# Checkout branch MVP
git checkout feature/parissa-pos-mvp

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# lalu isi NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, dll.

# Jalankan dev server
npm run dev
```

Akses di: [http://localhost:3000](http://localhost:3000)

### Scripts

| Script | Fungsi |
|--------|--------|
| `npm run dev` | Jalankan dev server |
| `npm run build` | Build production |
| `npm run start` | Jalankan server production |
| `npm run lint` | Jalankan ESLint |

---

## 📁 Struktur Folder

```
src/
  app/
    (auth)/         # halaman login/register
    (dashboard)/    # halaman utama setelah login
    api/            # API routes
  components/
    ui/             # komponen shadcn/ui — jangan diedit manual
    features/       # komponen per fitur bisnis
    shared/         # komponen reusable lintas fitur
  lib/
    supabase/       # client & helper Supabase
    queries/        # TanStack Query hooks
    utils/          # helper functions
    validations/    # Zod schemas

supabase/           # migration files & SQL
public/             # asset statis & icon PWA
sessions/           # cc-sessions task files
```

---

## ✅ Progress Phase 1

- [x] **Phase 1A — Foundation** — Auth, role management, i18n, PWA, layout
- [x] **Phase 1B — Core POS & Produk** — POS form, quick-sale grid, produk CRUD, resep, pre-order
- [x] **Phase 1C — Dashboard & Laporan** — Metrik, charts, export Excel, laporan bulanan
- [x] **Phase 1D — Stok, Batching, Planner** — Stok, purchase, batching, expiry tracker, daily production planner (Formula 5.10)
- [x] **Phase 1D (lanjutan)** — Customer database & CRM (label, overdue, follow-up history), waste tracking (Formula 5.9 + adjusted profit), audit trail 10 tabel, riwayat transaksi
- [~] **Phase 1E — Polish & WhatsApp** — Notif Fonnte WA via Edge Function + cron harian (Task 20 ✅) · UAT & deploy production (Task 21 pending)

Detail changelog: [CHANGELOG.md](./CHANGELOG.md)
Detail rules & arsitektur: [CLAUDE.md](./CLAUDE.md)

---

## 🧭 Rules Bisnis Utama

- Transaksi **tidak bisa dihapus** — hanya void dengan alasan (soft delete)
- Profit hanya dihitung untuk transaksi dengan status bayar **"Sudah"**
- Status stok otomatis: **Habis** / **Menipis** / **Aman** berdasarkan `minimum_stock_level`
- Piutang > 3 hari ditandai **Overdue**
- Notifikasi WhatsApp anti-spam: max 1×/hari/bahan
- Semua mata uang dalam **Rupiah (IDR)** dengan format `Rp 1.000.000`

Lihat [CLAUDE.md](./CLAUDE.md) section 5 untuk formula lengkap.

---

## 🎨 Design System

Filosofi: **minimalis seperti Notion** — monokrom, content-first, whitespace generous. Warna hanya untuk fungsi (status, alert, aksi). Font: Inter + JetBrains Mono untuk angka.

Design tokens didefinisikan sebagai CSS variables — komponen tidak boleh hardcode warna.

---

## 🌐 Bahasa

- **Default:** Bahasa Indonesia
- **Sekunder:** English
- Switcher tersedia di header, preferensi user disimpan di kolom `users.language`

---

## 📊 Database

Tabel utama: `roles`, `users`, `products`, `ingredients`, `recipes`, `sales`, `profit_calculations`, `batches`, `purchases`, `customers`, `customer_labels`, `sales_followups`, `waste_logs`, `audit_logs`, `stock_notifications`.

Views: `ingredients_with_status`, `batches_with_expiry`, `daily_production_planner`, `customer_stats`, `overdue_payments`, `profit_report_with_waste`.

- Primary key: UUID (`gen_random_uuid()`)
- Row Level Security (RLS) per role
- Semua perubahan schema **wajib** via migration file di `supabase/`

---

## 🎯 Success Metrics

| Metrik | Target |
|--------|--------|
| Waktu input penjualan | < 30 detik |
| Akurasi profit | Selisih < 1% vs manual |
| Kehabisan stok | Turun 80% dalam 3 bulan |
| Dashboard load (4G) | < 2 detik |
| Adopsi tim | 100% dalam 2 minggu |
| Pre-order fulfillment | > 95% tepat waktu |

---

## 🚫 Out of Scope (Phase 1)

Multi-outlet, marketplace integration, payment gateway, loyalty program, barcode scanning, tracking pengiriman, manajemen supplier, aplikasi native mobile. Beberapa item di-roadmap untuk **Phase 2**.

---

## 📝 Catatan Development

- Dokumen ini akan **terus di-update** sampai project selesai.
- Jangan `git push` sampai ada instruksi eksplisit dari owner.
- Setiap perubahan bump versi di [VERSION](./VERSION) & [CHANGELOG.md](./CHANGELOG.md).
- Acuan PRD: **v2.1 (10 April 2026)**.

---

*© 2026 Parissa — Internal project. README ini akan direvisi seiring progres development.*
