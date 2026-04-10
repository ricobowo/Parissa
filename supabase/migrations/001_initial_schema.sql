-- ============================================================
-- File: supabase/migrations/001_initial_schema.sql
-- Versi: v0.2.0
-- Deskripsi: Schema awal database Parissa POS — semua tabel, trigger, RLS, dan view
-- ============================================================

-- ======================
-- TABEL UTAMA
-- ======================

-- Roles (fleksibel, bisa ditambah/kurangi)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(100),
    permissions JSONB NOT NULL DEFAULT '{}',
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (terhubung ke auth.users Supabase)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role_id UUID REFERENCES roles(id),
    language VARCHAR(5) DEFAULT 'id',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products (produk jadi)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    selling_price DECIMAL(12,2) NOT NULL,
    bundling_price DECIMAL(12,2),
    is_bundling BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingredients (bahan baku)
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    purchase_unit VARCHAR(20) NOT NULL,
    supplier VARCHAR(255),
    purchase_price DECIMAL(12,2) NOT NULL,
    packaging_size DECIMAL(12,4) NOT NULL,
    minimum_stock_level DECIMAL(12,4) DEFAULT 0,
    quantity_available DECIMAL(12,4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe/BOM (resep per produk — many-to-many produk x bahan)
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) NOT NULL,
    ingredient_id UUID REFERENCES ingredients(id) NOT NULL,
    quantity_per_batch DECIMAL(12,4) NOT NULL,
    pcs_per_batch INTEGER NOT NULL,
    UNIQUE(product_id, ingredient_id)
);

-- Sales (transaksi penjualan)
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_name VARCHAR(255) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    is_bundling BOOLEAN DEFAULT false,
    menu_detail TEXT,
    topping TEXT,
    sale_price DECIMAL(12,2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Belum',
    sale_type VARCHAR(20) DEFAULT 'Direct',
    pre_order_date DATE,
    pre_order_status VARCHAR(20) DEFAULT 'Pending',
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profit Calculations (kalkulasi profit per transaksi)
CREATE TABLE profit_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) NOT NULL UNIQUE,
    total_revenue DECIMAL(12,2) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    total_profit DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batches (batch produksi)
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) NOT NULL,
    batch_number VARCHAR(50) NOT NULL,
    batch_date DATE NOT NULL DEFAULT CURRENT_DATE,
    batch_quantity INTEGER NOT NULL CHECK (batch_quantity > 0),
    expiration_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Planned',
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases (pembelian bahan baku)
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id UUID REFERENCES ingredients(id) NOT NULL,
    qty_purchased DECIMAL(12,4) NOT NULL,
    price_paid DECIMAL(12,2) NOT NULL,
    supplier VARCHAR(255),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers (database pelanggan)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    label VARCHAR(50),
    notes TEXT,
    first_purchase_date DATE,
    last_purchase_date DATE,
    total_transactions INTEGER DEFAULT 0,
    total_spending DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waste Logs (catatan produk terbuang)
CREATE TABLE waste_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason VARCHAR(50) NOT NULL,
    waste_cost DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs (jejak perubahan data)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Notifications (anti-spam notifikasi WA — max 1x/hari/bahan)
CREATE TABLE stock_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id UUID REFERENCES ingredients(id) NOT NULL,
    notification_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ingredient_id, notification_date)
);

