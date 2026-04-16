-- ============================================================
-- File: supabase/migrations/003_stock_integrity.sql
-- Versi: v0.10.0
-- Deskripsi: Integritas stok — guard negatif, void-sale restoration,
--            dan permission khusus edit minimum_stock_level.
-- ============================================================

-- ------------------------------------------------------------
-- 1. GUARD STOK NEGATIF pada trigger deduct-on-sale
--    Perilaku: raise exception dengan pesan Bahasa Indonesia
--    berisi nama bahan, stok tersedia, dan jumlah dibutuhkan.
--    Kasir melihat toast actionable, bukan generic DB error.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_deduct_stock_on_sale()
RETURNS TRIGGER AS $$
DECLARE
    v_shortfall RECORD;
BEGIN
    -- Cek dulu apakah ada bahan yang tidak cukup sebelum melakukan update
    -- Ini penting: kita tidak boleh partial-update stok (sebagian bahan terpotong, sebagian gagal)
    SELECT
        i.name AS ingredient_name,
        i.quantity_available,
        (r.quantity_per_batch / r.pcs_per_batch * NEW.amount) AS qty_needed
    INTO v_shortfall
    FROM ingredients i
    JOIN recipes r ON r.ingredient_id = i.id
    WHERE r.product_id = NEW.product_id
      AND i.quantity_available < (r.quantity_per_batch / r.pcs_per_batch * NEW.amount)
    LIMIT 1;

    IF FOUND THEN
        -- Error code custom P0001 — frontend bisa catch dan tampilkan toast spesifik
        RAISE EXCEPTION 'Stok bahan "%" tidak cukup. Tersedia: %, dibutuhkan: %.',
            v_shortfall.ingredient_name,
            v_shortfall.quantity_available,
            v_shortfall.qty_needed
            USING ERRCODE = 'P0001';
    END IF;

    -- Aman — lakukan deduct
    UPDATE ingredients i
    SET
        quantity_available = i.quantity_available - (r.quantity_per_batch / r.pcs_per_batch * NEW.amount),
        updated_at = NOW()
    FROM recipes r
    WHERE r.product_id = NEW.product_id
      AND r.ingredient_id = i.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- 2. VOID-SALE RESTORATION
--    Saat transaksi di-void (soft delete via kolom is_void),
--    stok bahan harus dikembalikan agar laporan konsisten.
--    Sale tidak boleh hard-delete (PRD Section 5.1).
-- ------------------------------------------------------------

-- Kolom soft-delete untuk sales (jika belum ada)
ALTER TABLE sales ADD COLUMN IF NOT EXISTS is_void BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS void_reason TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS voided_at TIMESTAMPTZ;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS voided_by UUID REFERENCES users(id);

CREATE OR REPLACE FUNCTION trigger_restore_stock_on_void()
RETURNS TRIGGER AS $$
BEGIN
    -- Hanya jalankan saat transisi is_void: false → true
    IF OLD.is_void = false AND NEW.is_void = true THEN
        UPDATE ingredients i
        SET
            quantity_available = i.quantity_available + (r.quantity_per_batch / r.pcs_per_batch * NEW.amount),
            updated_at = NOW()
        FROM recipes r
        WHERE r.product_id = NEW.product_id
          AND r.ingredient_id = i.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_restore_stock_on_void ON sales;
CREATE TRIGGER trg_restore_stock_on_void
    AFTER UPDATE OF is_void ON sales
    FOR EACH ROW
    EXECUTE FUNCTION trigger_restore_stock_on_void();

-- ------------------------------------------------------------
-- 3. PERMISSION BARU: stock.edit_min_level
--    Dipisah dari permission 'stock' umum karena mengubah
--    threshold bersifat strategis (pengaruh reorder & cashflow).
--    Default true hanya untuk Owner dan Admin Keuangan.
-- ------------------------------------------------------------

-- Tambahkan key baru ke JSONB permissions di semua role existing (default false)
UPDATE roles
SET permissions = permissions || '{"stock.edit_min_level": false}'::jsonb
WHERE NOT (permissions ? 'stock.edit_min_level');

-- Grant ke Owner dan Admin Keuangan secara default
UPDATE roles
SET permissions = jsonb_set(permissions, '{stock.edit_min_level}', 'true'::jsonb)
WHERE name IN ('Owner', 'Admin Keuangan');

-- ------------------------------------------------------------
-- 4. RLS POLICY TAMBAHAN — guard kolom minimum_stock_level
--    Trik: kita buat policy UPDATE baru yang lebih ketat untuk
--    kasus perubahan minimum_stock_level. Policy existing
--    'ingredients_update' tetap berlaku untuk kolom lain.
--
--    PostgreSQL RLS tidak support kolom-level WITH CHECK langsung,
--    jadi kita pakai BEFORE UPDATE trigger sebagai enforcement.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION guard_min_stock_level_edit()
RETURNS TRIGGER AS $$
BEGIN
    -- Jika minimum_stock_level berubah, wajib punya permission khusus
    IF OLD.minimum_stock_level IS DISTINCT FROM NEW.minimum_stock_level THEN
        IF NOT user_has_permission('stock.edit_min_level') THEN
            RAISE EXCEPTION 'Tidak punya izin mengubah level stok minimum bahan "%".',
                OLD.name
                USING ERRCODE = '42501';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_guard_min_stock_level ON ingredients;
CREATE TRIGGER trg_guard_min_stock_level
    BEFORE UPDATE OF minimum_stock_level ON ingredients
    FOR EACH ROW
    EXECUTE FUNCTION guard_min_stock_level_edit();

-- ------------------------------------------------------------
-- 5. VIEW HELPER: ingredients_with_status
--    Status dihitung di DB agar konsisten dengan Formula 5.6
--    dan bisa dipakai untuk query filter di UI.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW ingredients_with_status AS
SELECT
    i.*,
    CASE
        WHEN i.quantity_available <= i.minimum_stock_level THEN 'Habis'
        WHEN i.quantity_available <= (2 * i.minimum_stock_level) THEN 'Menipis'
        ELSE 'Aman'
    END AS stock_status
FROM ingredients i;

-- Grant select pada view untuk authenticated users
GRANT SELECT ON ingredients_with_status TO authenticated;
