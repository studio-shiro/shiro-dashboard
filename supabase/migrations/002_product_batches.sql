-- ============================================================
-- 002_product_batches.sql
-- Run this after 001_initial_schema.sql.
-- Adds opt-in batch/lot tracking per product.
-- ============================================================

-- ─── products: opt-in batch tracking flag ────────────────────────────────────

ALTER TABLE products ADD COLUMN tracks_batches BOOLEAN NOT NULL DEFAULT FALSE;

-- ─── product_batches ─────────────────────────────────────────────────────────

CREATE TABLE product_batches (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id      UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  lot_number      TEXT,
  quantity        INTEGER     NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  expiration_date DATE,
  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_batches_product    ON product_batches (product_id);
CREATE INDEX idx_batches_business   ON product_batches (business_id);
CREATE INDEX idx_batches_expiration ON product_batches (business_id, expiration_date)
  WHERE expiration_date IS NOT NULL;

CREATE TRIGGER trg_batches_updated_at
  BEFORE UPDATE ON product_batches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE product_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users access own batches" ON product_batches
  FOR ALL TO authenticated
  USING (business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::UUID);
