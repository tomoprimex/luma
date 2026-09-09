-- LUMA: Fix signup trigger for profiles + user_settings auto-creation
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Drop any existing broken trigger/function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Create a robust trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile row with safe defaults
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

  -- Create user settings row with safe defaults
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

-- 3. Restrict search_path for security
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;

-- 4. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
