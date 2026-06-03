# Shiro Studio — Established Patterns

## Server Action (standard)

```ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
});

export async function createProductAction(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("products").insert({
    ...parsed.data,
    business_id: user.user_metadata.business_id,
  });
  if (error) return { error: error.message };

  revalidatePath("/products");
  return { success: true };
}
```

## Supabase — server client (`lib/supabase/server.ts`)

```ts
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

## Supabase — browser client (`lib/supabase/client.ts`)

```ts
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
```

## Zustand store

```ts
import { create } from "zustand";

interface ExampleState {
  value: string;
  setValue: (value: string) => void;
}

export const useExampleStore = create<ExampleState>()((set) => ({
  value: "",
  setValue: (value) => set({ value }),
}));
```

Always `create<T>()`. Client components only (`"use client"`). Stores in `store/`.

## TanStack Table

```tsx
"use client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

type Product = { id: string; name: string; price: number };
const columnHelper = createColumnHelper<Product>();

const columns = [
  columnHelper.accessor("name", { header: "Nombre", cell: (info) => info.getValue() }),
  columnHelper.accessor("price", { header: "Precio", cell: (info) => `$${info.getValue()}` }),
];

export function ProductTable({ data }: { data: Product[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((h) => (
              <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

Tailwind only — no table UI library.

## Barcode lookup action

Entry point: `actions/barcode.ts` → `lookupBarcodeAction(barcode: string): Promise<BarcodeResult>`

```ts
"use server";
import { createClient } from "@/lib/supabase/server";
import type { BarcodeResult, BusinessType } from "@/types/barcode";

const EXTERNAL_API_ELIGIBLE: BusinessType[] = [
  "kiosk", "supermarket", "pharmacy_retail", "bookstore", "electronics",
];

export async function lookupBarcodeAction(barcode: string): Promise<BarcodeResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const businessId: string = user.user_metadata.business_id;
  const businessType: BusinessType = user.user_metadata.business_type ?? "other";

  // Step 1: business-scoped product
  const { data: existing } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", businessId)
    .eq("barcode", barcode)
    .maybeSingle();
  if (existing) return { source: "local", product: existing };

  // Step 2: global catalog cache
  const { data: cached } = await supabase
    .from("product_catalog")
    .select("*")
    .eq("barcode", barcode)
    .maybeSingle();
  if (cached) return { source: "catalog", suggestion: cached };

  // Step 3: external API — eligible types only
  if (EXTERNAL_API_ELIGIBLE.includes(businessType)) {
    const apiResult = await fetchFromExternalApi(barcode, businessType);
    if (apiResult) {
      await supabase.from("product_catalog").upsert(apiResult);
      return { source: "external", suggestion: apiResult };
    }
  }

  // Step 4: manual fallback
  return { source: "not_found", barcode };
}
```

## BarcodeResult type (`types/barcode.ts`)

```ts
import type { Product } from "./product";

export type BusinessType =
  | "kiosk" | "supermarket" | "pharmacy_retail"
  | "bookstore" | "electronics"
  | "mechanic" | "hardware" | "other";

export interface ProductCatalogEntry {
  barcode: string;
  name: string;
  description: string | null;
  brand: string | null;
  image_url: string | null;
  category_hint: string | null;
  source: "manual" | "open_food_facts" | "open_beauty_facts" | "upc_item_db" | "open_library";
  created_at: string;
}

export type BarcodeResult =
  | { source: "local";     product: Product }
  | { source: "catalog";   suggestion: ProductCatalogEntry }
  | { source: "external";  suggestion: ProductCatalogEntry }
  | { source: "not_found"; barcode: string }
  | { error: string };
```

## Barcode schema migrations

```sql
-- Global product catalog — no business_id, no RLS (explicit exception)
CREATE TABLE product_catalog (
  barcode       text PRIMARY KEY,
  name          text NOT NULL,
  description   text,
  brand         text,
  image_url     text,
  category_hint text,
  source        text NOT NULL,
  created_at    timestamptz DEFAULT now()
);

-- Barcode on products
ALTER TABLE products ADD COLUMN barcode text;
CREATE INDEX products_barcode_idx ON products (business_id, barcode);

-- Business type on businesses
ALTER TABLE businesses
  ADD COLUMN business_type text NOT NULL DEFAULT 'other'
  CONSTRAINT businesses_type_check CHECK (
    business_type IN (
      'kiosk','supermarket','pharmacy_retail',
      'bookstore','electronics','mechanic','hardware','other'
    )
  );
```
