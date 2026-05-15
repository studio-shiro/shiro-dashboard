# Shiro Studio — Admin Dashboard

Admin system for small and mid-sized physical retail businesses that manage stock. Centralizes management of products, stock, sales, customers, brands, and categories.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Backend/DB:** Supabase (Auth + Database + Storage + RLS)
- **Language:** TypeScript (strict mode)
- **Styles:** Tailwind CSS + shadcn/ui
- **Validation:** Zod (always in Server Actions, never client-side only)
- **Charts:** Recharts — used for all dashboard data visualizations (bar charts, line charts, pie/donut charts). Always use `ResponsiveContainer` for layout, `"use client"` directive required.
- **Global state:** Zustand — used for shared client state (e.g. period filter). Stores live in `store/`. Always define store type explicitly with `create<T>()`. Only use in client components.

## Commands

```bash
yarn dev             # Development server
yarn build           # Production build
yarn typecheck       # Type check (run after changes)
yarn lint            # ESLint
```

> IMPORTANT: Always run `typecheck` after a series of changes before marking a task as done.
> IMPORTANT: This project uses **yarn**. Never use `npm` to install dependencies or run scripts.
> NOTE: Yarn 4 with nodeLinker: node-modules (see .yarnrc.yml). PnP mode is disabled — required for Next.js Turbopack compatibility.

## Architecture

### Required patterns

- **Server Actions** for all CRUD — never expose business logic in API routes unnecessarily
- **Zod** to validate inputs in every Server Action before touching the DB
- **`revalidatePath`** after every mutation to invalidate cache
- **RLS enabled from day one** on all Supabase tables
- **`business_id`** on all tables — multi-tenant ready from the start, even if there's only one client today

### Directory structure

```
app/
  (auth)/           # Login, no dashboard layout
  (dashboard)/      # Authenticated area with shared layout
    page.tsx        # Dashboard home (metrics)
    products/
    stock/
    sales/
    customers/
    brands/
    categories/
    settings/
components/
  ui/               # shadcn/ui — do not modify directly
  [feature]/        # Components per module
lib/
  supabase/         # Supabase clients (server and client)
  validations/      # Zod schemas per module
actions/            # Server Actions per module
types/              # Shared TypeScript types
```

## Supabase — clients

These are the only two allowed patterns for instantiating Supabase. Do not create clients any other way.

```ts
// lib/supabase/server.ts — Server Components, Server Actions, Route Handlers
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) =>
          cs.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          ),
      },
    },
  );
}
```

```ts
// lib/supabase/client.ts — Client Components only
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
```

## Server Actions — standard pattern

All Server Actions follow this pattern without exception:

```ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
});

export async function createProductAction(formData: FormData) {
  // 1. Validate with Zod
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  // 2. Verify session — always getUser(), never getSession()
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 3. Write to DB with business_id from user metadata
  const { error } = await supabase.from("products").insert({
    ...parsed.data,
    business_id: user.user_metadata.business_id,
  });
  if (error) return { error: error.message };

  // 4. Invalidate cache and return
  revalidatePath("/products");
  return { success: true };
}
```

Rules:

- Always return `{ error }` or `{ success: true }` — never throw exceptions to the client
- Never skip Zod validation even if the input looks simple
- Never use `getSession()` to verify auth — use `getUser()`

## Auth and roles

Login via Supabase Auth (email/password). Two roles managed via `user_metadata.role`:

- **admin** — full access: settings, reports, user management
- **operator** — can manage stock, register sales, and view products; NO access to settings or financial reports

Roles are validated in both Server Actions and RLS policies. If either layer is missing, the feature is incomplete.

```ts
// Role check in Server Action
const role = user.user_metadata.role;
if (role !== "admin") return { error: "Forbidden" };
```

## Modules

### Dashboard Home

Key metrics on login: sales for day/week/month with comparison to previous period, low-stock products (below configurable threshold), latest sales, new customers this month.

### Products

Full CRUD. Fields: name, description, price, image (Supabase Storage), category (FK), brand (FK), active. Views: list and detail. Filters by category and brand.

**Batches and expiration dates (optional):** Products can have batches/variants with expiration date and quantity, modeled as `product → product_variants` where each variant is a batch with `expiration_date` and `quantity`. Businesses that don't handle perishables can disable this feature entirely. The system alerts when a batch is close to expiring.

### Stock

