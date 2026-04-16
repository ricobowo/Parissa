-- ============================================================
-- File: supabase/migrations/004_batching_triggers.sql
-- Versi: v0.12.0
-- Deskripsi: Trigger & view untuk Task 16.0 — Batching & Expiry Tracker.
--            1) Auto-generate batch_number jika kosong.
--            2) Auto-deduct stok bahan (BOM × batch_quantity) dengan guard
--               stok negatif — sama polanya dengan deduct-on-sale.
--            3) Guard transisi status: Planned → In Progress → Completed.
--               Transisi ke 'Expired' hanya dari Planned/In Progress dan
--               memang sudah lewat expiration_date (diatur di view/UI).
--            4) View batches_with_expiry — hitung days_until_expiry dan
--               expiry_bucket ('expired' | 'h1' | 'h3' | 'ok') agar UI
--               konsisten dengan sisi DB (tidak ada cron/edge function).
-- ============================================================

-- ------------------------------------------------------------
-- 1. AUTO-GENERATE batch_number
--    Format: <PRODUKPREFIX>-YYYYMMDD-<SERIAL2>
--    Contoh: PAN-20260417-01
--    Prefix diambil 3 huruf pertama nama produk (uppercase).
--    Serial = urutan batch produk tersebut pada tanggal yang sama.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_generate_batch_number()
RETURNS TRIGGER AS $$
DECLARE
    v_prefix TEXT;
    v_serial INTEGER;
BEGIN
    -- Lewati jika user sudah isi manual
    IF NEW.batch_number IS NOT NULL AND length(trim(NEW.batch_number)) > 0 THEN
        RETURN NEW;
    END IF;

    SELECT upper(substring(regexp_replace(p.name, '[^A-Za-z]', '', 'g') FROM 1 FOR 3))
    INTO v_prefix
    FROM products p
    WHERE p.id = NEW.product_id;

    IF v_prefix IS NULL OR length(v_prefix) = 0 THEN
        v_prefix := 'BAT';
    END IF;

    SELECT COALESCE(COUNT(*), 0) + 1
    INTO v_serial
    FROM batches
    WHERE product_id = NEW.product_id
      AND batch_date = NEW.batch_date;

    NEW.batch_number := v_prefix || '-' || to_char(NEW.batch_date, 'YYYYMMDD')
                        || '-' || lpad(v_serial::text, 2, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_batch_number ON batches;
CREATE TRIGGER trg_generate_batch_number
    BEFORE INSERT ON batches
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_batch_number();

-- ------------------------------------------------------------
-- 2. AUTO-DEDUCT STOK BAHAN saat batch dibuat
--    qty_deducted[i] = recipe.quantity_per_batch[i] × (batch_quantity / recipe.pcs_per_batch)
--    Sama dengan pola deduct-on-sale: cek shortfall dulu (all-or-nothing),
--    baru lakukan UPDATE. Error code P0001 → frontend tampilkan toast spesifik.
--
--    CATATAN: batch_quantity di schema = pcs yang diproduksi. Resep menyimpan
--    quantity_per_batch untuk produksi "pcs_per_batch" pcs, jadi faktor
--    pengali = batch_quantity / pcs_per_batch.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_deduct_stock_on_batch()
RETURNS TRIGGER AS $$
DECLARE
    v_shortfall RECORD;
BEGIN
    SELECT
        i.name AS ingredient_name,
        i.quantity_available,
        (r.quantity_per_batch * (NEW.batch_quantity::numeric / r.pcs_per_batch)) AS qty_needed
    INTO v_shortfall
    FROM ingredients i
    JOIN recipes r ON r.ingredient_id = i.id
    WHERE r.product_id = NEW.product_id
      AND i.quantity_available < (r.quantity_per_batch * (NEW.batch_quantity::numeric / r.pcs_per_batch))
    LIMIT 1;

    IF FOUND THEN
        RAISE EXCEPTION 'Stok bahan "%" tidak cukup untuk batch ini. Tersedia: %, dibutuhkan: %.',
            v_shortfall.ingredient_name,
            v_shortfall.quantity_available,
            v_shortfall.qty_needed
            USING ERRCODE = 'P0001';
    END IF;

    UPDATE ingredients i
    SET
        quantity_available = i.quantity_available
            - (r.quantity_per_batch * (NEW.batch_quantity::numeric / r.pcs_per_batch)),
        updated_at = NOW()
    FROM recipes r
    WHERE r.product_id = NEW.product_id
      AND r.ingredient_id = i.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deduct_stock_on_batch ON batches;
CREATE TRIGGER trg_deduct_stock_on_batch
    AFTER INSERT ON batches
    FOR EACH ROW
    EXECUTE FUNCTION trigger_deduct_stock_on_batch();

-- ------------------------------------------------------------
-- 3. GUARD STATE MACHINE status batch
--    Transisi valid:
--      Planned     → In Progress, Expired, Cancelled(tidak dipakai di UI)
--      In Progress → Completed,   Expired
--      Completed   → (terminal)
--      Expired     → (terminal)
--    Nilai status diluar whitelist ditolak.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION guard_batch_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    IF NEW.status NOT IN ('Planned', 'In Progress', 'Completed', 'Expired') THEN
        RAISE EXCEPTION 'Status batch tidak valid: %.', NEW.status
            USING ERRCODE = '22023';
    END IF;

    -- Cek transisi
    IF OLD.status = 'Completed' OR OLD.status = 'Expired' THEN
        RAISE EXCEPTION 'Batch dengan status "%" tidak bisa diubah lagi.', OLD.status
            USING ERRCODE = '22023';
    END IF;

    IF OLD.status = 'Planned' AND NEW.status NOT IN ('In Progress', 'Expired') THEN
        RAISE EXCEPTION 'Transisi status tidak valid: % → %.', OLD.status, NEW.status
            USING ERRCODE = '22023';
    END IF;

    IF OLD.status = 'In Progress' AND NEW.status NOT IN ('Completed', 'Expired') THEN
        RAISE EXCEPTION 'Transisi status tidak valid: % → %.', OLD.status, NEW.status
            USING ERRCODE = '22023';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_guard_batch_status ON batches;
CREATE TRIGGER trg_guard_batch_status
    BEFORE UPDATE OF status ON batches
    FOR EACH ROW
    EXECUTE FUNCTION guard_batch_status_transition();

-- ------------------------------------------------------------
-- 4. VIEW batches_with_expiry
--    Menghitung days_until_expiry dan bucket kategori expiry.
--    UI tinggal ambil bucket untuk warna (H-3 = warning, H-1/expired = danger).
--    Tidak mengubah kolom status — "Expired auto-flag" murni computed.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW batches_with_expiry AS
SELECT
    b.*,
    p.name AS product_name,
    (b.expiration_date - CURRENT_DATE) AS days_until_expiry,
    CASE
        WHEN b.expiration_date < CURRENT_DATE                       THEN 'expired'
        WHEN (b.expiration_date - CURRENT_DATE) <= 1                THEN 'h1'
        WHEN (b.expiration_date - CURRENT_DATE) <= 3                THEN 'h3'
        ELSE 'ok'
    END AS expiry_bucket
FROM batches b
LEFT JOIN products p ON p.id = b.product_id;

GRANT SELECT ON batches_with_expiry TO authenticated;
