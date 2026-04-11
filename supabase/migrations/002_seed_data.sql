-- ============================================================
-- File: supabase/migrations/002_seed_data.sql
-- Versi: v0.5.1
-- Deskripsi: Seed data ASLI dari Airtable Parissa
--            Sumber: CSV export 9 April 2026
--            53 transaksi, 6 produk, 18 bahan, 6 resep, 18 pembelian
-- ============================================================

-- ======================
-- NONAKTIFKAN TRIGGER stok sementara
-- (Stok diatur manual, tidak perlu auto-deduct/add saat seed)
-- ======================
ALTER TABLE sales DISABLE TRIGGER trg_deduct_stock_on_sale;
ALTER TABLE purchases DISABLE TRIGGER trg_update_stock_on_purchase;

-- ======================
-- PRODUK (6 produk aktif)
-- Data dari: Finished Products-Grid view.csv
-- ======================
INSERT INTO products (id, name, selling_price, bundling_price, is_bundling, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Vanilla Pannacotta',       20000.00,   NULL,     false, true),
  ('a1000000-0000-0000-0000-000000000002', 'Earl Grey Pannacotta',     20000.00,   NULL,     false, true),
  ('a1000000-0000-0000-0000-000000000003', 'Bundling Pannacotta',      16666.67,   16666.67, true,  true),
  ('a1000000-0000-0000-0000-000000000004', 'Fresh Creamy Lotus',       28000.00,   NULL,     false, true),
  ('a1000000-0000-0000-0000-000000000005', 'Fresh Creamy Earl Grey',   28000.00,   NULL,     false, true),
  ('a1000000-0000-0000-0000-000000000006', 'Fresh Creamy Matcha',      28000.00,   NULL,     false, true);

-- ======================
-- BAHAN BAKU (18 ingredients)
-- Data dari: Ingredients-Grid view.csv
-- Semua harga, supplier, packaging size ASLI dari Airtable
-- ======================
INSERT INTO ingredients (id, name, purchase_unit, supplier, purchase_price, packaging_size, minimum_stock_level, quantity_available) VALUES
  -- Bahan Pannacotta
  ('b1000000-0000-0000-0000-000000000001', 'Milk (Pannacotta)',            'ml',  'Ultramilk UHT Full Cream', 40000.00, 2000.0000, 2000.0000, 10000.0000),
  ('b1000000-0000-0000-0000-000000000002', 'Whipping Cream (Pannacotta)',  'ml',  'Anchor',                   78000.00, 1100.0000, 1100.0000,  5500.0000),
  ('b1000000-0000-0000-0000-000000000003', 'Cream (Pannacotta)',           'ml',  'Vivo',                    130000.00, 1000.0000, 1000.0000,  5000.0000),
  ('b1000000-0000-0000-0000-000000000004', 'Vanila',                      'g',   NULL,                       10400.00,  100.0000,   40.0000,   200.0000),
  ('b1000000-0000-0000-0000-000000000005', 'Gelatine',                    'g',   NULL,                       28000.00,  100.0000,   60.0000,   300.0000),
  ('b1000000-0000-0000-0000-000000000006', 'Gula',                        'g',   NULL,                       16000.00,  500.0000,   40.0000,   500.0000),
  ('b1000000-0000-0000-0000-000000000007', 'Earl Grey (Pannacotta)',       'g',   'Twinning',                100000.00,  100.0000,   30.0000,   200.0000),
  ('b1000000-0000-0000-0000-000000000008', 'Toping',                      'pcs', 'Lotus Biscoff, Strawberry, Oreo', 72160.00, 44.0000, 44.0000, 176.0000),
  ('b1000000-0000-0000-0000-000000000009', 'Stiker (Pannacotta)',          'pcs', NULL,                       44000.00,  44.0000,   44.0000,   176.0000),
  ('b1000000-0000-0000-0000-000000000010', 'Packing',                     'pcs', 'Cup + Spoon',              66000.00,  44.0000,   44.0000,   176.0000),

  -- Bahan Fresh Creamy
  ('b1000000-0000-0000-0000-000000000011', 'Milk (Fresh Creamy)',          'ml',  'Green Field UHT',          24800.00,  950.0000,  160.0000,  1900.0000),
  ('b1000000-0000-0000-0000-000000000012', 'Cream (Fresh Creamy) Vivo',    'ml',  'Vivo',                     70473.00, 1100.0000,   30.0000,   550.0000),
  ('b1000000-0000-0000-0000-000000000013', 'Cream (Fresh Creamy) Rich Gold','ml', 'Rich Gold',                67497.00,  907.0000,   30.0000,   454.0000),
  ('b1000000-0000-0000-0000-000000000014', 'Earl Grey (Fresh Creamy)',      'g',  'Twinning',                100000.00,  100.0000,    4.0000,   100.0000),
  ('b1000000-0000-0000-0000-000000000015', 'Lotus Crumbs',                 'g',  'Lotus',                    54150.00,  250.0000,   30.0000,   250.0000),
  ('b1000000-0000-0000-0000-000000000016', 'Matcha',                       'g',  NULL,                      250000.00,  250.0000,    5.0000,   125.0000),
  ('b1000000-0000-0000-0000-000000000017', 'Bottle',                       'pcs', NULL,                      21450.00,   20.0000,   10.0000,    60.0000),
  ('b1000000-0000-0000-0000-000000000018', 'Sticker (Fresh Creamy)',        'pcs', NULL,                      44000.00,   44.0000,   10.0000,    88.0000);

-- ======================
-- RESEP / BOM (Recipe per produk)
-- Data dari: Recipe_BOM-Grid view.csv + Ingredients-Grid view.csv
-- quantity_per_batch = jumlah bahan per 1 batch produksi
-- pcs_per_batch = jumlah porsi yang dihasilkan per batch
-- ======================

-- Recipe 1: Vanilla Pannacotta — 44 pcs per batch
-- Total batch cost = Rp 452.400, cost per unit = Rp 10.281,82
INSERT INTO recipes (product_id, ingredient_id, quantity_per_batch, pcs_per_batch) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 2000.0000, 44),  -- Milk 2000ml
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 1100.0000, 44),  -- Whipping Cream 1100ml
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 1000.0000, 44),  -- Cream Vivo 1000ml
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004',   40.0000, 44),  -- Vanila 40g
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005',   60.0000, 44),  -- Gelatine 60g
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006',   40.0000, 44),  -- Gula 40g
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000008',   44.0000, 44),  -- Toping 44 pcs
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000009',   44.0000, 44),  -- Stiker 44 pcs
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000010',   44.0000, 44);  -- Packing 44 pcs

