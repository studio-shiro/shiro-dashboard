-- ============================================================
-- 004_business_members.sql
-- Team membership table: tracks which users belong to which
-- business, their role within it, and invite/onboarding status.
--
-- Roles (platform-wide):
--   superadmin  → platform creator (Shiro Studio) — not in this table
--   owner       → business owner / paying client — full access to own business
--   operator    → employee — stock, sales, products; no settings or reports
-- ============================================================

-- ─── business_members ────────────────────────────────────────────────────────

CREATE TABLE business_members (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT        NOT NULL,
  full_name    TEXT,
  role         TEXT        NOT NULL CHECK (role IN ('owner', 'operator')),
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'active', 'revoked')),
  invited_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at    TIMESTAMPTZ,
  UNIQUE (business_id, email),
  UNIQUE (business_id, user_id)
);

CREATE INDEX idx_business_members_business ON business_members (business_id);
CREATE INDEX idx_business_members_user     ON business_members (user_id);

-- ─── Trigger: activate member when they accept the invite ────────────────────
-- Fires when an invited user confirms their email (clicks the magic link
-- and sets their password). Updates status pending → active and records
-- the exact moment they joined.

CREATE OR REPLACE FUNCTION activate_business_member()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.business_members
    SET
      status    = 'active',
      joined_at = NOW()
    WHERE
      user_id = NEW.id
      AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_activate_business_member
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION activate_business_member();

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;

-- Any authenticated member of the business can view the full team list.
CREATE POLICY "members view own business team" ON business_members
  FOR SELECT TO authenticated
  USING (business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::UUID);

-- Only owners can invite (insert) new members into their business.
CREATE POLICY "owners invite members" ON business_members
  FOR INSERT TO authenticated
  WITH CHECK (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::UUID
    AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
  );

-- Owners can update any member's record; any user can update their own row
-- (e.g. to set their full_name after accepting an invite).
CREATE POLICY "owners manage members, users update self" ON business_members
  FOR UPDATE TO authenticated
  USING (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::UUID
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
      OR user_id = auth.uid()
    )
  );

-- Owners can remove any member except themselves.
CREATE POLICY "owners remove other members" ON business_members
  FOR DELETE TO authenticated
  USING (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::UUID
    AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
    AND user_id <> auth.uid()
  );

-- ─── Data migration: rename role 'admin' → 'owner' ───────────────────────────
-- The previous role name 'admin' is replaced by 'owner' to clearly distinguish
-- business-level admins from the platform superadmin (Shiro Studio).

UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role":"owner"}'::jsonb
WHERE raw_user_meta_data ->> 'role' = 'admin';

-- ─── Seed migration: register existing confirmed users in business_members ────
-- Any user that was already set up manually (via seed.sql or the Supabase
-- dashboard) is inserted as an active owner so they appear in the team list.

INSERT INTO public.business_members (
  user_id,
  business_id,
  email,
  full_name,
  role,
  status,
  invited_at,
  joined_at
)
SELECT
  u.id,
  (u.raw_user_meta_data ->> 'business_id')::UUID,
  u.email,
  u.raw_user_meta_data ->> 'full_name',
  COALESCE(u.raw_user_meta_data ->> 'role', 'operator'),
  'active',
  COALESCE(u.created_at, NOW()),
  u.email_confirmed_at
FROM auth.users u
WHERE
  u.raw_user_meta_data ? 'business_id'
  AND u.email_confirmed_at IS NOT NULL
ON CONFLICT (business_id, email) DO NOTHING;
