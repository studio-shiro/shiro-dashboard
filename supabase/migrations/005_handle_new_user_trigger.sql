-- ============================================================
-- 005_handle_new_user_trigger.sql
-- INSERT trigger on auth.users: auto-creates a business_members row
-- whenever a user is created (via Supabase dashboard, invite API, or
-- any other method) as long as business_id is present in their metadata.
--
-- This complements the UPDATE trigger in 004_business_members.sql,
-- which handles invite acceptance (email confirmation).
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.raw_user_meta_data ->> 'business_id') IS NOT NULL THEN
    INSERT INTO public.business_members (
      user_id,
      business_id,
      email,
      full_name,
      role,
      status,
      invited_at,
      joined_at
    ) VALUES (
      NEW.id,
      (NEW.raw_user_meta_data ->> 'business_id')::UUID,
      NEW.email,
      NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
      COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'role', ''), 'operator'),
      -- If created already confirmed (e.g. from dashboard), mark active immediately.
      CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN 'active' ELSE 'pending' END,
      NOW(),
      NEW.email_confirmed_at
    )
    ON CONFLICT (business_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