-- Recipe 2: Earl Grey Pannacotta — 39 pcs per batch
-- Total batch cost = Rp 478.240, cost per unit = Rp 12.262,56
INSERT INTO recipes (product_id, ingredient_id, quantity_per_batch, pcs_per_batch) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 2000.0000, 39),  -- Milk 2000ml
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 1100.0000, 39),  -- Whipping Cream 1100ml
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 1000.0000, 39),  -- Cream Vivo 1000ml
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000005',   60.0000, 39),  -- Gelatine 60g
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000006',   40.0000, 39),  -- Gula 40g
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000007',   30.0000, 39),  -- Earl Grey 30g
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000008',   44.0000, 39),  -- Toping 44 pcs
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000009',   44.0000, 39),  -- Stiker 44 pcs
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000010',   44.0000, 39);  -- Packing 44 pcs

-- Recipe 3: Bundling Pannacotta — 39 pcs per batch (same BOM as Earl Grey)
-- Cost per unit = Rp 12.262,56 (sama dengan Earl Grey)
INSERT INTO recipes (product_id, ingredient_id, quantity_per_batch, pcs_per_batch) VALUES
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 2000.0000, 39),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 1100.0000, 39),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 1000.0000, 39),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000005',   60.0000, 39),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000006',   40.0000, 39),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000007',   30.0000, 39),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000008',   44.0000, 39),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000009',   44.0000, 39),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000010',   44.0000, 39);

