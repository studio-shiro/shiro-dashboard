# Shiro Studio — Non-Negotiable Rules

## Package manager
- Use `yarn` only. Never `npm`.

## TypeScript
- Strict mode always on.
- Run `yarn typecheck` after every series of changes.

## Database
- Every table has `business_id`. **Exception: `product_catalog`** (global cache, documented in `CLAUDE.md`).
- RLS enabled on every table. **Exception: `product_catalog`** (public metadata, no business data).
- Table and column names: snake_case in English.

## Supabase clients
- Only two allowed instantiation points: `lib/supabase/server.ts` and `lib/supabase/client.ts`.
- Auth verification: always `getUser()`, never `getSession()`.

## Server Actions
- Validate input with Zod before touching the DB.
- Call `getUser()` to verify session.
- Return `{ error }` or `{ success: true }` — never throw to the client.
- Call `revalidatePath()` after every mutation.
- Live in `actions/[module].ts` with a verb prefix.

## Architecture
- All CRUD through Server Actions. No business logic in API routes.
- No business logic inside components.
- No direct Supabase calls from client components.

## Naming and language
- Components: PascalCase (file name and export name).
- All identifiers, types, file names, and comments: English.
- UI-visible text only (labels, headings, placeholders, errors): Spanish.

## Images
- Always Supabase Storage. URL in DB. Never base64.

## Roles
- Role checks (`admin` / `operator`) in both Server Actions and RLS policies.
- Missing either layer = incomplete feature.
