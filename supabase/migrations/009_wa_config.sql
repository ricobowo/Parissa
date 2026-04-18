-- ============================================================
-- File: supabase/migrations/009_wa_config.sql
-- Versi: v0.15.0
-- Deskripsi: Task 20.0 — Konfigurasi WhatsApp per user untuk notifikasi Fonnte
--   1) Tabel wa_config: 1 row per user (nomor HP tujuan + toggle aktif).
--   2) RLS: user hanya bisa read/update miliknya; service_role bebas (Edge Fn).
--   3) Helper view active_wa_recipients — dipakai oleh Edge Function stock-alert.
--   4) Template scheduling cron (comment saja — dijalankan manual setelah deploy).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tabel wa_config
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wa_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    -- Nomor HP format Fonnte: 628xxxxxxxxx (11-15 digit setelah 62)
    phone VARCHAR(20) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT wa_config_phone_format CHECK (phone ~ '^628[0-9]{8,13}$')
);

CREATE INDEX IF NOT EXISTS idx_wa_config_enabled
    ON wa_config(is_enabled) WHERE is_enabled = true;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION trigger_wa_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_wa_config_updated_at ON wa_config;
CREATE TRIGGER trg_wa_config_updated_at
    BEFORE UPDATE ON wa_config
    FOR EACH ROW EXECUTE FUNCTION trigger_wa_config_updated_at();

-- ------------------------------------------------------------
-- 2. Row Level Security
--    User hanya melihat & mengubah barisnya sendiri.
--    Edge Function menggunakan service_role — bypass RLS otomatis.
-- ------------------------------------------------------------
ALTER TABLE wa_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wa_config_select_own" ON wa_config;
CREATE POLICY "wa_config_select_own" ON wa_config
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "wa_config_insert_own" ON wa_config;
CREATE POLICY "wa_config_insert_own" ON wa_config
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "wa_config_update_own" ON wa_config;
CREATE POLICY "wa_config_update_own" ON wa_config
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "wa_config_delete_own" ON wa_config;
CREATE POLICY "wa_config_delete_own" ON wa_config
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- ------------------------------------------------------------
-- 3. View active recipients — dipakai Edge Function (pakai service_role)
--    Hanya user aktif + WA aktif, format siap kirim ke Fonnte.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW active_wa_recipients
WITH (security_invoker = true) AS
SELECT
    wc.user_id,
    u.name AS user_name,
    wc.phone
FROM wa_config wc
JOIN users u ON u.id = wc.user_id
WHERE wc.is_enabled = true
  AND u.is_active = true;

-- ------------------------------------------------------------
-- 4. Helper: hitung rata-rata pemakaian bahan per hari 30 hari terakhir
--    avg_daily_usage = SUM(sales.amount × recipe.qty_per_batch / pcs_per_batch) / 30
--    Dipakai Edge Function untuk Formula 5.8.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION calc_avg_daily_usage(p_ingredient_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_total DECIMAL := 0;
BEGIN
    SELECT COALESCE(SUM(
        s.amount * (r.quantity_per_batch::DECIMAL / NULLIF(r.pcs_per_batch, 0))
    ), 0)
    INTO v_total
    FROM sales s
    JOIN recipes r ON r.product_id = s.product_id
    WHERE r.ingredient_id = p_ingredient_id
      AND s.date >= CURRENT_DATE - INTERVAL '30 days';

    RETURN ROUND(v_total / 30.0, 2);
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- ============================================================
-- CRON SCHEDULING (dijalankan manual setelah Edge Function deploy & secret set)
-- ------------------------------------------------------------
-- Jalankan di Supabase SQL editor SEKALI saja, setelah:
--   supabase secrets set FONNTE_TOKEN=xxx
--   supabase functions deploy stock-alert
-- Tiap hari 08:00 WIB = 01:00 UTC
--
--   SELECT cron.schedule(
--     'stock-alert-daily',
--     '0 1 * * *',
--     $$
--     SELECT net.http_post(
--       url := 'https://<project-ref>.supabase.co/functions/v1/stock-alert',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer <service_role_key>'
--       ),
--       body := '{}'::jsonb
--     );
--     $$
--   );
-- ============================================================