-- Recipe 4: Fresh Creamy Lotus — 1 pcs per batch
-- Cost per unit = Rp 16.901,87
INSERT INTO recipes (product_id, ingredient_id, quantity_per_batch, pcs_per_batch) VALUES
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000011', 160.0000, 1),  -- Milk FC 160ml
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000012',  30.0000, 1),  -- Cream Vivo 30ml
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000013',  30.0000, 1),  -- Cream Rich Gold 30ml
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000015',  30.0000, 1),  -- Lotus Crumbs 30g
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000017',   1.0000, 1),  -- Bottle 1 pcs
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000018',   1.0000, 1);  -- Sticker 1 pcs

-- Recipe 5: Fresh Creamy Earl Grey — 1 pcs per batch
-- Cost per unit = Rp 14.403,87
INSERT INTO recipes (product_id, ingredient_id, quantity_per_batch, pcs_per_batch) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000011', 160.0000, 1),  -- Milk FC 160ml
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000012',  30.0000, 1),  -- Cream Vivo 30ml
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000013',  30.0000, 1),  -- Cream Rich Gold 30ml
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000014',   4.0000, 1),  -- Earl Grey FC 4g
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000017',   1.0000, 1),  -- Bottle 1 pcs
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000018',   1.0000, 1);  -- Sticker 1 pcs

-- Recipe 6: Fresh Creamy Matcha — 1 pcs per batch
-- Cost per unit = Rp 15.403,87
INSERT INTO recipes (product_id, ingredient_id, quantity_per_batch, pcs_per_batch) VALUES
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000011', 160.0000, 1),  -- Milk FC 160ml
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000012',  30.0000, 1),  -- Cream Vivo 30ml
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000013',  30.0000, 1),  -- Cream Rich Gold 30ml
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000016',   5.0000, 1),  -- Matcha 5g
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000017',   1.0000, 1),  -- Bottle 1 pcs
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000018',   1.0000, 1);  -- Sticker 1 pcs

-- ======================
-- TRANSAKSI PENJUALAN (53 transaksi asli)
-- Data dari: Log-Sales-Grid view.csv
-- Trigger trg_calculate_profit AKTIF — auto-generate profit_calculations
-- Trigger trg_upsert_customer AKTIF — auto-generate customers
-- Trigger trg_deduct_stock_on_sale NONAKTIF — stok diatur manual
-- ======================

-- 30 Januari 2026 (8 transaksi)
INSERT INTO sales (date, customer_name, product_id, amount, is_bundling, menu_detail, topping, sale_price, payment_status, sale_type) VALUES
  ('2026-01-30', 'Boromeus',      'a1000000-0000-0000-0000-000000000001', 2, false, '2 Vanilla',                '2 Lotus',                         40000.00,  'Sudah', 'Direct'),
  ('2026-01-30', 'Boromeus',      'a1000000-0000-0000-0000-000000000002', 2, false, '2 Earl Grey',              '1 Oreo, 1 Strawberry',            40000.00,  'Sudah', 'Direct'),
  ('2026-01-30', 'Bu Clau',       'a1000000-0000-0000-0000-000000000001', 1, false, '1 Vanilla',                '1 Strawberry',                    20000.00,  'Sudah', 'Direct'),
  ('2026-01-30', 'Bu Sabrina',    'a1000000-0000-0000-0000-000000000001', 1, false, '1 Vanilla',                '1 Strawberry',                    20000.00,  'Sudah', 'Direct'),
  ('2026-01-30', 'Bu Sabrina',    'a1000000-0000-0000-0000-000000000002', 1, false, '1 Earl Grey',              '1 Strawberry',                    20000.00,  'Sudah', 'Direct'),
  ('2026-01-30', 'Pak Armien',    'a1000000-0000-0000-0000-000000000003', 6, true,  '4 Vanilla, 2 Earl Grey',   '2 Lotus, 2 Oreo, 2 Strawberry',  100000.02, 'Sudah', 'Direct'),
  ('2026-01-30', 'Tepi BPK - 1', 'a1000000-0000-0000-0000-000000000003', 6, true,  '4 Vanilla, 2 Earl Grey',   '2 Lotus, 2 Oreo, 2 Strawberry',  100000.02, 'Sudah', 'Direct'),
  ('2026-01-30', 'Tepi BPK - 2', 'a1000000-0000-0000-0000-000000000003', 6, true,  '4 Vanilla, 2 Earl Grey',   '2 Lotus, 2 Oreo, 2 Strawberry',  100000.02, 'Sudah', 'Direct');

