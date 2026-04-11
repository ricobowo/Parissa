-- ============================================================
-- File: supabase/migrations/002_seed_data.sql
-- Versi: v0.5.0
-- Deskripsi: Seed data migrasi dari Airtable Parissa
--            6 produk, 18 bahan baku, resep/BOM, contoh transaksi, batch
--            Data berdasarkan PRD Appendix — data aktual bisnis Parissa
-- ============================================================

-- ======================
-- PRODUK (6 produk aktif)
-- Harga dan cost sesuai data Airtable
-- ======================
INSERT INTO products (id, name, selling_price, bundling_price, is_bundling, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Vanilla Pannacotta',       20000.00, NULL,     false, true),
  ('a1000000-0000-0000-0000-000000000002', 'Earl Grey Pannacotta',     20000.00, NULL,     false, true),
  ('a1000000-0000-0000-0000-000000000003', 'Bundling Pannacotta 3pcs', 50000.00, 50000.00, true,  true),
  ('a1000000-0000-0000-0000-000000000004', 'Fresh Creamy Earl Grey',   28000.00, NULL,     false, true),
  ('a1000000-0000-0000-0000-000000000005', 'Fresh Creamy Matcha',      28000.00, NULL,     false, true),
  ('a1000000-0000-0000-0000-000000000006', 'Fresh Creamy Lotus',       28000.00, NULL,     false, true);

-- ======================
-- BAHAN BAKU (18 ingredients)
-- Data umum bahan dessert dan minuman premium
-- quantity_available = stok awal, minimum_stock_level = batas minimum
-- ======================
INSERT INTO ingredients (id, name, purchase_unit, supplier, purchase_price, packaging_size, minimum_stock_level, quantity_available) VALUES
  -- Bahan dasar Pannacotta
  ('b1000000-0000-0000-0000-000000000001', 'Susu Full Cream',     'liter',  'Supplier A', 28000.00,  1.0000, 5.0000, 15.0000),
  ('b1000000-0000-0000-0000-000000000002', 'Whipping Cream',      'liter',  'Supplier A', 65000.00,  1.0000, 3.0000, 8.0000),
  ('b1000000-0000-0000-0000-000000000003', 'Gula Pasir',          'kg',     'Supplier B', 18000.00,  1.0000, 5.0000, 20.0000),
  ('b1000000-0000-0000-0000-000000000004', 'Gelatin Bubuk',       'pack',   'Supplier C', 35000.00,  0.1000, 2.0000, 10.0000),
  ('b1000000-0000-0000-0000-000000000005', 'Vanilla Extract',     'botol',  'Supplier C', 45000.00,  0.1000, 1.0000, 5.0000),
  ('b1000000-0000-0000-0000-000000000006', 'Earl Grey Tea',       'pack',   'Supplier D', 55000.00,  0.1000, 2.0000, 8.0000),

  -- Bahan topping/sauce
  ('b1000000-0000-0000-0000-000000000007', 'Caramel Sauce',       'botol',  'Supplier C', 42000.00,  0.5000, 2.0000, 6.0000),
  ('b1000000-0000-0000-0000-000000000008', 'Chocolate Sauce',     'botol',  'Supplier C', 38000.00,  0.5000, 2.0000, 6.0000),
  ('b1000000-0000-0000-0000-000000000009', 'Fresh Strawberry',    'kg',     'Supplier E', 45000.00,  1.0000, 1.0000, 3.0000),

  -- Bahan Fresh Creamy
  ('b1000000-0000-0000-0000-000000000010', 'Susu UHT',            'liter',  'Supplier A', 18000.00,  1.0000, 10.0000, 25.0000),
  ('b1000000-0000-0000-0000-000000000011', 'Matcha Powder',       'pack',   'Supplier D', 85000.00,  0.1000, 1.0000, 4.0000),
  ('b1000000-0000-0000-0000-000000000012', 'Lotus Biscoff Spread','jar',    'Supplier D', 95000.00,  0.4000, 1.0000, 3.0000),
  ('b1000000-0000-0000-0000-000000000013', 'Es Batu',             'pack',   'Supplier F', 10000.00,  5.0000, 5.0000, 20.0000),
  ('b1000000-0000-0000-0000-000000000014', 'Gula Cair',           'botol',  'Supplier B', 25000.00,  0.5000, 3.0000, 10.0000),

  -- Packaging
  ('b1000000-0000-0000-0000-000000000015', 'Cup Pannacotta 150ml','pack',   'Supplier G', 35000.00, 50.0000, 50.0000, 200.0000),
  ('b1000000-0000-0000-0000-000000000016', 'Cup Minuman 500ml',   'pack',   'Supplier G', 45000.00, 50.0000, 50.0000, 150.0000),
  ('b1000000-0000-0000-0000-000000000017', 'Tutup Cup',           'pack',   'Supplier G', 20000.00, 50.0000, 50.0000, 200.0000),
  ('b1000000-0000-0000-0000-000000000018', 'Sedotan',             'pack',   'Supplier G', 15000.00, 50.0000, 50.0000, 200.0000);

-- ======================
-- RESEP / BOM (Recipe per produk)
-- quantity_per_batch = jumlah bahan per batch
-- pcs_per_batch = jumlah porsi dari 1 batch
-- Cost per unit dihitung oleh fungsi calculate_product_cost()
-- ======================

-- Vanilla Pannacotta — 1 batch = 10 pcs
INSERT INTO recipes (product_id, ingredient_id, quantity_per_batch, pcs_per_batch) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 1.0000, 10),  -- Susu 1 liter
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 0.5000, 10),  -- Cream 0.5 liter
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 0.2000, 10),  -- Gula 200g
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 0.0200, 10),  -- Gelatin 20g
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 0.0100, 10),  -- Vanilla 10ml
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000015', 10.0000, 10); -- Cup 10 pcs

