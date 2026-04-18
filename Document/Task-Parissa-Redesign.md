# Task-Parissa-Redesign.md

> **Tujuan:** Redesign UI Parissa POS dari tampilan "wireframe" menjadi polished, minimalis, Notion-style, dengan dukungan **dark mode & light mode fleksibel**.
> **Versi awal dokumen:** v0.1.0 — 2026-04-18
> **Referensi acuan:** CLAUDE.md §6 (Design System) + screenshot Notion (gambar-2 Rico, 2026-04-18)
> **Prinsip:** tidak menyalin referensi 1:1 — ambil filosofinya (minimalis, monokrom, whitespace generous, aksen hanya fungsional).

---

## Ringkasan Perubahan

- Tambah **dark mode** (class-based `.dark`, default = system preference) via `next-themes`
- Theme toggle (Sun/Moon icon) di header/sidebar
- Polish visual tiap halaman: typography hierarchy, spacing, card minimalis, badge dot-style, tabel clean, chart muted
- Tidak ubah logika bisnis — pure visual/layout
- Update seluruh dokumen terkait (CLAUDE.md, README.md, CHANGELOG.md, VERSION, PRD-Parissa-Design.md baru)

---

## Fase 0 — Audit (read-only) ✅ SELESAI 2026-04-18

- [x] Jalankan dev server
- [x] Screenshot tiap halaman utama (light mode)
- [x] Catat temuan per halaman (spacing, hardcoded color, hierarchy, layout issue)
- [x] Laporkan ke Rico — approved

**Temuan kritis:** dark mode belum aktif, warna aksen biru over-used, tabel
tanpa hierarchy uppercase, banyak `bg-white` hardcoded di komponen dashboard
(KpiCards, SalesCharts, TransactionLists), icon set campur, mobile POS overlap.

## Fase 1A — Pondasi Tema ✅ SELESAI 2026-04-18

- [x] Tambah override legacy tokens (`--color-bg`, `--color-text`, dst.) di block `.dark` pada `src/app/globals.css`
- [x] Install `next-themes` + `lucide-react`
- [x] Wire `ThemeProvider` di `src/app/[locale]/layout.tsx` dengan `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `suppressHydrationWarning`
- [x] Buat komponen `components/shared/ThemeToggle.tsx` (icon Sun/Moon/Monitor lucide-react, cycle light→dark→system)
- [x] Letakkan ThemeToggle di header AppShell
- [x] Test: toggle light ↔ dark ↔ system berfungsi, body bg berubah (#FFF ↔ #191919), no flash
- [x] Update CHANGELOG + bump minor version → **v0.16.0**

## Fase 1B — Design System Cleanup ✅ SELESAI 2026-04-18

- [x] Audit hardcoded colors — scope nyata ~440 occurrences di 25 file (per-feature tertunda ke Fase 2)
- [x] Fix dashboard **prioritas tinggi**: `KpiCards.tsx` + `SalesCharts.tsx` + `TransactionLists.tsx` — semua `bg-white` / hex literal → token (`bg-card`, `text-foreground`, `var(--color-*)`). Recharts palette migrasi ke CSS vars.
- [x] Ganti icon Sidebar & BottomTabs → `lucide-react` (LayoutDashboard, ShoppingCart, Package, dst.)
- [x] Shared primitives baru: `PageHeader.tsx`, `BadgeDot.tsx`, `StatCard.tsx`
- [x] Verifikasi light + dark — dashboard kini adaptif penuh
- [x] Update CHANGELOG + VERSION → **v0.17.0**

**Hasil verifikasi:**
- Dark mode: semua kartu KPI/chart/transaksi bg gelap, border hairline visible, angka pakai font-mono tabular-nums, ikon sidebar seragam lucide.
- Light mode: warna fungsional (success/warning/danger) hanya pada angka yang relevan — tidak decorative.

**Sisa (untuk Fase 2 per-halaman):**
- `bg-white` / hardcoded color di: POS, Products, Recipes, Reports, Preorders, Stock, Settings, dan page roots (`(app)/*/page.tsx`).
- Kicker "IKHTISAR" biru di dashboard page masih hardcode — akan diganti `<PageHeader>` saat polish Dashboard.

## Fase 2 — Polish Per-Halaman

Urutan prioritas (tiap halaman = 1 commit, bump patch version):

- [ ] **1. Dashboard** (`src/app/[locale]/(app)/page.tsx`)
- [ ] **2. POS** (`/pos`)
- [ ] **3. Sidebar + Global Layout** (jika perlu tuning tambahan setelah Fase 1)
- [ ] **4. Stok & Bahan** (`/stock`)
- [ ] **5. Produk** (`/products`) + **Resep/BOM** (`/recipes`)
- [ ] **6. Pelanggan** (`/customers`) + **Riwayat** (`/history`)
- [ ] **7. Laporan** (`/reports`) + **Produksi/Batching** (`/batching`) + **Pembelian** (`/purchases`) + **Waste** (`/waste`) + **Pre-Order** (`/preorders`)
- [ ] **8. Pengaturan** (`/settings`)

**Checklist per halaman:**
- [ ] Screenshot before (light + dark)
- [ ] Polish visual sesuai §6 CLAUDE.md
- [ ] Screenshot after (light + dark)
- [ ] `/security-review` + `/review`
- [ ] Centang Task-Parissa-Redesign.md + Task-Parissa.md (jika ada sub-task UI terkait)
- [ ] Bump patch version (VERSION + CHANGELOG)
- [ ] Log bug/lesson di Compound Engineering log (jika ada)
- [ ] "Ready to push"

## Fase 3 — QA Final & Dokumentasi

- [ ] `/verification-loop` lintas halaman: 360px / 768px / 1024px+, light + dark
- [ ] Cek kontras WCAG AA untuk semua teks (light + dark)
- [ ] Cek konsistensi: spacing, typography, card, badge, tabel, chart
- [ ] Update `CLAUDE.md` — tambah subsection dark mode di §6.6 + sinkron §3
- [ ] Update `README.md` — versi terbaru, progress, screenshot baru
- [ ] Buat **`Document/PRD-Parissa-Design.md`** — dokumen design system lengkap (tokens, komponen, pattern, do/don't)
- [ ] Update `CHANGELOG.md` final
- [ ] Update `VERSION` → v0.17.0 (redesign complete)
- [ ] Update `.claude/` jika ada setting relevan
- [ ] Update `Task-Parissa.md` — centang item UI terkait yang sudah selesai
- [ ] "Ready to push"

---

## Aturan yang dipegang (CLAUDE.md)

- RULE 1 — Explain before doing (kecuali Rico bilang "lanjutkan")
- RULE 2 — Command transparency
- RULE 3 — Session summary di akhir sesi
- RULE 4 — NEVER git push
- RULE 5 — Update CHANGELOG + VERSION
- RULE 6 — Version header + komentar Bahasa Indonesia
- RULE 7 — Tanya jika ambigu
- RULE 9 — Tri-state UI (loading, error, empty) — sudah ada, tidak diutak-atik
- RULE 10 — Update README sebelum push

## Dependency baru

- `next-themes` (~2KB) — approved oleh Rico 2026-04-18

---

*Dokumen ini adalah living document — dicentang progresif seiring Fase berjalan.*