-- 31 Januari 2026 (1 transaksi)
INSERT INTO sales (date, customer_name, product_id, amount, is_bundling, menu_detail, topping, sale_price, payment_status, sale_type) VALUES
  ('2026-01-31', 'Damel',         'a1000000-0000-0000-0000-000000000003', 6, true,  '4 Vanilla, 2 Earl Grey',   '4 Lotus, 2 Butter Scotch',       100000.02, 'Sudah', 'Direct');

-- 1 Februari 2026 (1 transaksi)
INSERT INTO sales (date, customer_name, product_id, amount, is_bundling, menu_detail, topping, sale_price, payment_status, sale_type) VALUES
  ('2026-02-01', 'Bu Iin',        'a1000000-0000-0000-0000-000000000003', 6, true,  '4 Vanilla, 2 Earl Grey',   '2 Lotus, 1 Oreo, 1 Strawberry, 2 Butter Scotch', 100000.02, 'Sudah', 'Direct');

-- 16 Februari 2026 (4 transaksi)
INSERT INTO sales (date, customer_name, product_id, amount, is_bundling, menu_detail, topping, sale_price, payment_status, sale_type) VALUES
  ('2026-02-16', 'Bu Aiza',       'a1000000-0000-0000-0000-000000000001', 2, false, '2 Vanilla',                '2 Lotus',                         40000.00,  'Sudah', 'Direct'),
  ('2026-02-16', 'Bu Amanda',     'a1000000-0000-0000-0000-000000000003', 6, true,  '6 Vanilla',                '6 Lotus',                        100000.02, 'Sudah', 'Direct'),
  ('2026-02-16', 'Bu Shabrina',   'a1000000-0000-0000-0000-000000000001', 2, false, '2 Vanilla',                '2 Lotus',                         40000.00,  'Sudah', 'Direct'),
  ('2026-02-16', 'Bu Sri',        'a1000000-0000-0000-0000-000000000001', 2, false, '2 Vanilla',                '2 Lotus',                         40000.00,  'Sudah', 'Direct');

-- 23 Februari 2026 (6 transaksi)
INSERT INTO sales (date, customer_name, product_id, amount, is_bundling, menu_detail, topping, sale_price, payment_status, sale_type) VALUES
  ('2026-02-23', 'Bu April',      'a1000000-0000-0000-0000-000000000003', 12, true, '6 Vanilla, 6 Earl Grey',   '4 Lotus, 4 Oreo, 4 Strawberry',  200000.04, 'Sudah', 'Direct'),
  ('2026-02-23', 'Bu Nofha',      'a1000000-0000-0000-0000-000000000003', 6, true,  '6 Vanilla',                '3 Strawberry, 2 Oreo',            100000.02, 'Sudah', 'Direct'),
  ('2026-02-23', 'Hanna',         'a1000000-0000-0000-0000-000000000001', 2, false, '2 Vanilla',                '1 Lotus, 1 Strawberry',           40000.00,  'Sudah', 'Direct'),
  ('2026-02-23', 'Kayla',         'a1000000-0000-0000-0000-000000000001', 2, false, '2 Vanilla',                '1 Lotus, 1 Oreo',                 40000.00,  'Sudah', 'Direct'),
  ('2026-02-23', 'Nisa',          'a1000000-0000-0000-0000-000000000001', 1, false, '1 Vanilla',                '1 Strawberry',                    20000.00,  'Sudah', 'Direct'),
  ('2026-02-23', 'Zikha',         'a1000000-0000-0000-0000-000000000001', 2, false, '2 Vanilla',                '1 Lotus, 1 Oreo',                 40000.00,  'Sudah', 'Direct');