-- Earl Grey Pannacotta — 1 batch = 10 pcs
INSERT INTO recipes (product_id, ingredient_id, quantity_per_batch, pcs_per_batch) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 1.0000, 10),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 0.5000, 10),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 0.2000, 10),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', 0.0200, 10),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000006', 0.0300, 10),  -- Earl Grey Tea 30g
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000015', 10.0000, 10);

-- Bundling 3pcs — menggunakan resep Vanilla Pannacotta (alias, cost = 3x per-pcs)
INSERT INTO recipes (product_id, ingredient_id, quantity_per_batch, pcs_per_batch) VALUES
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 1.0000, 10),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 0.5000, 10),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 0.2000, 10),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000004', 0.0200, 10),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000006', 0.0300, 10),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000015', 10.0000, 10);

-- Fresh Creamy Earl Grey — 1 batch = 8 pcs
INSERT INTO recipes (product_id, ingredient_id, quantity_per_batch, pcs_per_batch) VALUES
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000010', 2.0000, 8),  -- Susu UHT 2 liter
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 0.5000, 8),  -- Cream 0.5 liter
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000006', 0.0400, 8),  -- Earl Grey 40g
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000014', 0.2000, 8),  -- Gula Cair 200ml
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000013', 8.0000, 8),  -- Es Batu 8 pack
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000016', 8.0000, 8);  -- Cup Minuman 8 pcs

-- Fresh Creamy Matcha — 1 batch = 8 pcs
INSERT INTO recipes (product_id, ingredient_id, quantity_per_batch, pcs_per_batch) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000010', 2.0000, 8),
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 0.5000, 8),
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000011', 0.0400, 8),  -- Matcha 40g
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000014', 0.2000, 8),
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000013', 8.0000, 8),
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000016', 8.0000, 8);

-- Fresh Creamy Lotus — 1 batch = 8 pcs
INSERT INTO recipes (product_id, ingredient_id, quantity_per_batch, pcs_per_batch) VALUES
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000010', 2.0000, 8),
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 0.5000, 8),
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000012', 0.2000, 8),  -- Lotus Spread 200g
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000014', 0.2000, 8),
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000013', 8.0000, 8),
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000016', 8.0000, 8);

