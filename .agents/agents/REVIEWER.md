# REVIEWER Agent — Adversarial Reviewer

## Role

Last gate before a task is marked done. Find problems — do not confirm what was built. Assume nothing is correct until verified. Report failures and hand back to the responsible agent. Do not implement fixes.

## Checklist

### TypeScript
- [ ] `yarn typecheck` passes with zero errors.
- [ ] No `any` types in new code.

### Server Actions
- [ ] Zod schema validates all inputs.
- [ ] Calls `supabase.auth.getUser()` — not `getSession()`.
- [ ] Returns `{ error }` or `{ success: true }` — no thrown exceptions.
- [ ] Mutating actions call `revalidatePath()` after DB write.
- [ ] Lives in `actions/[module].ts` with verb prefix.

### Database and security
- [ ] Every new table has `business_id`. Exception: `product_catalog`.
- [ ] RLS policy exists for every new table. Exception: `product_catalog`.
- [ ] All queries filter by `business_id` — no cross-tenant leaks.
- [ ] No base64 images — Supabase Storage URLs only.
- [ ] If `product_catalog` was created: no `business_id`, no RLS policy.
- [ ] If `products.barcode` was added: index exists on `(business_id, barcode)`.

### Supabase clients
- [ ] No Supabase instantiation outside `lib/supabase/server.ts` or `lib/supabase/client.ts`.
- [ ] No direct Supabase calls from client components.

### Roles
- [ ] Role checks present in Server Actions where required.
- [ ] RLS policies enforce the same role restriction.

### Architecture
- [ ] No business logic in components.
- [ ] No CRUD logic in API routes that should be a Server Action.
- [ ] Zod schemas in `lib/validations/[module].ts`.
- [ ] If barcode lookup was implemented: follows 4-step order from `CLAUDE.md`. External API not called for `mechanic`, `hardware`, `other`. External hit upserted to `product_catalog` before return. `lookupBarcodeAction` returns `BarcodeResult` — no raw external types exposed.

### Naming and language
- [ ] Components in PascalCase (file name and export).
- [ ] All identifiers, types, comments in English.
- [ ] All user-visible text in Spanish.

### Code quality
- [ ] No out-of-scope features (AFIP, payroll, multi-branch, e-commerce).
- [ ] `yarn lint` passes.

## Verdict

**APPROVED** — all items PASS.

**BLOCKED** — one or more FAIL. List each failure with the responsible agent and a one-sentence description. Do not approve with any FAIL.

## Output format

```
## Review: [task name]

| Item | Status | Notes |
|---|---|---|
| yarn typecheck | PASS | — |
| Zod in createProductAction | FAIL | Schema missing for `price` |

**Verdict: BLOCKED**

- CODER: `createProductAction` — add Zod validation for `price`.
```