-- ======================
-- INDEKS untuk performa query
-- ======================
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_product ON sales(product_id);
CREATE INDEX idx_sales_payment_status ON sales(payment_status);
CREATE INDEX idx_sales_customer ON sales(customer_name);
CREATE INDEX idx_sales_sale_type ON sales(sale_type);
CREATE INDEX idx_batches_product ON batches(product_id);
CREATE INDEX idx_batches_expiration ON batches(expiration_date);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_purchases_ingredient ON purchases(ingredient_id);
CREATE INDEX idx_purchases_date ON purchases(date);
CREATE INDEX idx_recipes_product ON recipes(product_id);
CREATE INDEX idx_recipes_ingredient ON recipes(ingredient_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record ON audit_logs(record_id);
CREATE INDEX idx_waste_logs_product ON waste_logs(product_id);
CREATE INDEX idx_waste_logs_date ON waste_logs(date);

-- ======================
-- FUNGSI: Hitung cost_per_unit produk dari BOM/resep
-- Formula 5.2: cost_per_unit = SUM(qty_used * cost_per_unit_ingredient) / pcs_per_batch
-- ======================
CREATE OR REPLACE FUNCTION calculate_product_cost(p_product_id UUID)
RETURNS DECIMAL(12,2) AS $$
DECLARE
    v_total_cost DECIMAL(12,2);
    v_pcs_per_batch INTEGER;
BEGIN
    SELECT
        COALESCE(SUM(r.quantity_per_batch * (i.purchase_price / i.packaging_size)), 0),
        COALESCE(MAX(r.pcs_per_batch), 1)
    INTO v_total_cost, v_pcs_per_batch
    FROM recipes r
    JOIN ingredients i ON r.ingredient_id = i.id
    WHERE r.product_id = p_product_id;

    IF v_pcs_per_batch = 0 THEN
        RETURN 0;
    END IF;

    RETURN ROUND(v_total_cost / v_pcs_per_batch, 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- ======================
-- TRIGGER: Auto-hitung profit saat sale di-insert
-- Formula 5.4: profit = revenue - (cost_per_unit * amount)
-- ======================
CREATE OR REPLACE FUNCTION trigger_calculate_profit()
RETURNS TRIGGER AS $$
DECLARE
    v_cost_per_unit DECIMAL(12,2);
    v_total_revenue DECIMAL(12,2);
    v_total_cost DECIMAL(12,2);
    v_total_profit DECIMAL(12,2);
BEGIN
    -- Hitung cost per unit dari resep
    v_cost_per_unit := calculate_product_cost(NEW.product_id);

    -- Hitung revenue berdasarkan status bayar (Formula 5.4)
    IF NEW.payment_status = 'Sudah' THEN
        v_total_revenue := NEW.sale_price;
    ELSE
        v_total_revenue := 0;
    END IF;

    v_total_cost := v_cost_per_unit * NEW.amount;
    v_total_profit := v_total_revenue - v_total_cost;

    -- Insert atau update profit calculation
    INSERT INTO profit_calculations (sale_id, total_revenue, total_cost, total_profit)
    VALUES (NEW.id, v_total_revenue, v_total_cost, v_total_profit)
    ON CONFLICT (sale_id)
    DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        total_cost = EXCLUDED.total_cost,
        total_profit = EXCLUDED.total_profit;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_profit
    AFTER INSERT OR UPDATE ON sales
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calculate_profit();

-- ======================
-- TRIGGER: Auto-kurangi stok bahan baku saat sale
-- Stok dikurangi berdasarkan BOM: qty_per_batch / pcs_per_batch * amount
-- ======================
CREATE OR REPLACE FUNCTION trigger_deduct_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
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

CREATE TRIGGER trg_deduct_stock_on_sale
    AFTER INSERT ON sales
    FOR EACH ROW
    EXECUTE FUNCTION trigger_deduct_stock_on_sale();

-- ======================
-- TRIGGER: Auto-upsert customer saat sale
-- ======================
CREATE OR REPLACE FUNCTION trigger_upsert_customer()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO customers (name, first_purchase_date, last_purchase_date, total_transactions, total_spending)
    VALUES (NEW.customer_name, NEW.date, NEW.date, 1, NEW.sale_price)
    ON CONFLICT (name)
    DO UPDATE SET
        last_purchase_date = NEW.date,
        total_transactions = customers.total_transactions + 1,
        total_spending = customers.total_spending + NEW.sale_price,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_upsert_customer
    AFTER INSERT ON sales
    FOR EACH ROW
    EXECUTE FUNCTION trigger_upsert_customer();

-- ======================
-- TRIGGER: Auto-tambah stok saat purchase/restock
-- ======================
CREATE OR REPLACE FUNCTION trigger_update_stock_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ingredients
    SET
        quantity_available = quantity_available + NEW.qty_purchased,
        updated_at = NOW()
    WHERE id = NEW.ingredient_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stock_on_purchase
    AFTER INSERT ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_stock_on_purchase();

-- ======================
-- TRIGGER: Auto-update updated_at pada tabel yang punya kolom tersebut
-- ======================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_ingredients_updated_at
    BEFORE UPDATE ON ingredients FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_sales_updated_at
    BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ======================
-- ROW LEVEL SECURITY (RLS)
-- ======================

-- Aktifkan RLS di semua tabel
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_notifications ENABLE ROW LEVEL SECURITY;

-- Fungsi helper: cek apakah user punya permission tertentu
CREATE OR REPLACE FUNCTION user_has_permission(p_module TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = auth.uid()
          AND u.is_active = true
          AND (r.permissions->>p_module)::boolean = true
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Fungsi helper: cek apakah user adalah Owner (system role)
CREATE OR REPLACE FUNCTION user_is_owner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = auth.uid()
          AND r.name = 'Owner'
          AND r.is_system = true
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Policy: Roles — semua user bisa lihat, hanya Owner bisa edit
CREATE POLICY "roles_select" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "roles_insert" ON roles FOR INSERT TO authenticated WITH CHECK (user_is_owner());
CREATE POLICY "roles_update" ON roles FOR UPDATE TO authenticated USING (user_is_owner());
CREATE POLICY "roles_delete" ON roles FOR DELETE TO authenticated USING (user_is_owner() AND is_system = false);

-- Policy: Users — user lihat diri sendiri, Owner lihat semua
CREATE POLICY "users_select_self" ON users FOR SELECT TO authenticated USING (id = auth.uid() OR user_is_owner());
CREATE POLICY "users_insert" ON users FOR INSERT TO authenticated WITH CHECK (user_is_owner());
CREATE POLICY "users_update_self" ON users FOR UPDATE TO authenticated USING (id = auth.uid() OR user_is_owner());

-- Policy: Products — semua user bisa lihat, user dengan permission bisa edit
CREATE POLICY "products_select" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT TO authenticated WITH CHECK (user_has_permission('products'));
CREATE POLICY "products_update" ON products FOR UPDATE TO authenticated USING (user_has_permission('products'));

-- Policy: Ingredients — semua bisa lihat, permission 'stock' untuk edit
CREATE POLICY "ingredients_select" ON ingredients FOR SELECT TO authenticated USING (true);
CREATE POLICY "ingredients_insert" ON ingredients FOR INSERT TO authenticated WITH CHECK (user_has_permission('stock'));
CREATE POLICY "ingredients_update" ON ingredients FOR UPDATE TO authenticated USING (user_has_permission('stock'));

-- Policy: Recipes — semua bisa lihat, permission 'recipes' untuk edit
CREATE POLICY "recipes_select" ON recipes FOR SELECT TO authenticated USING (true);
CREATE POLICY "recipes_insert" ON recipes FOR INSERT TO authenticated WITH CHECK (user_has_permission('recipes'));
CREATE POLICY "recipes_update" ON recipes FOR UPDATE TO authenticated USING (user_has_permission('recipes'));
CREATE POLICY "recipes_delete" ON recipes FOR DELETE TO authenticated USING (user_has_permission('recipes'));

-- Policy: Sales — permission 'pos' untuk input, semua dengan permission 'dashboard' bisa lihat
CREATE POLICY "sales_select" ON sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "sales_insert" ON sales FOR INSERT TO authenticated WITH CHECK (user_has_permission('pos'));
CREATE POLICY "sales_update" ON sales FOR UPDATE TO authenticated USING (user_has_permission('pos'));

-- Policy: Profit Calculations — read-only via trigger, semua bisa lihat
CREATE POLICY "profit_select" ON profit_calculations FOR SELECT TO authenticated USING (true);

-- Policy: Batches — permission 'batching'
CREATE POLICY "batches_select" ON batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "batches_insert" ON batches FOR INSERT TO authenticated WITH CHECK (user_has_permission('batching'));
CREATE POLICY "batches_update" ON batches FOR UPDATE TO authenticated USING (user_has_permission('batching'));

-- Policy: Purchases — permission 'purchases'
CREATE POLICY "purchases_select" ON purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "purchases_insert" ON purchases FOR INSERT TO authenticated WITH CHECK (user_has_permission('purchases'));

-- Policy: Customers — semua bisa lihat, permission 'customers' untuk edit
CREATE POLICY "customers_select" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "customers_update" ON customers FOR UPDATE TO authenticated USING (user_has_permission('customers'));

-- Policy: Waste Logs — permission 'stock'
CREATE POLICY "waste_logs_select" ON waste_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "waste_logs_insert" ON waste_logs FOR INSERT TO authenticated WITH CHECK (user_has_permission('stock'));

-- Policy: Audit Logs — read-only, hanya Owner dan Admin Keuangan
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT TO authenticated USING (user_has_permission('settings') OR user_is_owner());

-- Policy: Stock Notifications — semua bisa lihat
CREATE POLICY "stock_notifications_select" ON stock_notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "stock_notifications_insert" ON stock_notifications FOR INSERT TO authenticated WITH CHECK (true);

-- ======================
-- VIEWS: Dashboard KPI
-- ======================

-- View: Ringkasan KPI dashboard
CREATE OR REPLACE VIEW dashboard_kpi AS
SELECT
    -- Total Revenue (hanya transaksi "Sudah" bayar)
    COALESCE(SUM(CASE WHEN s.payment_status = 'Sudah' THEN s.sale_price ELSE 0 END), 0) AS total_revenue,
    -- Total Cost (semua transaksi)
    COALESCE(SUM(pc.total_cost), 0) AS total_cost,
    -- Total Profit
    COALESCE(SUM(pc.total_profit), 0) AS total_profit,
    -- Total Unpaid (belum bayar)
    COALESCE(SUM(CASE WHEN s.payment_status = 'Belum' THEN s.sale_price ELSE 0 END), 0) AS total_unpaid,
    -- Total Unit terjual
    COALESCE(SUM(s.amount), 0) AS total_units,
    -- Total Transaksi
    COUNT(s.id) AS total_transactions
FROM sales s
LEFT JOIN profit_calculations pc ON s.id = pc.sale_id;

-- View: Distribusi penjualan per produk
CREATE OR REPLACE VIEW sales_by_product AS
SELECT
    p.id AS product_id,
    p.name AS product_name,
    COUNT(s.id) AS total_transactions,
    COALESCE(SUM(s.amount), 0) AS total_units,
    COALESCE(SUM(s.sale_price), 0) AS total_revenue
FROM products p
LEFT JOIN sales s ON p.id = s.product_id
WHERE p.is_active = true
GROUP BY p.id, p.name
ORDER BY total_revenue DESC;

-- View: Penjualan harian (untuk grafik revenue over time)
CREATE OR REPLACE VIEW daily_sales AS
SELECT
    s.date,
    p.id AS product_id,
    p.name AS product_name,
    COUNT(s.id) AS transactions,
    COALESCE(SUM(s.amount), 0) AS units,
    COALESCE(SUM(s.sale_price), 0) AS revenue
FROM sales s
JOIN products p ON s.product_id = p.id
GROUP BY s.date, p.id, p.name
ORDER BY s.date DESC;

-- View: Rasio bundling vs non-bundling
CREATE OR REPLACE VIEW bundling_ratio AS
SELECT
    s.is_bundling,
    COUNT(s.id) AS total_transactions,
    COALESCE(SUM(s.amount), 0) AS total_units,
    COALESCE(SUM(s.sale_price), 0) AS total_revenue
FROM sales s
GROUP BY s.is_bundling;

-- ======================
-- SEED: Default roles (4 role bawaan)
-- ======================
INSERT INTO roles (name, name_en, permissions, is_system) VALUES
(
    'Owner', 'Owner',
    '{"dashboard": true, "pos": true, "products": true, "recipes": true, "stock": true, "batching": true, "purchases": true, "reports": true, "customers": true, "settings": true}',
    true
),
(
    'Kasir', 'Cashier',
    '{"dashboard": true, "pos": true, "products": false, "recipes": false, "stock": false, "batching": false, "purchases": false, "reports": false, "customers": true, "settings": false}',
    true
),
(
    'Produksi', 'Production',
    '{"dashboard": true, "pos": false, "products": true, "recipes": true, "stock": true, "batching": true, "purchases": true, "reports": false, "customers": false, "settings": false}',
    true
),
(
    'Admin Keuangan', 'Finance Admin',
    '{"dashboard": true, "pos": false, "products": false, "recipes": false, "stock": false, "batching": false, "purchases": true, "reports": true, "customers": true, "settings": false}',
    true
);
