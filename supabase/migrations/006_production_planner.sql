-- ============================================================
-- File: supabase/migrations/006_production_planner.sql
-- Versi: v0.13.0
-- Deskripsi: View daily_production_planner untuk Task 17.0.
--            Mengimplementasikan Formula 5.10 (PRD Section 5.7):
--              recommended = CEIL((avg_sales_7d + pending_preorders
--                                  - current_stock) / pcs_per_batch)
--              IF recommended < 0: recommended = 0
--
--            Sumber data:
--            • avg_sales_7d     = SUM(amount) sales 7 hari terakhir / 7
--                                  (exclude void). Pre-order Delivered
--                                  sudah tercatat di sales, jadi ikut.
--            • pending_preorders = SUM(amount) sales dengan sale_type
--                                  'Pre-order' & status Pending/Confirmed
--                                  & pre_order_date >= CURRENT_DATE
--            • current_stock    = SUM(batch_quantity) batches Completed
--                                  yang belum expired
--            • pcs_per_batch    = MAX(recipes.pcs_per_batch) per produk
--                                  (resep satu produk pakai nilai sama)
-- ============================================================

CREATE OR REPLACE VIEW daily_production_planner AS
WITH
-- Rata-rata penjualan harian 7 hari terakhir per produk (exclude void)
avg_sales AS (
    SELECT
        s.product_id,
        COALESCE(SUM(s.amount)::numeric / 7.0, 0) AS avg_daily
    FROM sales s
    WHERE s.is_void = false
      AND s.date >= (CURRENT_DATE - INTERVAL '7 days')
      AND s.date <  CURRENT_DATE
    GROUP BY s.product_id
),
-- Pre-order pending/confirmed untuk hari ini ke depan
pending_po AS (
    SELECT
        s.product_id,
        COALESCE(SUM(s.amount), 0) AS qty_pending
    FROM sales s
    WHERE s.is_void = false
      AND s.sale_type = 'Pre-order'
      AND s.pre_order_status IN ('Pending', 'Confirmed')
      AND s.pre_order_date >= CURRENT_DATE
    GROUP BY s.product_id
),
-- Stok produk jadi = batch Completed yang belum kadaluarsa
current_stock AS (
    SELECT
        b.product_id,
        COALESCE(SUM(b.batch_quantity), 0) AS qty_stock
    FROM batches b
    WHERE b.status = 'Completed'
      AND b.expiration_date >= CURRENT_DATE
    GROUP BY b.product_id
),
-- pcs per batch per produk (dari resep; ambil nilai maksimum sebagai referensi)
pcs_ref AS (
    SELECT
        r.product_id,
        MAX(r.pcs_per_batch) AS pcs_per_batch
    FROM recipes r
    GROUP BY r.product_id
)
SELECT
    p.id                                          AS product_id,
    p.name                                        AS product_name,
    p.is_active                                   AS product_active,
    ROUND(COALESCE(a.avg_daily, 0), 2)            AS avg_sales_7d,
    COALESCE(po.qty_pending, 0)::integer          AS pending_preorders,
    COALESCE(cs.qty_stock, 0)::integer            AS current_stock,
    COALESCE(pr.pcs_per_batch, 0)::integer        AS pcs_per_batch,
    -- Selisih kebutuhan sebelum dibulatkan — dipakai UI untuk tooltip/breakdown
    GREATEST(
        COALESCE(a.avg_daily, 0) + COALESCE(po.qty_pending, 0) - COALESCE(cs.qty_stock, 0),
        0
    )                                             AS shortfall,
    -- Formula 5.10: rekomendasi jumlah batch yang perlu diproduksi
    CASE
        WHEN COALESCE(pr.pcs_per_batch, 0) <= 0 THEN 0
        WHEN (COALESCE(a.avg_daily, 0) + COALESCE(po.qty_pending, 0)
              - COALESCE(cs.qty_stock, 0)) <= 0 THEN 0
        ELSE CEIL(
            (COALESCE(a.avg_daily, 0) + COALESCE(po.qty_pending, 0)
             - COALESCE(cs.qty_stock, 0))
            / pr.pcs_per_batch::numeric
        )::integer
    END                                           AS recommended_batches
FROM products p
LEFT JOIN avg_sales     a  ON a.product_id  = p.id
LEFT JOIN pending_po    po ON po.product_id = p.id
LEFT JOIN current_stock cs ON cs.product_id = p.id
LEFT JOIN pcs_ref       pr ON pr.product_id = p.id
WHERE p.is_active = true
ORDER BY recommended_batches DESC, p.name ASC;

GRANT SELECT ON daily_production_planner TO authenticated;

-- CATATAN: View ini tidak punya RLS sendiri. Akses dibatasi di
-- application layer via permission 'batching' (PRD rules: role
-- Owner & Produksi punya visibilitas produksi).
