-- ============================================================
-- File: supabase/migrations/005_fix_security_warnings.sql
-- Versi: v0.12.1
-- Deskripsi: Perbaikan security warning dari Supabase Database Linter:
--            1) Tambah SET search_path = public ke semua fungsi publik
--               (mencegah search_path injection attack)
--            2) Perbaiki RLS policy stock_notifications_insert
--               dari WITH CHECK (true) ke permission check proper
-- ============================================================

-- ------------------------------------------------------------
-- 1. FIX: function_search_path_mutable
--    Tanpa SET search_path, penyerang bisa buat schema palsu yang
--    dieksekusi sebelum schema 'public' — fungsi jadi pakai tabel
--    versi mereka. Solusi: kunci search_path ke 'public' saja.
-- ------------------------------------------------------------

ALTER FUNCTION public.calculate_product_cost(UUID)             SET search_path = public;
ALTER FUNCTION public.trigger_calculate_profit()               SET search_path = public;
ALTER FUNCTION public.trigger_deduct_stock_on_sale()           SET search_path = public;
ALTER FUNCTION public.trigger_upsert_customer()                SET search_path = public;
ALTER FUNCTION public.trigger_update_stock_on_purchase()       SET search_path = public;
ALTER FUNCTION public.trigger_set_updated_at()                 SET search_path = public;
ALTER FUNCTION public.user_has_permission(TEXT)                SET search_path = public;
ALTER FUNCTION public.user_is_owner()                          SET search_path = public;
ALTER FUNCTION public.trigger_restore_stock_on_void()          SET search_path = public;
ALTER FUNCTION public.guard_min_stock_level_edit()             SET search_path = public;
ALTER FUNCTION public.trigger_generate_batch_number()          SET search_path = public;
ALTER FUNCTION public.trigger_deduct_stock_on_batch()          SET search_path = public;
ALTER FUNCTION public.guard_batch_status_transition()          SET search_path = public;

-- ------------------------------------------------------------
-- 2. FIX: rls_policy_always_true pada stock_notifications
--    Policy lama: WITH CHECK (true) — siapa pun bisa insert sembarang baris.
--    Policy baru: hanya user dengan permission 'stock' yang bisa insert.
--    Konsisten dengan tabel terkait stok lainnya (ingredients, waste_logs).
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "stock_notifications_insert" ON stock_notifications;

CREATE POLICY "stock_notifications_insert" ON stock_notifications
    FOR INSERT TO authenticated
    WITH CHECK (user_has_permission('stock'));