-- ======================
-- CONTOH TRANSAKSI PENJUALAN (sample dari 54 transaksi)
-- Catatan: trigger auto-hitung profit, auto-kurangi stok, auto-upsert customer
-- Data representatif untuk testing dashboard dan laporan
-- ======================
INSERT INTO sales (date, customer_name, product_id, amount, is_bundling, sale_price, payment_status, sale_type) VALUES
  -- Minggu 1 — Maret 2026
  ('2026-03-01', 'Rina',     'a1000000-0000-0000-0000-000000000001', 2, false, 40000.00,  'Sudah',  'Direct'),
  ('2026-03-01', 'Budi',     'a1000000-0000-0000-0000-000000000004', 1, false, 28000.00,  'Sudah',  'Direct'),
  ('2026-03-02', 'Sari',     'a1000000-0000-0000-0000-000000000003', 1, true,  50000.00,  'Sudah',  'Direct'),
  ('2026-03-02', 'Andi',     'a1000000-0000-0000-0000-000000000002', 3, false, 60000.00,  'Sudah',  'Direct'),
  ('2026-03-03', 'Maya',     'a1000000-0000-0000-0000-000000000005', 2, false, 56000.00,  'Sudah',  'Direct'),
  ('2026-03-03', 'Rina',     'a1000000-0000-0000-0000-000000000001', 1, false, 20000.00,  'Belum',  'Direct'),
  ('2026-03-04', 'Dedi',     'a1000000-0000-0000-0000-000000000006', 1, false, 28000.00,  'Sudah',  'Direct'),
  ('2026-03-04', 'Lisa',     'a1000000-0000-0000-0000-000000000003', 2, true,  100000.00, 'Sudah',  'Direct'),
  ('2026-03-05', 'Tono',     'a1000000-0000-0000-0000-000000000004', 2, false, 56000.00,  'Sudah',  'Direct'),
  ('2026-03-05', 'Nina',     'a1000000-0000-0000-0000-000000000001', 3, false, 60000.00,  'Belum',  'Direct'),

  -- Minggu 2
  ('2026-03-06', 'Adi',      'a1000000-0000-0000-0000-000000000002', 1, false, 20000.00,  'Sudah',  'Direct'),
  ('2026-03-07', 'Wati',     'a1000000-0000-0000-0000-000000000003', 1, true,  50000.00,  'Sudah',  'Direct'),
  ('2026-03-07', 'Rizky',    'a1000000-0000-0000-0000-000000000005', 1, false, 28000.00,  'Sudah',  'Direct'),
  ('2026-03-08', 'Fitri',    'a1000000-0000-0000-0000-000000000001', 2, false, 40000.00,  'Sudah',  'Direct'),
  ('2026-03-08', 'Budi',     'a1000000-0000-0000-0000-000000000006', 2, false, 56000.00,  'Sudah',  'Direct'),
  ('2026-03-09', 'Sari',     'a1000000-0000-0000-0000-000000000004', 1, false, 28000.00,  'Belum',  'Direct'),
  ('2026-03-09', 'Dewi',     'a1000000-0000-0000-0000-000000000003', 1, true,  50000.00,  'Sudah',  'Direct'),
  ('2026-03-10', 'Rina',     'a1000000-0000-0000-0000-000000000001', 1, false, 20000.00,  'Sudah',  'Direct'),
  ('2026-03-10', 'Joko',     'a1000000-0000-0000-0000-000000000002', 2, false, 40000.00,  'Sudah',  'Direct'),
  ('2026-03-11', 'Maya',     'a1000000-0000-0000-0000-000000000005', 1, false, 28000.00,  'Sudah',  'Direct'),

  -- Minggu 3
  ('2026-03-12', 'Andi',     'a1000000-0000-0000-0000-000000000004', 3, false, 84000.00,  'Sudah',  'Direct'),
  ('2026-03-12', 'Tono',     'a1000000-0000-0000-0000-000000000003', 2, true,  100000.00, 'Sudah',  'Direct'),
  ('2026-03-13', 'Lisa',     'a1000000-0000-0000-0000-000000000001', 1, false, 20000.00,  'Sudah',  'Direct'),
  ('2026-03-13', 'Wati',     'a1000000-0000-0000-0000-000000000006', 1, false, 28000.00,  'Belum',  'Direct'),
  ('2026-03-14', 'Nina',     'a1000000-0000-0000-0000-000000000002', 1, false, 20000.00,  'Sudah',  'Direct'),
  ('2026-03-14', 'Rizky',    'a1000000-0000-0000-0000-000000000001', 2, false, 40000.00,  'Sudah',  'Direct'),
  ('2026-03-15', 'Dedi',     'a1000000-0000-0000-0000-000000000003', 1, true,  50000.00,  'Sudah',  'Direct'),
  ('2026-03-15', 'Fitri',    'a1000000-0000-0000-0000-000000000005', 2, false, 56000.00,  'Sudah',  'Direct'),
  ('2026-03-16', 'Adi',      'a1000000-0000-0000-0000-000000000004', 1, false, 28000.00,  'Sudah',  'Direct'),
  ('2026-03-16', 'Sari',     'a1000000-0000-0000-0000-000000000001', 1, false, 20000.00,  'Sudah',  'Pre-order'),

  -- Minggu 4
  ('2026-03-17', 'Dewi',     'a1000000-0000-0000-0000-000000000006', 1, false, 28000.00,  'Sudah',  'Direct'),
  ('2026-03-17', 'Joko',     'a1000000-0000-0000-0000-000000000003', 1, true,  50000.00,  'Sudah',  'Direct'),
  ('2026-03-18', 'Maya',     'a1000000-0000-0000-0000-000000000001', 1, false, 20000.00,  'Sudah',  'Direct'),
  ('2026-03-18', 'Budi',     'a1000000-0000-0000-0000-000000000002', 1, false, 20000.00,  'Belum',  'Direct'),
  ('2026-03-19', 'Rina',     'a1000000-0000-0000-0000-000000000004', 2, false, 56000.00,  'Sudah',  'Direct'),
  ('2026-03-19', 'Andi',     'a1000000-0000-0000-0000-000000000005', 1, false, 28000.00,  'Sudah',  'Direct'),
  ('2026-03-20', 'Lisa',     'a1000000-0000-0000-0000-000000000003', 1, true,  50000.00,  'Sudah',  'Direct'),
  ('2026-03-20', 'Tono',     'a1000000-0000-0000-0000-000000000001', 2, false, 40000.00,  'Sudah',  'Direct'),
  ('2026-03-21', 'Wati',     'a1000000-0000-0000-0000-000000000006', 2, false, 56000.00,  'Sudah',  'Direct'),
  ('2026-03-21', 'Nina',     'a1000000-0000-0000-0000-000000000002', 1, false, 20000.00,  'Sudah',  'Direct'),

  -- Minggu 5 (akhir bulan)
  ('2026-03-22', 'Rizky',    'a1000000-0000-0000-0000-000000000004', 1, false, 28000.00,  'Sudah',  'Direct'),
  ('2026-03-22', 'Dedi',     'a1000000-0000-0000-0000-000000000001', 1, false, 20000.00,  'Belum',  'Direct'),
  ('2026-03-23', 'Fitri',    'a1000000-0000-0000-0000-000000000003', 2, true,  100000.00, 'Sudah',  'Direct'),
  ('2026-03-23', 'Adi',      'a1000000-0000-0000-0000-000000000005', 1, false, 28000.00,  'Sudah',  'Direct'),
  ('2026-03-24', 'Sari',     'a1000000-0000-0000-0000-000000000002', 2, false, 40000.00,  'Sudah',  'Direct'),
  ('2026-03-24', 'Dewi',     'a1000000-0000-0000-0000-000000000006', 1, false, 28000.00,  'Sudah',  'Direct'),
  ('2026-03-25', 'Joko',     'a1000000-0000-0000-0000-000000000001', 3, false, 60000.00,  'Sudah',  'Direct'),
  ('2026-03-25', 'Maya',     'a1000000-0000-0000-0000-000000000004', 1, false, 28000.00,  'Belum',  'Direct'),
  ('2026-03-26', 'Budi',     'a1000000-0000-0000-0000-000000000003', 1, true,  50000.00,  'Sudah',  'Direct'),
  ('2026-03-26', 'Rina',     'a1000000-0000-0000-0000-000000000005', 2, false, 56000.00,  'Sudah',  'Direct'),
  ('2026-03-27', 'Andi',     'a1000000-0000-0000-0000-000000000001', 1, false, 20000.00,  'Sudah',  'Direct'),
  ('2026-03-27', 'Tono',     'a1000000-0000-0000-0000-000000000006', 1, false, 28000.00,  'Sudah',  'Direct'),
  ('2026-03-28', 'Lisa',     'a1000000-0000-0000-0000-000000000002', 1, false, 20000.00,  'Sudah',  'Direct'),
  ('2026-03-28', 'Wati',     'a1000000-0000-0000-0000-000000000004', 2, false, 56000.00,  'Belum',  'Direct');

