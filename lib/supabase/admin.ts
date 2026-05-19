import { createClient } from "@supabase/supabase-js";

// Server-side only — never import this in client components.
// Uses the service_role key which bypasses RLS.
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
