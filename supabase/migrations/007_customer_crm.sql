-- ============================================================
-- File: supabase/migrations/007_customer_crm.sql
-- Versi: v0.14.0
-- Deskripsi: Task 18.0 — Customer Database & CRM
--   1) Tabel customer_labels   — master label pelanggan (VIP, Regular, dll.)
--                                bisa di-manage di Settings, punya warna.
--   2) Tabel sales_followups   — history follow-up transaksi overdue/piutang.
--   3) Kolom sales.followup_status — status terkini (cache) supaya query list
--                                    overdue cepat tanpa agregasi sales_followups.
--   4) View customer_stats     — agregasi favorite product + count/spend realtime
--                                (melengkapi kolom cache di tabel customers).
--   5) View overdue_payments   — transaksi Belum bayar > 3 hari (Formula 5.10).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tabel master label pelanggan
--    is_system = true → label bawaan, tidak bisa dihapus user.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_labels (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL UNIQUE,
    color       VARCHAR(20) NOT NULL DEFAULT 'gray',  -- gray|blue|green|orange|red|purple
    is_system   BOOLEAN     NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_customer_labels_updated_at
    BEFORE UPDATE ON customer_labels
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Seed label default (idempotent)
INSERT INTO customer_labels (name, color, is_system) VALUES
    ('VIP',     'orange', true),
    ('Regular', 'gray',   true),
    ('New',     'blue',   true)
ON CONFLICT (name) DO NOTHING;

-- RLS: semua authenticated bisa SELECT; hanya permission 'customers' bisa modify.
ALTER TABLE customer_labels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer_labels_select" ON customer_labels
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "customer_labels_insert" ON customer_labels
    FOR INSERT TO authenticated WITH CHECK (user_has_permission('customers'));
CREATE POLICY "customer_labels_update" ON customer_labels
    FOR UPDATE TO authenticated USING (user_has_permission('customers'));
CREATE POLICY "customer_labels_delete" ON customer_labels
    FOR DELETE TO authenticated
    USING (user_has_permission('customers') AND is_system = false);

-- ------------------------------------------------------------
-- 2. Kolom followup_status di sales
--    NULL = belum ada follow-up (atau transaksi sudah bayar).
--    pending      = overdue belum ditangani
--    followed_up  = sudah di-follow-up, menunggu bayar
--    bad_debt     = ditulis off sebagai piutang tak tertagih
--    paid         = sudah lunas (opsional, biasanya payment_status sudah Sudah)
-- ------------------------------------------------------------
ALTER TABLE sales
    ADD COLUMN IF NOT EXISTS followup_status VARCHAR(20);

ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_followup_status_check;
ALTER TABLE sales ADD CONSTRAINT sales_followup_status_check
    CHECK (followup_status IS NULL
        OR followup_status IN ('pending', 'followed_up', 'bad_debt', 'paid'));

CREATE INDEX IF NOT EXISTS idx_sales_followup_status ON sales(followup_status);

-- ------------------------------------------------------------
-- 3. Tabel history follow-up — audit trail khusus CRM
--    Setiap aksi user (call, mark followed-up, mark bad-debt, catat note)
--    tersimpan di sini agar history rapi.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_followups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id     UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    action      VARCHAR(30) NOT NULL
                CHECK (action IN ('followed_up', 'marked_bad_debt',
                                  'payment_received', 'note_added',
                                  'reopened')),
    notes       TEXT,
    created_by  UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_followups_sale ON sales_followups(sale_id);
CREATE INDEX IF NOT EXISTS idx_sales_followups_created ON sales_followups(created_at DESC);

-- RLS
ALTER TABLE sales_followups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sales_followups_select" ON sales_followups
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "sales_followups_insert" ON sales_followups
    FOR INSERT TO authenticated WITH CHECK (user_has_permission('customers'));
-- Tidak ada UPDATE/DELETE — history tidak boleh diubah (soft delete only prinsip).

-- ------------------------------------------------------------
-- 4. Trigger: saat sales_followups di-insert, sync sales.followup_status
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_sync_sale_followup_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sales SET followup_status =
        CASE NEW.action
            WHEN 'followed_up'      THEN 'followed_up'
            WHEN 'marked_bad_debt'  THEN 'bad_debt'
            WHEN 'payment_received' THEN 'paid'
            WHEN 'reopened'         THEN 'pending'
            ELSE followup_status -- note_added: jangan ubah status
        END
    WHERE id = NEW.sale_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_sale_followup_status ON sales_followups;
CREATE TRIGGER trg_sync_sale_followup_status
    AFTER INSERT ON sales_followups
    FOR EACH ROW EXECUTE FUNCTION trigger_sync_sale_followup_status();

-- ------------------------------------------------------------
-- 5. View: customer_stats — agregasi lengkap untuk list customer
--    Gabung tabel customers (cache: total_txns, total_spending) dengan
--    favorite_product (produk dengan total amount terbanyak per customer).
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW customer_stats AS
WITH fav AS (
    SELECT DISTINCT ON (s.customer_name)
        s.customer_name,
        p.id   AS favorite_product_id,
        p.name AS favorite_product_name
    FROM sales s
    JOIN products p ON p.id = s.product_id
    WHERE s.is_void = false
    GROUP BY s.customer_name, p.id, p.name
    ORDER BY s.customer_name, SUM(s.amount) DESC
)
SELECT
    c.id,
    c.name,
    c.phone,
    c.label,
    c.notes,
    c.first_purchase_date,
    c.last_purchase_date,
    c.total_transactions,
    c.total_spending,
    f.favorite_product_id,
    f.favorite_product_name,
    cl.color AS label_color,
    c.created_at,
    c.updated_at
FROM customers c
LEFT JOIN fav f ON f.customer_name = c.name
LEFT JOIN customer_labels cl ON cl.name = c.label;

GRANT SELECT ON customer_stats TO authenticated;

-- ------------------------------------------------------------
-- 6. View: overdue_payments — piutang > 3 hari (PRD Section 5.10)
--    Highlight kuning-oranye di UI. Dipakai halaman CRM overdue list.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW overdue_payments AS
SELECT
    s.id                    AS sale_id,
    s.date                  AS sale_date,
    s.customer_name,
    c.phone                 AS customer_phone,
    p.name                  AS product_name,
    s.amount,
    s.sale_price,
    s.payment_status,
    s.notes,
    s.followup_status,
    (CURRENT_DATE - s.date) AS days_overdue,
    s.created_at
FROM sales s
JOIN products  p ON p.id = s.product_id
LEFT JOIN customers c ON c.name = s.customer_name
WHERE s.is_void = false
  AND s.payment_status = 'Belum'
  AND (CURRENT_DATE - s.date) > 3
  AND COALESCE(s.followup_status, '') NOT IN ('paid', 'bad_debt')
ORDER BY s.date ASC;

GRANT SELECT ON overdue_payments TO authenticated;

-- ------------------------------------------------------------
-- 7. Tandai fungsi baru dengan search_path aman (konsisten dengan mig 005)
-- ------------------------------------------------------------
-- Sudah SET di CREATE FUNCTION di atas.