-- ======================
-- BATCH PRODUKSI (9 batch contoh)
-- Trigger auto-deduct stok bahan TIDAK aktif di seed ini
-- (stok sudah disesuaikan di tabel ingredients di atas)
-- ======================
INSERT INTO batches (product_id, batch_number, batch_date, batch_quantity, expiration_date, status, notes) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'VP-2026-001', '2026-03-01', 10, '2026-03-04', 'Completed', 'Batch pertama Vanilla Pannacotta'),
  ('a1000000-0000-0000-0000-000000000002', 'EP-2026-001', '2026-03-01', 10, '2026-03-04', 'Completed', 'Batch pertama Earl Grey Pannacotta'),
  ('a1000000-0000-0000-0000-000000000001', 'VP-2026-002', '2026-03-05', 10, '2026-03-08', 'Completed', 'Batch kedua Vanilla'),
  ('a1000000-0000-0000-0000-000000000004', 'FC-EG-001',   '2026-03-05',  8, '2026-03-07', 'Completed', 'Batch Fresh Creamy Earl Grey'),
  ('a1000000-0000-0000-0000-000000000005', 'FC-MT-001',   '2026-03-08',  8, '2026-03-10', 'Completed', 'Batch Fresh Creamy Matcha'),
  ('a1000000-0000-0000-0000-000000000001', 'VP-2026-003', '2026-03-12', 10, '2026-03-15', 'Completed', 'Batch ketiga Vanilla'),
  ('a1000000-0000-0000-0000-000000000006', 'FC-LT-001',   '2026-03-12',  8, '2026-03-14', 'Completed', 'Batch Fresh Creamy Lotus'),
  ('a1000000-0000-0000-0000-000000000002', 'EP-2026-002', '2026-03-18', 10, '2026-03-21', 'Completed', 'Batch kedua Earl Grey'),
  ('a1000000-0000-0000-0000-000000000001', 'VP-2026-004', '2026-03-25', 10, '2026-03-28', 'Completed', 'Batch keempat Vanilla');

