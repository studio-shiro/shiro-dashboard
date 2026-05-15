-- ============================================================
-- 001_initial_schema.sql
-- Run this first in the Supabase SQL Editor.
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Helper: updated_at trigger ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── businesses ──────────────────────────────────────────────────────────────

CREATE TABLE businesses (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  logo_url        TEXT,
  currency        TEXT        NOT NULL DEFAULT 'ARS',
  contact_email   TEXT,
  contact_phone   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── brands ──────────────────────────────────────────────────────────────────

CREATE TABLE brands (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  description  TEXT,
  logo_url     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brands_business ON brands (business_id);

-- ─── categories ──────────────────────────────────────────────────────────────

CREATE TABLE categories (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  description  TEXT,
  image_url    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_business ON categories (business_id);

-- ─── products ────────────────────────────────────────────────────────────────

CREATE TABLE products (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  brand_id     UUID        REFERENCES brands(id) ON DELETE SET NULL,
  category_id  UUID        REFERENCES categories(id) ON DELETE SET NULL,
  reference    TEXT        NOT NULL,
  name         TEXT        NOT NULL,
  description  TEXT,
  price        NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  image_url    TEXT,
  active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_business        ON products (business_id, active);
CREATE INDEX idx_products_category        ON products (category_id);
CREATE INDEX idx_products_brand           ON products (brand_id);
CREATE UNIQUE INDEX idx_products_reference ON products (business_id, reference);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── stock ───────────────────────────────────────────────────────────────────

CREATE TABLE stock (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id       UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity         INTEGER     NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  alert_threshold  INTEGER     NOT NULL DEFAULT 10 CHECK (alert_threshold >= 0),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id)
);

CREATE INDEX idx_stock_business ON stock (business_id);

CREATE TRIGGER trg_stock_updated_at
  BEFORE UPDATE ON stock
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── customers ───────────────────────────────────────────────────────────────

CREATE TABLE customers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  email        TEXT,
  phone        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_business    ON customers (business_id);
CREATE INDEX idx_customers_created_at  ON customers (business_id, created_at DESC);

-- ─── sales ───────────────────────────────────────────────────────────────────

CREATE TABLE sales (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID           NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id   UUID           NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  customer_id  UUID           REFERENCES customers(id) ON DELETE SET NULL,
  quantity     INTEGER        NOT NULL CHECK (quantity > 0),
  unit_price   NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  total        NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  date         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  notes        TEXT,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Composite index covering the most common dashboard query: business + date range
CREATE INDEX idx_sales_business_date  ON sales (business_id, date DESC);
CREATE INDEX idx_sales_product        ON sales (product_id);
CREATE INDEX idx_sales_customer       ON sales (customer_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────
--
-- Every row is scoped to a business. The business_id comes from
-- the Supabase Auth JWT user_metadata field set during sign-up or
-- manually via: UPDATE auth.users SET raw_user_meta_data = ...
--
-- Helper expression (used in all policies):
--   (auth.jwt() -> 'user_metadata' ->> 'business_id')::UUID

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands     ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock      ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales      ENABLE ROW LEVEL SECURITY;

-- businesses: user sees only the business that matches their metadata
CREATE POLICY "users access own business" ON businesses
  FOR ALL TO authenticated
  USING (id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::UUID);

-- All other tables: row belongs to the user's business
CREATE POLICY "users access own brands" ON brands
  FOR ALL TO authenticated
  USING (business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::UUID);

CREATE POLICY "users access own categories" ON categories
  FOR ALL TO authenticated
  USING (business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::UUID);

CREATE POLICY "users access own products" ON products
  FOR ALL TO authenticated
  USING (business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::UUID);

CREATE POLICY "users access own stock" ON stock
  FOR ALL TO authenticated
  USING (business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::UUID);

CREATE POLICY "users access own customers" ON customers
  FOR ALL TO authenticated
  USING (business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::UUID);

CREATE POLICY "users access own sales" ON sales
  FOR ALL TO authenticated
  USING (business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::UUID);
