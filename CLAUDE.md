# Shiro Studio — Admin Dashboard

Admin system for small and mid-sized physical retail businesses that manage stock. Centralizes management of products, stock, sales, customers, brands, and categories.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Backend/DB:** Supabase (Auth + Database + Storage + RLS)
- **Language:** TypeScript (strict mode)
- **Styles:** Tailwind CSS + shadcn/ui
- **Validation:** Zod — always in Server Actions, never client-side only
- **Charts:** Recharts — all data visualizations. Always `ResponsiveContainer` + `"use client"`.
- **Tables:** TanStack Table v8 (`@tanstack/react-table`) — `createColumnHelper`, `getSortedRowModel`, `getPaginationRowModel`. Tailwind only, no table UI library.
- **Global state:** Zustand — shared client state only. Stores in `store/`. Always `create<T>()`. Client components only.

## Commands

```bash
yarn dev        # dev server
yarn build      # production build
yarn typecheck  # run after every series of changes
yarn lint       # ESLint
```

> Always use `yarn`. Never `npm`.
> Run `bash init.sh` at the start of every session before making any changes.

## Agent system

`.agents/` defines roles and handoff protocols. `CLAUDE.md` is the source of truth for all conventions — agents read this file, they do not override it.

## Architecture

- All CRUD through Server Actions. No business logic in API routes.
- Zod validation in every Server Action before touching the DB.
- `revalidatePath` after every mutation.
- RLS on every Supabase table from day one.
- `business_id` on every table — multi-tenant ready. **Exception: `product_catalog` (see Barcode scanning).**
- Code patterns live in `.agents/context/PATTERNS.md`. Non-negotiable rules in `.agents/context/RULES.md`.

## Directory structure

```
app/
  (auth)/           # Login — no dashboard layout
  (dashboard)/      # Authenticated area with shared layout
    page.tsx        # Dashboard home
    products/
    stock/
    sales/
    customers/
    brands/
    categories/
    settings/
components/
  ui/               # shadcn/ui — never modify directly
  [feature]/        # Components per module
lib/
  supabase/         # server.ts and client.ts — only allowed Supabase instantiation points
  validations/      # Zod schemas per module
actions/            # Server Actions per module
store/              # Zustand stores
types/              # Shared TypeScript types
```

## Auth and roles

Login via Supabase Auth (email/password). Roles in `user_metadata.role`:

- **admin** — full access: settings, reports, user management
- **operator** — stock, sales, products; no settings or financial reports

Both Server Actions and RLS policies must enforce role restrictions. Missing either layer = incomplete feature.

## Modules

### Dashboard home

Metrics on login: low-stock products, latest sales, new customers this month. All metrics driven by the period filter (`usePeriodStore` Zustand store).

**Period filter options:** `today` / `week` (Mon–Sun) / `month` / `custom` (date range picker).

**Arrow navigation:** moves the period by its own duration. Custom range moves by exact day count. Arrows hidden while date picker is open.

**Comparison modes:** `previous_period` (default) / `same_period_last_year` / `none`.

**Store shape** (`store/period.ts`): `filter`, `dateFrom`, `dateTo`, `comparison` + setters. Derived helpers `getActiveDateRange()` and `getComparisonDateRange()` live as pure functions in `lib/period.ts` — not in the store.

**Header display examples:**

```
←  Mayo 2026  →           [vs. Abril 2026 ▾]
←  Hoy, 27 mayo  →        [vs. ayer ▾]
←  Semana 19–25 mayo  →   [vs. sem. anterior ▾]
←  10–20 mayo  →          [vs. 29 abr–9 may ▾]
```

### Products

Full CRUD. Fields: name, description, price, image (Supabase Storage), category (FK), brand (FK), active, barcode. List + detail views. Filters by category and brand.

Optional batches/expiration: `product → product_variants` (batch with `expiration_date` + `quantity`). Can be disabled per business. Alerts when a batch is close to expiring.

### Stock

Linked to products — not standalone. Fields: product_id, quantity, alert_threshold, updated_at. Below threshold → alert on dashboard (v1), email via Resend (v2).

Stock-out prediction: project depletion date from 30-day sales velocity. No ML — pure arithmetic on existing sales data.

### Sales

Manual registration. Fields: product_id, customer_id (nullable FK), quantity, unit_price, total (computed), date, notes. Sale creation decrements stock atomically.

Gross/net sales handling TBD with client. Bulk price update flow TBD with client.

### Customers

Fields: name, email, phone, created_at. Linked purchase history. Not a full CRM.

### Brands and categories

