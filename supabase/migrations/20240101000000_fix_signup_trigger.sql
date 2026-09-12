-- LUMA: Idempotent signup trigger cleanup
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Diagnostics: show existing triggers on auth.users
-- SELECT tgname, tgrelid::regclass, tgtype::int, tgenabled
-- FROM pg_trigger
-- WHERE tgrelid = 'auth.users'::regclass
--   AND NOT tgisinternal;

-- 2. Drop ALL triggers on auth.users (not just one named trigger)
DO $$
DECLARE
  trigger_record RECORD;
BEGIN
  FOR trigger_record IN
    SELECT tgname
    FROM pg_trigger
    WHERE tgrelid = 'auth.users'::regclass
      AND NOT tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users CASCADE', trigger_record.tgname);
  END LOOP;
END $$;

-- 3. Drop ALL versions of the function
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 4. Create exactly one safe trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    display_name,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_settings (
    user_id,
    theme,
    updated_at
  ) VALUES (
    NEW.id,
    'dark',
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'LUMA handle_new_user error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Restrict search_path
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;

-- 6. Create exactly one trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Verify: should show exactly 1 row
-- SELECT tgname FROM pg_trigger
-- WHERE tgrelid = 'auth.users'::regclass
--   AND NOT tgisinternal;