-- 27 Februari 2026 (22 transaksi — termasuk 3 BELUM BAYAR dari Kacel)
INSERT INTO sales (date, customer_name, product_id, amount, is_bundling, menu_detail, topping, sale_price, payment_status, sale_type) VALUES
  ('2026-02-27', 'April',         'a1000000-0000-0000-0000-000000000004', 1, false, 'Fresh Creamy',             '1 Lotus',                         28000.00,  'Sudah', 'Direct'),
  ('2026-02-27', 'Bu Iin',        'a1000000-0000-0000-0000-000000000003', 6, true,  '6 Vanilla',                '2 Lotus, 2 Oreo, 2 Strawberry',  100000.02, 'Sudah', 'Direct'),
  ('2026-02-27', 'Bu Nofha',      'a1000000-0000-0000-0000-000000000003', 6, true,  '6 Vanilla',                '6 Oreo',                         100000.02, 'Sudah', 'Direct'),
  ('2026-02-27', 'Dina',          'a1000000-0000-0000-0000-000000000003', 6, true,  '6 Vanilla',                '2 Lotus, 2 Oreo, 2 Strawberry',  100000.02, 'Sudah', 'Direct'),
  ('2026-02-27', 'Elvi',          'a1000000-0000-0000-0000-000000000001', 1, false, '1 Vanilla',                '1 Oreo',                          20000.00,  'Sudah', 'Direct'),
  ('2026-02-27', 'Gendra',        'a1000000-0000-0000-0000-000000000001', 1, false, '1 Vanilla',                '1 Oreo',                          20000.00,  'Sudah', 'Direct'),
  ('2026-02-27', 'Iyus',          'a1000000-0000-0000-0000-000000000001', 2, false, '2 Vanilla',                '1 Lotus, 1 Strawberry',           40000.00,  'Sudah', 'Direct'),
  ('2026-02-27', 'Iyus',          'a1000000-0000-0000-0000-000000000005', 1, false, 'Fresh Creamy',             '1 Earl Grey',                     28000.00,  'Sudah', 'Direct'),
  ('2026-02-27', 'Kacel',         'a1000000-0000-0000-0000-000000000006', 3, false, 'Fresh Creamy',             '3 Matcha',                        84000.00,  'Belum', 'Direct'),
  ('2026-02-27', 'Kacel',         'a1000000-0000-0000-0000-000000000005', 4, false, 'Fresh Creamy',             '4 Earl Grey',                    112000.00,  'Belum', 'Direct'),
  ('2026-02-27', 'Kacel',         'a1000000-0000-0000-0000-000000000004', 3, false, 'Fresh Creamy',             '3 Lotus',                         84000.00,  'Belum', 'Direct'),
  ('2026-02-27', 'Kitara',        'a1000000-0000-0000-0000-000000000003', 6, true,  '6 Vanilla',                '3 Lotus, 1 Oreo, 2 Strawberry',  100000.02, 'Sudah', 'Direct'),
  ('2026-02-27', 'Kitara',        'a1000000-0000-0000-0000-000000000005', 1, false, 'Fresh Creamy',             '1 Earl Grey',                     28000.00,  'Sudah', 'Direct'),
  ('2026-02-27', 'Nipa',          'a1000000-0000-0000-0000-000000000001', 3, false, '3 Vanilla',                '1 Lotus, 1 Oreo, 1 Strawberry',   60000.00,  'Sudah', 'Direct'),
  ('2026-02-27', 'Nipa',          'a1000000-0000-0000-0000-000000000004', 1, false, 'Fresh Creamy',             '1 Lotus',                         28000.00,  'Sudah', 'Direct'),
  ('2026-02-27', 'Nipa',          'a1000000-0000-0000-0000-000000000005', 1, false, 'Fresh Creamy',             '1 Earl Grey',                     28000.00,  'Sudah', 'Direct'),
  ('2026-02-27', 'Nisa',          'a1000000-0000-0000-0000-000000000004', 1, false, 'Fresh Creamy',             '1 Lotus',                         28000.00,  'Sudah', 'Direct'),
  ('2026-02-27', 'Nisa',          'a1000000-0000-0000-0000-000000000005', 1, false, 'Fresh Creamy',             '1 Earl Grey',                     28000.00,  'Sudah', 'Direct'),
  ('2026-02-27', 'Peclaw',        'a1000000-0000-0000-0000-000000000001', 2, false, '2 Vanilla',                '1 Lotus, 1 Strawberry',           40000.00,  'Sudah', 'Direct'),
  ('2026-02-27', 'Peclaw',        'a1000000-0000-0000-0000-000000000005', 1, false, 'Fresh Creamy',             '1 Earl Grey',                     28000.00,  'Sudah', 'Direct'),
  ('2026-02-27', 'Sir Armien',    'a1000000-0000-0000-0000-000000000003', 6, true,  '6 Vanilla',                '2 Lotus, 2 Oreo, 2 Strawberry',  100000.02, 'Sudah', 'Direct'),
  ('2026-02-27', 'Sir Armien',    'a1000000-0000-0000-0000-000000000005', 1, false, 'Fresh Creamy',             '1 Earl Grey',                     28000.00,  'Sudah', 'Direct');

