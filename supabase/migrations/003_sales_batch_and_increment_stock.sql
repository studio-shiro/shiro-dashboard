-- ============================================================
-- 003_sales_batch_and_increment_stock.sql
-- Run after 002_product_batches.sql.
-- Adds batch_id to sales and stock RPC helpers (decrement + increment).
-- ============================================================

-- ─── sales: track which batch a sale came from ───────────────────────────────

ALTER TABLE sales
  ADD COLUMN batch_id UUID REFERENCES product_batches(id) ON DELETE SET NULL;

CREATE INDEX idx_sales_batch ON sales (batch_id);

-- ─── decrement_stock: called when a sale is registered ──────────────────────
-- Prevents stock from going below zero.

CREATE OR REPLACE FUNCTION decrement_stock(
  p_product_id  UUID,
  p_quantity    INTEGER,
  p_business_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE stock
     SET quantity = quantity - p_quantity
   WHERE product_id  = p_product_id
     AND business_id = p_business_id
     AND quantity    >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── increment_stock: called when a sale is deleted ──────────────────────────

CREATE OR REPLACE FUNCTION increment_stock(
  p_product_id  UUID,
  p_quantity    INTEGER,
  p_business_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE stock
     SET quantity = quantity + p_quantity
   WHERE product_id  = p_product_id
     AND business_id = p_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
