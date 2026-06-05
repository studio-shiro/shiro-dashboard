-- ============================================================
-- 008_barcode_catalog.sql
-- Adds product_catalog global cache, barcode column on products,
-- and business_type on businesses.
-- ============================================================

-- ─── product_catalog ─────────────────────────────────────────────────────────
-- Global cache — no business_id, explicit exception per CLAUDE.md

CREATE TABLE IF NOT EXISTS product_catalog (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode     TEXT        NOT NULL UNIQUE,
  name        TEXT        NOT NULL,
  description TEXT,
  image_url   TEXT,
  brand       TEXT,
  category    TEXT,
  source      TEXT        NOT NULL CHECK (source IN ('manual', 'external')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_catalog_barcode_idx
  ON product_catalog (barcode);

CREATE OR REPLACE TRIGGER set_product_catalog_updated_at
  BEFORE UPDATE ON product_catalog
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS: authenticated read/write only (public metadata, no tenant isolation)
ALTER TABLE product_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read product_catalog"
  ON product_catalog FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert product_catalog"
  ON product_catalog FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update product_catalog"
  ON product_catalog FOR UPDATE
  TO authenticated USING (true);

-- ─── products.barcode ────────────────────────────────────────────────────────

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS barcode TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS products_business_barcode_idx
  ON products (business_id, barcode)
  WHERE barcode IS NOT NULL;

-- ─── businesses.business_type ────────────────────────────────────────────────

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS business_type TEXT
  CHECK (business_type IN (
    'kiosk', 'supermarket', 'pharmacy_retail',
    'bookstore', 'electronics', 'mechanic', 'hardware', 'other'
  ));