-- 2 Maret 2026 (11 transaksi)
INSERT INTO sales (date, customer_name, product_id, amount, is_bundling, menu_detail, topping, sale_price, payment_status, sale_type) VALUES
  ('2026-03-02', 'Aiza',          'a1000000-0000-0000-0000-000000000005', 1, false, 'Fresh Creamy',             '1 Earl Grey',                     28000.00,  'Sudah', 'Direct'),
  ('2026-03-02', 'Alan',          'a1000000-0000-0000-0000-000000000004', 1, false, 'Fresh Creamy',             '1 Lotus',                         28000.00,  'Sudah', 'Direct'),
  ('2026-03-02', 'Alea',          'a1000000-0000-0000-0000-000000000001', 2, false, '2 Vanilla',                '1 Lotus, 1 Strawberry',           40000.00,  'Sudah', 'Direct'),
  ('2026-03-02', 'Bu Sari',       'a1000000-0000-0000-0000-000000000005', 1, false, 'Fresh Creamy',             '1 Earl Grey',                     28000.00,  'Sudah', 'Direct'),
  ('2026-03-02', 'Bu Sari',       'a1000000-0000-0000-0000-000000000001', 1, false, '1 Vanilla',                '1 Lotus',                         20000.00,  'Sudah', 'Direct'),
  ('2026-03-02', 'Choiria',       'a1000000-0000-0000-0000-000000000005', 1, false, 'Fresh Creamy',             '1 Earl Grey',                     28000.00,  'Sudah', 'Direct'),
  ('2026-03-02', 'Dedew',         'a1000000-0000-0000-0000-000000000004', 1, false, 'Fresh Creamy',             '1 Lotus',                         28000.00,  'Sudah', 'Direct'),
  ('2026-03-02', 'Dedew',         'a1000000-0000-0000-0000-000000000005', 1, false, 'Fresh Creamy',             '1 Earl Grey',                     28000.00,  'Sudah', 'Direct'),
  ('2026-03-02', 'Rio',           'a1000000-0000-0000-0000-000000000005', 1, false, 'Fresh Creamy',             '1 Earl Grey',                     28000.00,  'Sudah', 'Direct'),
  ('2026-03-02', 'Zikha',         'a1000000-0000-0000-0000-000000000005', 1, false, 'Fresh Creamy',             '1 Earl Grey',                     28000.00,  'Sudah', 'Direct'),
  ('2026-03-02', 'Zikha',         'a1000000-0000-0000-0000-000000000003', 3, true,  '6 Vanilla',                '3 Lotus, 2 Oreo, 1 Strawberry',   50000.01,  'Sudah', 'Direct');

