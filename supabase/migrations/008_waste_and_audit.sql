-- ============================================================
-- File: supabase/migrations/008_waste_and_audit.sql
-- Versi: v0.14.0
-- Deskripsi: Task 19.0 — Waste Tracking & Audit Trail
--   1) Trigger auto-hitung waste_cost (Formula 5.9) saat waste_logs di-insert.
--   2) Generic audit trigger — catat INSERT/UPDATE/DELETE ke audit_logs.
--   3) Pasang trigger ke tabel bisnis inti: sales, products, ingredients,
--      batches, purchases, recipes, waste_logs, customers, roles, users.
--   4) View profit_report_with_waste — laporan profit + adjusted_profit.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Auto-hitung waste_cost (Formula 5.9)
--    waste_cost = quantity × calculate_product_cost(product_id)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_calculate_waste_cost()
RETURNS TRIGGER AS $$
DECLARE
    v_cost_per_unit DECIMAL(12,2);
BEGIN
    v_cost_per_unit := calculate_product_cost(NEW.product_id);
    -- Jika client tidak isi waste_cost (atau isi 0), hitung otomatis.
    IF NEW.waste_cost IS NULL OR NEW.waste_cost = 0 THEN
        NEW.waste_cost := v_cost_per_unit * NEW.quantity;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_calculate_waste_cost ON waste_logs;
CREATE TRIGGER trg_calculate_waste_cost
    BEFORE INSERT ON waste_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_calculate_waste_cost();

-- ------------------------------------------------------------
-- 2. Helper: resolve user ID saat ini (auth.uid() di Supabase)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION current_app_user_id()
RETURNS UUID AS $$
    SELECT COALESCE(auth.uid(), NULL)::UUID;
$$ LANGUAGE sql STABLE SET search_path = public;

-- ------------------------------------------------------------
-- 3. Generic audit trigger
--    Catat semua perubahan ke audit_logs dengan old/new JSONB.
--    Skip kolom internal yang auto-update (updated_at) agar tidak noise.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_audit_row()
RETURNS TRIGGER AS $$
DECLARE
    v_old  JSONB;
    v_new  JSONB;
    v_rid  UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_old := NULL;
        v_new := to_jsonb(NEW);
        v_rid := NEW.id;
    ELSIF TG_OP = 'UPDATE' THEN
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
        v_rid := NEW.id;
        -- Skip kalau hanya updated_at yang berubah (noise)
        IF (v_old - 'updated_at') = (v_new - 'updated_at') THEN
            RETURN NEW;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        v_old := to_jsonb(OLD);
        v_new := NULL;
        v_rid := OLD.id;
    END IF;

    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (TG_TABLE_NAME, v_rid, TG_OP, v_old, v_new, current_app_user_id());

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ------------------------------------------------------------
-- 4. Pasang trigger audit ke semua tabel bisnis inti
--    Tidak termasuk: profit_calculations, stock_notifications, audit_logs itu sendiri
-- ------------------------------------------------------------
DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY[
        'sales', 'products', 'ingredients', 'batches', 'purchases',
        'recipes', 'waste_logs', 'customers', 'roles', 'users'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%I ON %I;', t, t);
        EXECUTE format(
            'CREATE TRIGGER trg_audit_%I
                AFTER INSERT OR UPDATE OR DELETE ON %I
                FOR EACH ROW EXECUTE FUNCTION trigger_audit_row();',
            t, t
        );
    END LOOP;
END $$;

-- ------------------------------------------------------------
-- 5. View profit_report_with_waste — laporan profit per hari,
--    dengan waste_cost dan adjusted_profit (PRD Section 5.9).
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW profit_report_with_waste AS
WITH sales_agg AS (
    SELECT
        s.date,
        SUM(CASE WHEN s.payment_status = 'Sudah' THEN pc.total_revenue ELSE 0 END) AS total_revenue,
        SUM(pc.total_cost)                                                         AS total_cost,
        SUM(pc.total_profit)                                                       AS total_profit
    FROM sales s
    LEFT JOIN profit_calculations pc ON pc.sale_id = s.id
    WHERE s.is_void = false
    GROUP BY s.date
),
waste_agg AS (
    SELECT
        w.date,
        SUM(w.waste_cost) AS total_waste_cost,
        SUM(w.quantity)   AS total_waste_qty
    FROM waste_logs w
    GROUP BY w.date
)
SELECT
    COALESCE(s.date, w.date)                        AS date,
    COALESCE(s.total_revenue, 0)                    AS total_revenue,
    COALESCE(s.total_cost, 0)                       AS total_cost,
    COALESCE(s.total_profit, 0)                     AS total_profit,
    COALESCE(w.total_waste_cost, 0)                 AS total_waste_cost,
    COALESCE(w.total_waste_qty, 0)                  AS total_waste_qty,
    COALESCE(s.total_profit, 0)
        - COALESCE(w.total_waste_cost, 0)           AS adjusted_profit
FROM sales_agg s
FULL OUTER JOIN waste_agg w ON w.date = s.date
ORDER BY date DESC;

GRANT SELECT ON profit_report_with_waste TO authenticated;

-- ------------------------------------------------------------
-- 6. Permission baru: 'waste' dan 'audit' untuk role Owner
--    Role lain bisa ditambahkan lewat UI Settings > Role Management.
-- ------------------------------------------------------------
UPDATE roles
SET permissions = permissions
    || '{"waste": true}'::jsonb
    || '{"audit": true}'::jsonb
    || '{"history": true}'::jsonb
WHERE name = 'Owner';

UPDATE roles
SET permissions = permissions
    || '{"waste": true}'::jsonb
    || '{"history": true}'::jsonb
WHERE name = 'Produksi';

UPDATE roles
SET permissions = permissions
    || '{"history": true}'::jsonb
WHERE name = 'Admin Keuangan';