Linked to products (not a standalone table). Fields: product_id, quantity, alert_threshold, updated_at. When quantity falls below threshold → alert shown on dashboard home (v1). Email via Resend in v2.

**Stock-out prediction:** Beyond threshold alerts, the system projects stock-out dates based on sales velocity over the last 30 days: "At this rate, product X will run out of stock in 6 days." Calculated from existing sales data — no ML required.

### Sales

Manual registration. Fields: product_id, customer_id (nullable), quantity, unit_price, total (computed), date, notes. Registering a sale automatically decrements stock in the same operation.

**Gross/net sales:** The system should handle the difference between gross and net sales, calculated automatically. What discounts/costs apply for the net calculation is TBD with the client.

**Bulk price updates:** Flow for updating product prices in bulk (by percentage or fixed value). TBD with the client.

### Customers

Not a full CRM. Fields: name, email, phone, created_at. Includes linked purchase history.

### Brands and Categories

Catalog organization. Structure: name, description, optional image. Brands can have a logo.

### Settings

Business name and logo (Supabase Storage), currency, contact info, stock alert thresholds, email/WhatsApp for notifications. Logo appears in the header. Footer displays the Shiro Studio brand.

## Product differentiators

Features that set this dashboard apart from generic tools. Prioritize in the demo:

### 1. Conversational analytics (high priority — start here)

The admin queries their business in natural language: "What was my best-selling product in April?", "Which customers haven't bought in the last 60 days?", "Which days of the week do I sell the most?". Claude receives the question, generates the Supabase query, and responds with real business data in natural language. Most impactful feature in a demo.

### 2. Stock-out prediction

Proactive alert based on 30-day sales velocity: "At this rate, product X will run out in 6 days." No ML — uses existing sales data.

### 3. Supplier notifications

When stock for a product drops to a set level, the system automatically emails or WhatsApps the supplier. Clear differentiator vs. generic tools.

### 4. Automatic monthly report

Monthly summary sent to the owner by email: top products, revenue, period comparisons.

### 5. Expiration alerts

For businesses using product batches, alerts when expiration dates are approaching. Optional — can be disabled per business.

## Extra features (considered, not core)

- **Barcode scanning:** `@zxing/browser` (QR + all formats), `quagga2` (EAN/UPC, better for linear barcodes), `react-qr-reader` (QR only, simpler).

## Database (Supabase)

- All tables have `business_id` — no exceptions
- RLS enabled on all tables from the start
- Images always in Supabase Storage; store URL in DB, never base64
- Explicit foreign keys between related tables
- `product_variants` relation for batches with expiration date (optional per business)

Table and column naming: **snake_case in English**.

```sql
-- Examples
products, stock, sales, customers, brands, categories, businesses
product_id, business_id, unit_price, alert_threshold, created_at, updated_at
```

## Seed data

The demo needs realistic data to communicate value:

- 20+ products with images, prices, and categories
- 3+ brands, 4+ categories
- 50 sales distributed over the last month (so dashboard charts have shape)
- 15 customers with linked purchase history
- Some products with low stock to demonstrate the alert system
- Some batches with upcoming expiration dates (if the module is enabled in the demo)

Seed lives in `supabase/seed.sql` or `scripts/seed.ts`.

## Out of scope (v1)

Do not implement — these features are explicitly out of scope:

- Electronic invoicing / AFIP integration
- Payroll and employee management
- Multiple branches
- Public e-commerce storefront
- Marketplace integrations (MercadoLibre, etc.)

If any of these appear in a task, ask before implementing.

## Code conventions

- Components in PascalCase (both component name and file name)
- Server Actions in `actions/[module].ts` with verb prefix (e.g. `createProductAction`, `updateStockAction`)
- Zod schemas in `lib/validations/[module].ts`
- Shared types in `types/[module].ts`
- No business logic in components — use Server Actions
- Prefer `async/await` over `.then()/.catch()`
- **Language rule:** Everything internal must be in English — variable names, function names, interface names, property names, type names, file names, JSX comments, and code comments. The only Spanish allowed is visible UI content: labels, headings, placeholder text, error messages, and other text rendered to the user.

## Deploy

- **Dashboard:** Vercel (Next.js)
- **DB/Auth/Storage:** Supabase
- **WhatsApp chatbot (future):** separate NestJS service on Railway or Fly.io — does NOT live in this repo. One server handles multiple clients, each with their own WhatsApp number pointing to `/webhook/[business-id]`. Use ngrok during development.
