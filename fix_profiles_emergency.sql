-- Emergency fix for profiles table with user_id column

-- First, let's see the current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Fix the immediate issue: update the NULL user_id value
UPDATE public.profiles p
SET user_id = u.id
FROM auth.users u
WHERE p.email = u.email 
  AND p.user_id IS NULL;

-- Fix malformed avatar URLs
UPDATE public.profiles
SET avatar_url = 'https://ui-avatars.com/api/?name=' || replace(COALESCE(full_name, split_part(email, '@', 1)), ' ', '+') || '&background=3b82f6&color=ffffff'
WHERE avatar_url LIKE '%&color=$' 
   OR avatar_url LIKE '%&color=' 
   OR avatar_url NOT LIKE '%color=ffffff%';

-- Now let's properly set up the table structure
-- First drop the existing constraints if any
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;

-- Add NOT NULL constraint to user_id if it doesn't have one
ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;

-- Make user_id the primary key
ALTER TABLE public.profiles ADD PRIMARY KEY (user_id);

-- Add foreign key constraint to auth.users
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies and recreate with user_id
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;

-- Create new policies using user_id
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow service role full access
CREATE POLICY "Service role full access" ON public.profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Drop and recreate the trigger function to use user_id
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  profile_name TEXT;
  profile_avatar TEXT;
BEGIN
  -- Extract name from metadata (handle various formats including Google)
  profile_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'given_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Extract or generate avatar URL with PROPER color value
  profile_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    'https://ui-avatars.com/api/?name=' || replace(profile_name, ' ', '+') || '&background=3b82f6&color=ffffff'
  );

  -- Try to insert the profile using user_id column
  BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, avatar_url, status)
    VALUES (NEW.id, NEW.email, profile_name, profile_avatar, 'user');
  EXCEPTION
    WHEN unique_violation THEN
      -- Profile already exists, update it instead
      UPDATE public.profiles 
      SET 
        email = NEW.email,
        full_name = COALESCE(profile_name, full_name),
        avatar_url = COALESCE(profile_avatar, avatar_url),
        updated_at = NOW()
      WHERE user_id = NEW.id;
    WHEN OTHERS THEN
      -- Log error but don't fail the auth flow
      RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for any existing auth users who don't have one
INSERT INTO public.profiles (user_id, email, full_name, avatar_url, status)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'display_name',
    u.raw_user_meta_data->>'given_name',
    split_part(u.email, '@', 1)
  ),
  COALESCE(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture',
    'https://ui-avatars.com/api/?name=' || replace(COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)), ' ', '+') || '&background=3b82f6&color=ffffff'
  ),
  'user'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO UPDATE
SET 
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
  updated_at = NOW();

-- Delete any orphaned profiles (profiles without corresponding auth.users)
DELETE FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users u WHERE u.id = p.user_id
);

-- Final check: ensure all avatar URLs are valid
UPDATE public.profiles
SET avatar_url = 'https://ui-avatars.com/api/?name=' || replace(COALESCE(full_name, split_part(email, '@', 1)), ' ', '+') || '&background=3b82f6&color=ffffff'
WHERE avatar_url IS NULL 
   OR avatar_url = ''
   OR avatar_url LIKE '%&color=$'
   OR avatar_url LIKE '%&color='
   OR avatar_url NOT LIKE '%color=ffffff%';