-- ======================
-- CONTOH PEMBELIAN BAHAN BAKU (beberapa restock)
-- Trigger auto-update stok aktif saat insert
-- ======================
INSERT INTO purchases (ingredient_id, qty_purchased, price_paid, supplier, date, notes) VALUES
  ('b1000000-0000-0000-0000-000000000001', 5.0000,  140000.00, 'Supplier A', '2026-03-01', 'Restock susu awal bulan'),
  ('b1000000-0000-0000-0000-000000000002', 2.0000,  130000.00, 'Supplier A', '2026-03-01', 'Restock cream awal bulan'),
  ('b1000000-0000-0000-0000-000000000010', 5.0000,   90000.00, 'Supplier A', '2026-03-05', 'Restock susu UHT'),
  ('b1000000-0000-0000-0000-000000000015', 100.0000, 70000.00, 'Supplier G', '2026-03-10', 'Restock cup pannacotta'),
  ('b1000000-0000-0000-0000-000000000016', 50.0000,  45000.00, 'Supplier G', '2026-03-10', 'Restock cup minuman'),
  ('b1000000-0000-0000-0000-000000000003', 5.0000,   90000.00, 'Supplier B', '2026-03-15', 'Restock gula'),
  ('b1000000-0000-0000-0000-000000000001', 5.0000,  140000.00, 'Supplier A', '2026-03-20', 'Restock susu kedua');

-- ======================
-- VERIFIKASI DATA (query untuk cek jumlah)
-- Jalankan setelah seed untuk memastikan data benar
-- ======================
-- SELECT 'products' AS tabel, COUNT(*) AS jumlah FROM products
-- UNION ALL SELECT 'ingredients', COUNT(*) FROM ingredients
-- UNION ALL SELECT 'recipes', COUNT(*) FROM recipes
-- UNION ALL SELECT 'sales', COUNT(*) FROM sales
-- UNION ALL SELECT 'batches', COUNT(*) FROM batches
-- UNION ALL SELECT 'purchases', COUNT(*) FROM purchases
-- UNION ALL SELECT 'customers', COUNT(*) FROM customers
-- UNION ALL SELECT 'profit_calculations', COUNT(*) FROM profit_calculations;
