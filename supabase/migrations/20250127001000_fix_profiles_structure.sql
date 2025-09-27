-- Fix profiles table structure and user creation

-- First, let's check if we need to rename the column
DO $$
BEGIN
  -- Check if user_id column exists and id doesn't
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'user_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'id'
  ) THEN
    -- Rename user_id to id
    ALTER TABLE public.profiles RENAME COLUMN user_id TO id;
  END IF;
END $$;

-- Ensure the id column is properly set up as primary key referencing auth.users
DO $$
BEGIN
  -- Check if the foreign key constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name = 'profiles'
  ) THEN
    -- Add the foreign key constraint
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
  END IF;
  
  -- Ensure id is primary key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'PRIMARY KEY' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles ADD PRIMARY KEY (id);
  END IF;
END $$;

-- Add missing columns if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;

-- Create new policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow service role full access
CREATE POLICY "Service role full access" ON public.profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);

-- Drop and recreate the trigger function with better error handling
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
  -- Extract name from metadata (handle various formats)
  profile_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'given_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Extract or generate avatar URL (with proper color value)
  profile_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    'https://ui-avatars.com/api/?name=' || replace(profile_name, ' ', '+') || '&background=3b82f6&color=ffffff'
  );

  -- Try to insert the profile
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (NEW.id, NEW.email, profile_name, profile_avatar);
  EXCEPTION
    WHEN unique_violation THEN
      -- Profile already exists, update it instead
      UPDATE public.profiles 
      SET 
        email = NEW.email,
        full_name = COALESCE(profile_name, full_name),
        avatar_url = COALESCE(profile_avatar, avatar_url),
        updated_at = NOW()
      WHERE id = NEW.id;
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

-- Fix any existing profiles with missing user_id/id values
UPDATE public.profiles p
SET id = u.id
FROM auth.users u
WHERE p.email = u.email 
  AND p.id IS NULL;

-- Create profiles for any existing users who don't have one
INSERT INTO public.profiles (id, email, full_name, avatar_url)
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
  )
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
  updated_at = NOW();

-- Fix any malformed avatar URLs
UPDATE public.profiles
SET avatar_url = 'https://ui-avatars.com/api/?name=' || replace(COALESCE(full_name, split_part(email, '@', 1)), ' ', '+') || '&background=3b82f6&color=ffffff'
WHERE avatar_url LIKE '%&color=$' OR avatar_url LIKE '%&color=';

-- Delete any orphaned profiles (profiles without corresponding auth.users)
DELETE FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users u WHERE u.id = p.id
);