-- ======================
-- PEMBELIAN / RESTOCK (18 baseline purchases)
-- Data dari: Purchase_Restock-Grid view.csv
-- Trigger trg_update_stock_on_purchase NONAKTIF — stok diatur manual
-- ======================
INSERT INTO purchases (ingredient_id, qty_purchased, price_paid, supplier, date, notes) VALUES
  ('b1000000-0000-0000-0000-000000000011',  950.0000,  24800.00, 'Green Field UHT',          '2026-01-15', 'Fresh Creamy baseline'),
  ('b1000000-0000-0000-0000-000000000012', 1100.0000,  70473.00, 'Vivo',                     '2026-01-15', 'Fresh Creamy baseline'),
  ('b1000000-0000-0000-0000-000000000013',  907.0000,  67497.00, 'Rich Gold',                '2026-01-15', 'Fresh Creamy baseline'),
  ('b1000000-0000-0000-0000-000000000014',  100.0000, 100000.00, 'Twinning',                 '2026-01-15', 'Fresh Creamy baseline'),
  ('b1000000-0000-0000-0000-000000000015',  250.0000,  54150.00, 'Lotus',                    '2026-01-15', 'Fresh Creamy baseline'),
  ('b1000000-0000-0000-0000-000000000016',  250.0000, 250000.00, NULL,                       '2026-01-15', 'Fresh Creamy baseline'),
  ('b1000000-0000-0000-0000-000000000017',   20.0000,  21450.00, NULL,                       '2026-01-15', 'Fresh Creamy baseline'),
  ('b1000000-0000-0000-0000-000000000018',   44.0000,  44000.00, NULL,                       '2026-01-15', 'Fresh Creamy baseline'),
  ('b1000000-0000-0000-0000-000000000001', 2000.0000,  40000.00, 'Ultramilk UHT Full Cream', '2026-01-15', 'Pannacotta baseline'),
  ('b1000000-0000-0000-0000-000000000002', 1100.0000,  78000.00, 'Anchor',                   '2026-01-15', 'Pannacotta baseline'),
  ('b1000000-0000-0000-0000-000000000003', 1000.0000, 130000.00, 'Vivo',                     '2026-01-15', 'Pannacotta baseline'),
  ('b1000000-0000-0000-0000-000000000007',  100.0000, 100000.00, 'Twinning',                 '2026-01-15', 'Pannacotta baseline'),
  ('b1000000-0000-0000-0000-000000000005',  100.0000,  28000.00, NULL,                       '2026-01-15', 'Pannacotta baseline'),
  ('b1000000-0000-0000-0000-000000000006',  500.0000,  16000.00, NULL,                       '2026-01-15', 'Pannacotta baseline'),
  ('b1000000-0000-0000-0000-000000000004',  100.0000,  10400.00, NULL,                       '2026-01-15', 'Pannacotta baseline'),
  ('b1000000-0000-0000-0000-000000000010',   44.0000,  66000.00, 'Cup + Spoon',              '2026-01-15', 'Pannacotta baseline'),
  ('b1000000-0000-0000-0000-000000000009',   44.0000,  44000.00, NULL,                       '2026-01-15', 'Pannacotta baseline'),
  ('b1000000-0000-0000-0000-000000000008',   44.0000,  72160.00, 'Lotus Biscoff, Strawberry, Oreo', '2026-01-15', 'Pannacotta baseline');

-- ======================
-- AKTIFKAN KEMBALI TRIGGER stok
-- ======================
ALTER TABLE sales ENABLE TRIGGER trg_deduct_stock_on_sale;
ALTER TABLE purchases ENABLE TRIGGER trg_update_stock_on_purchase;

-- ======================
-- VERIFIKASI DATA (uncomment untuk cek)
-- Expected: 6 produk, 18 bahan, 51 resep, 53 sales, 18 purchases
-- profit_calculations & customers auto-generated oleh trigger
-- ======================
-- SELECT 'products' AS tabel, COUNT(*) AS jumlah FROM products
-- UNION ALL SELECT 'ingredients', COUNT(*) FROM ingredients
-- UNION ALL SELECT 'recipes', COUNT(*) FROM recipes
-- UNION ALL SELECT 'sales', COUNT(*) FROM sales
-- UNION ALL SELECT 'purchases', COUNT(*) FROM purchases
-- UNION ALL SELECT 'profit_calculations', COUNT(*) FROM profit_calculations
-- UNION ALL SELECT 'customers', COUNT(*) FROM customers;