Fields: name, description, optional image/logo. Single-level hierarchy in v1.

### Settings

Business name, logo (Supabase Storage), currency, contact info, stock alert thresholds, notification email/WhatsApp. Logo in header. Shiro Studio branding in footer.

## Product differentiators

### 1. Conversational analytics (start here)

Admin asks in natural language → Claude generates Supabase query → responds with real business data. Most impactful demo feature.

### 2. Stock-out prediction

"At this rate, product X runs out in 6 days." Derived from 30-day sales velocity.

### 3. Supplier notifications

Auto-email or WhatsApp to supplier when stock hits a threshold.

### 4. Monthly report

Auto-sent to owner: top products, revenue, period comparisons.

### 5. Expiration alerts

For batches with expiration dates. Optional per business.

## Barcode scanning

Progressive lookup — always in this order:

1. `products` (business-scoped, by `barcode` column) → found: pre-fill form
2. `product_catalog` (global Shiro cache, no `business_id`) → found: suggest + confirm
3. External API — only if `business_type` is eligible (see table below) → found: upsert to `product_catalog`, suggest + confirm
4. Manual fallback → empty form with barcode pre-filled; on save, result enters `product_catalog`

Every manual entry enriches the global cache. Over time the cache reduces external API calls to near zero.

**External API eligibility by `business_type`:**

| business_type                             | API                                | Coverage  |
| ----------------------------------------- | ---------------------------------- | --------- |
| `kiosk`, `supermarket`, `pharmacy_retail` | Open Food Facts, Open Beauty Facts | Good      |
| `bookstore`                               | Open Library (ISBN)                | Good      |
| `electronics`                             | UPC Item DB                        | Moderate  |
| `mechanic`, `hardware`, `other`           | None — skip to manual              | Poor/none |

**`business_type` valid values:** `kiosk` · `supermarket` · `pharmacy_retail` · `bookstore` · `electronics` · `mechanic` · `hardware` · `other`

`business_type` also drives future UI hints and default field configuration per module.

**Key schema facts:**

- `products.barcode` — indexed by `(business_id, barcode)`
- `product_catalog` — global, **no `business_id`**, no RLS. Public metadata only. Explicit exception to the `business_id` rule.
- `businesses.business_type` — `text` with CHECK constraint on the valid values above

**Types:** `BusinessType`, `ProductCatalogEntry`, `BarcodeResult` → `types/barcode.ts`
**Action:** `lookupBarcodeAction(barcode)` → `actions/barcode.ts`
**Scanning libraries:** `@zxing/browser` (all formats, recommended) · `quagga2` (EAN/UPC, better perf) · `react-qr-reader` (QR only)

## Database

- `business_id` on every table. Exception: `product_catalog`.
- RLS on every table. Exception: `product_catalog` (public metadata).
- Images in Supabase Storage — URL in DB, never base64.
- snake_case English for all table and column names.

## Seed data

Seed in `supabase/seed.sql` or `scripts/seed.ts`. Required for demo:

- 20+ products with images, prices, categories, some with `barcode` values
- 3+ brands, 4+ categories
- 15 customers with purchase history
- Some products below alert threshold
- Some batches with upcoming expiration dates (if module enabled)
- `businesses` row with `business_type` set

Sales distribution (critical for period filter demo):

- Last 3 months: ~150 sales, realistic daily variation
- Current month: 50+ sales across all weeks
- Current week: 8–10 sales across different days
- Today: 2–3 sales
- Same periods last year: 30+ sales (for `same_period_last_year` comparison)

Mix single-unit and multi-unit sales. Avoid uniform quantities.

## Out of scope (v1)

Do not implement. Ask before proceeding if a task touches any of these:

- AFIP / electronic invoicing
- Payroll / employee management
- Multiple branches
- Public e-commerce storefront
- Marketplace integrations (MercadoLibre, etc.)

## Code conventions

- Components: PascalCase file and export name
- Server Actions: `actions/[module].ts`, verb prefix — `createProductAction`, `lookupBarcodeAction`
- Zod schemas: `lib/validations/[module].ts`
- Types: `types/[module].ts`
- Period helpers: `lib/period.ts`
- No business logic in components
- Prefer `async/await` over `.then()`
- **English everywhere** (identifiers, types, file names, comments). **Spanish for UI-visible text only** (labels, headings, placeholders, error messages).

## Deploy

- Dashboard: Vercel
- DB / Auth / Storage: Supabase
- WhatsApp chatbot (future): separate NestJS service on Railway or Fly.io, not in this repo. One server, multiple clients via `/webhook/[business-id]`. Use ngrok in development.
