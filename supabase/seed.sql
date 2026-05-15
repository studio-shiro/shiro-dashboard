-- ============================================================
-- seed.sql
-- Run this AFTER 001_initial_schema.sql AND 002_product_batches.sql.
--
-- All data belongs to the demo business:
--   ID: 11111111-1111-1111-1111-111111111111
--
-- After running this file, link your Supabase Auth user to the
-- demo business by running (replace the email):
--
--   UPDATE auth.users
--   SET raw_user_meta_data = raw_user_meta_data ||
--     '{"business_id":"11111111-1111-1111-1111-111111111111","role":"admin"}'::jsonb
--   WHERE email = 'your-email@example.com';
-- ============================================================

-- ─── Business ────────────────────────────────────────────────────────────────

INSERT INTO businesses (id, name, currency, contact_email, contact_phone)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Almacén Demo',
  'ARS',
  'demo@almacendemo.com.ar',
  '011-4567-8900'
);

-- ─── Brands ──────────────────────────────────────────────────────────────────

INSERT INTO brands (id, business_id, name, description) VALUES
  ('bb000001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'Coca-Cola Company', 'Bebidas gaseosas y aguas'),
  ('bb000002-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'Mondelez International', 'Chocolates, galletitas y alfajores'),
  ('bb000003-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'Arcor', 'Golosinas, caramelos y snacks');

-- ─── Categories ──────────────────────────────────────────────────────────────

INSERT INTO categories (id, business_id, name) VALUES
  ('cc000001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Bebidas'),
  ('cc000002-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Alfajores'),
  ('cc000003-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Snacks'),
  ('cc000004-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Galletitas'),
  ('cc000005-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Chocolates'),
  ('cc000006-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Golosinas'),
  ('cc000007-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Caramelos');

-- ─── Products: Dormant (#000001–#000015) ─────────────────────────────────────
-- These products have stock but their last sale was 30–128 days ago.
-- dd000005 (Galletitas Surtidas) tracks batches.

INSERT INTO products (id, business_id, brand_id, category_id, reference, name, price, active) VALUES
  ('dd000001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000001-0000-0000-0000-000000000000', 'cc000001-0000-0000-0000-000000000000',
   '#000001', 'Coca Cola 2L', 1800.00, TRUE),
  ('dd000002-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000002-0000-0000-0000-000000000000', 'cc000002-0000-0000-0000-000000000000',
   '#000002', 'Alfajor Milka', 750.00, TRUE),
  ('dd000003-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000003-0000-0000-0000-000000000000', 'cc000003-0000-0000-0000-000000000000',
   '#000003', 'Hot Dogs Crocantes', 2200.00, TRUE),
  ('dd000004-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000003-0000-0000-0000-000000000000', 'cc000002-0000-0000-0000-000000000000',
   '#000004', 'Alfajor Wifer Viola', 680.00, TRUE),
  ('dd000005-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000002-0000-0000-0000-000000000000', 'cc000004-0000-0000-0000-000000000000',
   '#000005', 'Galletitas Surtidas', 1100.00, TRUE),
  ('dd000006-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000001-0000-0000-0000-000000000000', 'cc000001-0000-0000-0000-000000000000',
   '#000006', 'Sprite 1.5L', 1500.00, TRUE),
  ('dd000007-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000003-0000-0000-0000-000000000000', 'cc000005-0000-0000-0000-000000000000',
   '#000007', 'Mantecol', 1200.00, TRUE),
  ('dd000008-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000002-0000-0000-0000-000000000000', 'cc000005-0000-0000-0000-000000000000',
   '#000008', 'Chocolate Milka Oreo', 950.00, TRUE),
  ('dd000009-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000003-0000-0000-0000-000000000000', 'cc000006-0000-0000-0000-000000000000',
   '#000009', 'Gomitas Trululu', 600.00, TRUE),
  ('dd000010-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000003-0000-0000-0000-000000000000', 'cc000003-0000-0000-0000-000000000000',
   '#000010', 'Papas Fritas Lays', 1400.00, TRUE),
  ('dd000011-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000001-0000-0000-0000-000000000000', 'cc000001-0000-0000-0000-000000000000',
   '#000011', 'Agua Mineral 500ml', 650.00, TRUE),
  ('dd000012-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000003-0000-0000-0000-000000000000', 'cc000003-0000-0000-0000-000000000000',
   '#000012', 'Barra de Cereal Quaker', 1300.00, TRUE),
  ('dd000013-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000001-0000-0000-0000-000000000000', 'cc000001-0000-0000-0000-000000000000',
   '#000013', 'Chocolatada Toddy', 900.00, TRUE),
  ('dd000014-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000003-0000-0000-0000-000000000000', 'cc000007-0000-0000-0000-000000000000',
   '#000014', 'Halls Menta', 500.00, TRUE),
  ('dd000015-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000003-0000-0000-0000-000000000000', 'cc000004-0000-0000-0000-000000000000',
   '#000015', 'Palitos Salados Pani', 850.00, TRUE);

-- ─── Products: Active sellers (#000016–#000025) ───────────────────────────────
-- Several have stock below alert_threshold.
-- aa000020 (Milka 160g) and aa000021 (Cepita Naranja 1L) track batches.

INSERT INTO products (id, business_id, brand_id, category_id, reference, name, price, active) VALUES
  ('aa000016-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000001-0000-0000-0000-000000000000', 'cc000001-0000-0000-0000-000000000000',
   '#000016', 'Coca-Cola 354ml lata', 950.00, TRUE),
  ('aa000017-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000001-0000-0000-0000-000000000000', 'cc000001-0000-0000-0000-000000000000',
   '#000017', 'Sprite 350ml lata', 700.00, TRUE),
  ('aa000018-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000003-0000-0000-0000-000000000000', 'cc000006-0000-0000-0000-000000000000',
   '#000018', 'Beldent Menta x10', 450.00, TRUE),
  ('aa000019-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000003-0000-0000-0000-000000000000', 'cc000002-0000-0000-0000-000000000000',
   '#000019', 'Jorgito Alfajor', 650.00, TRUE),
  ('aa000020-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000002-0000-0000-0000-000000000000', 'cc000005-0000-0000-0000-000000000000',
   '#000020', 'Milka 160g', 800.00, TRUE),
  ('aa000021-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000001-0000-0000-0000-000000000000', 'cc000001-0000-0000-0000-000000000000',
   '#000021', 'Cepita Naranja 1L', 1000.00, TRUE),
  ('aa000022-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000003-0000-0000-0000-000000000000', 'cc000006-0000-0000-0000-000000000000',
   '#000022', 'Bubaloo x10', 350.00, TRUE),
  ('aa000023-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000003-0000-0000-0000-000000000000', 'cc000003-0000-0000-0000-000000000000',
   '#000023', 'Doritos Queso 72g', 1200.00, TRUE),
  ('aa000024-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000002-0000-0000-0000-000000000000', 'cc000004-0000-0000-0000-000000000000',
   '#000024', 'Oreo Classic 117g', 900.00, TRUE),
  ('aa000025-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'bb000003-0000-0000-0000-000000000000', 'cc000007-0000-0000-0000-000000000000',
   '#000025', 'Halls Cherry x9', 500.00, TRUE);

-- Enable batch tracking for 3 products that have expiration dates
UPDATE products SET tracks_batches = TRUE
WHERE id IN (
  'dd000005-0000-0000-0000-000000000000',  -- Galletitas Surtidas
  'aa000020-0000-0000-0000-000000000000',  -- Milka 160g
  'aa000021-0000-0000-0000-000000000000'   -- Cepita Naranja 1L
);

-- ─── Stock ───────────────────────────────────────────────────────────────────
-- For batch-tracked products, quantity = SUM of their product_batches rows.
-- Dormant products: above alert threshold (not in alerts panel)
-- Active products: 7 below alert_threshold → ALERT state

INSERT INTO stock (business_id, product_id, quantity, alert_threshold) VALUES
  -- Dormant products
  ('11111111-1111-1111-1111-111111111111', 'dd000001-0000-0000-0000-000000000000', 42, 10),
  ('11111111-1111-1111-1111-111111111111', 'dd000002-0000-0000-0000-000000000000', 18, 10),
  ('11111111-1111-1111-1111-111111111111', 'dd000003-0000-0000-0000-000000000000',  6, 10),
  ('11111111-1111-1111-1111-111111111111', 'dd000004-0000-0000-0000-000000000000', 24, 10),
  ('11111111-1111-1111-1111-111111111111', 'dd000005-0000-0000-0000-000000000000', 30, 10),  -- batch-tracked
  ('11111111-1111-1111-1111-111111111111', 'dd000006-0000-0000-0000-000000000000', 15, 10),
  ('11111111-1111-1111-1111-111111111111', 'dd000007-0000-0000-0000-000000000000', 50, 10),
  ('11111111-1111-1111-1111-111111111111', 'dd000008-0000-0000-0000-000000000000',  8, 10),
  ('11111111-1111-1111-1111-111111111111', 'dd000009-0000-0000-0000-000000000000', 35, 10),
  ('11111111-1111-1111-1111-111111111111', 'dd000010-0000-0000-0000-000000000000', 12, 10),
  ('11111111-1111-1111-1111-111111111111', 'dd000011-0000-0000-0000-000000000000', 60, 10),
  ('11111111-1111-1111-1111-111111111111', 'dd000012-0000-0000-0000-000000000000', 20, 10),
  ('11111111-1111-1111-1111-111111111111', 'dd000013-0000-0000-0000-000000000000',  9, 10),
  ('11111111-1111-1111-1111-111111111111', 'dd000014-0000-0000-0000-000000000000', 44, 10),
  ('11111111-1111-1111-1111-111111111111', 'dd000015-0000-0000-0000-000000000000',  7, 10),
  -- Active products: 7 below alert_threshold → ALERT
  ('11111111-1111-1111-1111-111111111111', 'aa000016-0000-0000-0000-000000000000',  7, 20),  -- ALERT
  ('11111111-1111-1111-1111-111111111111', 'aa000017-0000-0000-0000-000000000000', 22, 35),  -- ALERT
  ('11111111-1111-1111-1111-111111111111', 'aa000018-0000-0000-0000-000000000000',  2, 20),  -- ALERT
  ('11111111-1111-1111-1111-111111111111', 'aa000019-0000-0000-0000-000000000000', 14, 20),  -- ALERT
  ('11111111-1111-1111-1111-111111111111', 'aa000020-0000-0000-0000-000000000000',  4, 20),  -- ALERT, batch-tracked
  ('11111111-1111-1111-1111-111111111111', 'aa000021-0000-0000-0000-000000000000',  9, 20),  -- ALERT, batch-tracked
  ('11111111-1111-1111-1111-111111111111', 'aa000022-0000-0000-0000-000000000000',  1, 20),  -- ALERT
  ('11111111-1111-1111-1111-111111111111', 'aa000023-0000-0000-0000-000000000000', 45, 15),
  ('11111111-1111-1111-1111-111111111111', 'aa000024-0000-0000-0000-000000000000', 38, 15),
  ('11111111-1111-1111-1111-111111111111', 'aa000025-0000-0000-0000-000000000000', 80, 20);

-- ─── Product Batches ─────────────────────────────────────────────────────────
-- Only for the 3 products with tracks_batches = TRUE.
-- Quantities per product sum to match the stock entry above.
-- Expiration dates are relative so alerts fire correctly on any run date.
--
-- Milka 160g      (aa000020): stock=4  → lote A:2 + lote B:2
-- Cepita Naranja  (aa000021): stock=9  → lote A:3 + lote B:6
-- Galletitas Sur. (dd000005): stock=30 → lote A:10 + lote B:15 + lote C:5

INSERT INTO product_batches
  (business_id, product_id, lot_number, quantity, expiration_date, received_at)
VALUES
  -- Milka 160g: lote próximo a vencer (alerta) + lote normal
  ('11111111-1111-1111-1111-111111111111',
   'aa000020-0000-0000-0000-000000000000',
   'M-2025-01', 2, CURRENT_DATE + 7,  NOW() - interval '40 days'),
  ('11111111-1111-1111-1111-111111111111',
   'aa000020-0000-0000-0000-000000000000',
   'M-2025-02', 2, CURRENT_DATE + 60, NOW() - interval '5 days'),

  -- Cepita Naranja 1L: lote próximo a vencer (alerta) + lote normal
  ('11111111-1111-1111-1111-111111111111',
   'aa000021-0000-0000-0000-000000000000',
   'C-2025-01', 3, CURRENT_DATE + 12, NOW() - interval '50 days'),
  ('11111111-1111-1111-1111-111111111111',
   'aa000021-0000-0000-0000-000000000000',
   'C-2025-02', 6, CURRENT_DATE + 75, NOW() - interval '10 days'),

  -- Galletitas Surtidas: un lote por vencer + dos con tiempo de sobra
  ('11111111-1111-1111-1111-111111111111',
   'dd000005-0000-0000-0000-000000000000',
   'G-2025-01', 10, CURRENT_DATE + 20,  NOW() - interval '60 days'),
  ('11111111-1111-1111-1111-111111111111',
   'dd000005-0000-0000-0000-000000000000',
   'G-2025-02', 15, CURRENT_DATE + 95,  NOW() - interval '15 days'),
  ('11111111-1111-1111-1111-111111111111',
   'dd000005-0000-0000-0000-000000000000',
   'G-2025-03',  5, CURRENT_DATE + 180, NOW() - interval '3 days');

-- ─── Customers ───────────────────────────────────────────────────────────────
-- 74 customers created this month + 16 from last month = 90 total.

DO $$
DECLARE
  biz UUID := '11111111-1111-1111-1111-111111111111';
  first_names TEXT[] := ARRAY[
    'Martina','Lucía','Valentina','Camila','Sofía',
    'Julián','Mateo','Santiago','Agustín','Nicolás',
    'Ana','Florencia','Valeria','Carolina','Paula',
    'Diego','Facundo','Ramiro','Ignacio','Sebastián'
  ];
  last_names TEXT[] := ARRAY[
    'González','Rodríguez','García','Fernández','López',
    'Martínez','Pérez','Sánchez','Romero','Flores',
    'Torres','Díaz','Ruiz','Moreno','Gutiérrez',
    'Reyes','Jiménez','Castro','Vargas','Herrera'
  ];
  i INT;
  fname TEXT;
  lname TEXT;
BEGIN
  -- 74 customers created within the current month
  FOR i IN 1..74 LOOP
    fname := first_names[1 + ((i - 1) % array_length(first_names, 1))];
    lname := last_names[1 + ((i - 1) % array_length(last_names, 1))];
    INSERT INTO customers (id, business_id, name, email, phone, created_at)
    VALUES (
      gen_random_uuid(), biz,
      fname || ' ' || lname,
      lower(fname) || '.' || lower(lname) || i || '@gmail.com',
      '11-' || (4000 + i)::TEXT || '-' || (5000 + i * 3)::TEXT,
      date_trunc('month', NOW())
        + (floor(random() * GREATEST(EXTRACT(DAY FROM NOW())::int - 1, 0)) || ' days')::interval
        + (floor(random() * 24) || ' hours')::interval
    );
  END LOOP;

  -- 16 customers from last month (for trend reference)
  FOR i IN 75..90 LOOP
    fname := first_names[1 + ((i - 1) % array_length(first_names, 1))];
    lname := last_names[1 + ((i - 1) % array_length(last_names, 1))];
    INSERT INTO customers (id, business_id, name, email, phone, created_at)
    VALUES (
      gen_random_uuid(), biz,
      fname || ' ' || lname,
      lower(fname) || '.' || lower(lname) || i || '@gmail.com',
      '11-' || (4000 + i)::TEXT || '-' || (5000 + i * 3)::TEXT,
      date_trunc('month', NOW()) - interval '1 month'
        + (floor(random() * 28) || ' days')::interval
        + (floor(random() * 24) || ' hours')::interval
    );
  END LOOP;
END $$;

-- ─── Sales: historical last-sale for dormant products ─────────────────────────
-- One sale per dormant product, dated exactly dormant_days ago.

INSERT INTO sales (id, business_id, product_id, customer_id, quantity, unit_price, total, date)
SELECT
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  p.product_id,
  (SELECT id FROM customers
   WHERE business_id = '11111111-1111-1111-1111-111111111111'
   ORDER BY random() LIMIT 1),
  1,
  p.price,
  p.price,
  NOW() - (p.dormant_days || ' days')::interval
FROM (VALUES
  ('dd000001-0000-0000-0000-000000000000'::UUID, 1800.00,  32),
  ('dd000002-0000-0000-0000-000000000000'::UUID,  750.00,  45),
  ('dd000003-0000-0000-0000-000000000000'::UUID, 2200.00,  58),
  ('dd000004-0000-0000-0000-000000000000'::UUID,  680.00,  63),
  ('dd000005-0000-0000-0000-000000000000'::UUID, 1100.00,  68),
  ('dd000006-0000-0000-0000-000000000000'::UUID, 1500.00,  72),
  ('dd000007-0000-0000-0000-000000000000'::UUID, 1200.00,  83),
  ('dd000008-0000-0000-0000-000000000000'::UUID,  950.00,  88),
  ('dd000009-0000-0000-0000-000000000000'::UUID,  600.00,  93),
  ('dd000010-0000-0000-0000-000000000000'::UUID, 1400.00,  98),
  ('dd000011-0000-0000-0000-000000000000'::UUID,  650.00, 102),
  ('dd000012-0000-0000-0000-000000000000'::UUID, 1300.00, 110),
  ('dd000013-0000-0000-0000-000000000000'::UUID,  900.00, 118),
  ('dd000014-0000-0000-0000-000000000000'::UUID,  500.00, 123),
  ('dd000015-0000-0000-0000-000000000000'::UUID,  850.00, 128)
) AS p(product_id, price, dormant_days);

-- ─── Sales: current month (active products) ───────────────────────────────────
-- ~651 sales. Coca-Cola lata accounts for ~60% of units.
-- Total gross ≈ $490,000 ARS, average ticket ≈ $755 ARS.

INSERT INTO sales (id, business_id, product_id, customer_id, quantity, unit_price, total, date)
WITH product_daily AS (
  SELECT *
  FROM (VALUES
    ('aa000016-0000-0000-0000-000000000000'::UUID, 950.00,  4),  -- Coca-Cola lata
    ('aa000017-0000-0000-0000-000000000000'::UUID, 700.00,  2),  -- Sprite lata
    ('aa000018-0000-0000-0000-000000000000'::UUID, 450.00,  2),  -- Beldent
    ('aa000019-0000-0000-0000-000000000000'::UUID, 650.00,  2),  -- Jorgito
    ('aa000020-0000-0000-0000-000000000000'::UUID, 800.00,  2),  -- Milka
    ('aa000021-0000-0000-0000-000000000000'::UUID, 1000.00, 2),  -- Cepita
    ('aa000022-0000-0000-0000-000000000000'::UUID, 350.00,  1),  -- Bubaloo
    ('aa000023-0000-0000-0000-000000000000'::UUID, 1200.00, 1),  -- Doritos
    ('aa000024-0000-0000-0000-000000000000'::UUID, 900.00,  2),  -- Oreo
    ('aa000025-0000-0000-0000-000000000000'::UUID, 500.00,  3)   -- Halls
  ) AS t(product_id, unit_price, daily_count)
),
expanded AS (
  SELECT pd.product_id, pd.unit_price
  FROM product_daily pd
  CROSS JOIN generate_series(1, 31) AS day_n
  CROSS JOIN generate_series(1, pd.daily_count) AS s
)
SELECT
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  e.product_id,
  (SELECT id FROM customers
   WHERE business_id = '11111111-1111-1111-1111-111111111111'
   ORDER BY random() LIMIT 1),
  1,
  e.unit_price,
  e.unit_price,
  date_trunc('month', NOW())
    + (floor(random() * GREATEST(EXTRACT(DAY FROM NOW())::int - 1, 0)) || ' days')::interval
    + (floor(random() * 14 + 8) || ' hours')::interval
    + (floor(random() * 60) || ' minutes')::interval
FROM expanded e;

-- ─── Sales: previous month (for trend calculations) ───────────────────────────
-- ~540 sales, ~5% lower revenue than current month.

INSERT INTO sales (id, business_id, product_id, customer_id, quantity, unit_price, total, date)
WITH product_daily AS (
  SELECT *
  FROM (VALUES
    ('aa000016-0000-0000-0000-000000000000'::UUID, 950.00,  4),
    ('aa000017-0000-0000-0000-000000000000'::UUID, 700.00,  2),
    ('aa000018-0000-0000-0000-000000000000'::UUID, 450.00,  1),
    ('aa000019-0000-0000-0000-000000000000'::UUID, 650.00,  2),
    ('aa000020-0000-0000-0000-000000000000'::UUID, 800.00,  1),
    ('aa000021-0000-0000-0000-000000000000'::UUID, 1000.00, 2),
    ('aa000022-0000-0000-0000-000000000000'::UUID, 350.00,  1),
    ('aa000023-0000-0000-0000-000000000000'::UUID, 1200.00, 1),
    ('aa000024-0000-0000-0000-000000000000'::UUID, 900.00,  1),
    ('aa000025-0000-0000-0000-000000000000'::UUID, 500.00,  3)
  ) AS t(product_id, unit_price, daily_count)
),
expanded AS (
  SELECT pd.product_id, pd.unit_price
  FROM product_daily pd
  CROSS JOIN generate_series(1, 30) AS day_n
  CROSS JOIN generate_series(1, pd.daily_count) AS s
)
SELECT
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  e.product_id,
  (SELECT id FROM customers
   WHERE business_id = '11111111-1111-1111-1111-111111111111'
   ORDER BY random() LIMIT 1),
  1,
  e.unit_price,
  e.unit_price,
  date_trunc('month', NOW()) - interval '1 month'
    + (floor(random() * 28) || ' days')::interval
    + (floor(random() * 14 + 8) || ' hours')::interval
    + (floor(random() * 60) || ' minutes')::interval
FROM expanded e;

-- ─── Verification queries ─────────────────────────────────────────────────────
--
-- SELECT COUNT(*) FROM products;                          → 25
-- SELECT COUNT(*) FROM products WHERE tracks_batches;     → 3
-- SELECT COUNT(*) FROM product_batches;                   → 7
-- SELECT COUNT(*) FROM product_batches
--   WHERE expiration_date <= CURRENT_DATE + 30;           → 3  (near-expiry lots)
-- SELECT COUNT(*) FROM stock WHERE quantity <= alert_threshold;  → 7
-- SELECT COUNT(*) FROM customers;                         → 90
-- SELECT COUNT(*), SUM(total) FROM sales
--   WHERE date >= date_trunc('month', NOW());              → ~651 filas, ~$490k ARS
