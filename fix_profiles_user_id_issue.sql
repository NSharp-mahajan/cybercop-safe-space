-- Fix for the user_id null constraint error in profiles table
-- This script handles the column renaming issue more carefully

-- Step 1: Check current table structure
SELECT 'Current profiles table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 2: Check for the problematic row
SELECT 'Checking for problematic rows:' as info;
SELECT * FROM public.profiles 
WHERE (id IS NULL OR id = 'edd51417-9fb0-4c56-9828-a4e015324955')
   OR email = 'grdhruvi10@gmail.com';

-- Step 3: Disable RLS temporarily to avoid permission issues
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 4: Handle the column issue
DO $$
DECLARE
    has_user_id BOOLEAN;
    has_id BOOLEAN;
    constraint_exists BOOLEAN;
BEGIN
    -- Check what columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'user_id'
    ) INTO has_user_id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'id'
    ) INTO has_id;
    
    RAISE NOTICE 'Column status - has_user_id: %, has_id: %', has_user_id, has_id;
    
    -- Check if there's a NOT NULL constraint on user_id
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'user_id'
        AND is_nullable = 'NO'
    ) INTO constraint_exists;
    
    IF has_user_id THEN
        -- First, remove the NOT NULL constraint if it exists
        IF constraint_exists THEN
            ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;
        END IF;
        
        -- If we have both columns, we need to consolidate
        IF has_id THEN
            -- Copy any non-null user_id values to id
            UPDATE public.profiles 
            SET id = user_id 
            WHERE id IS NULL AND user_id IS NOT NULL;
            
            -- Drop the user_id column
            ALTER TABLE public.profiles DROP COLUMN user_id CASCADE;
        ELSE
            -- Just rename user_id to id
            ALTER TABLE public.profiles RENAME COLUMN user_id TO id;
        END IF;
    END IF;
    
    -- Ensure id column exists and has proper constraints
    IF NOT has_id AND NOT has_user_id THEN
        -- Add id column if neither exists
        ALTER TABLE public.profiles ADD COLUMN id UUID;
    END IF;
END $$;

-- Step 5: Fix the specific problematic row
-- First check if this user exists in auth.users
DO $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = 'edd51417-9fb0-4c56-9828-a4e015324955'
    ) INTO user_exists;
    
    IF user_exists THEN
        -- Update the profile to set the correct id
        UPDATE public.profiles 
        SET id = 'edd51417-9fb0-4c56-9828-a4e015324955'
        WHERE email = 'grdhruvi10@gmail.com' AND id IS NULL;
    ELSE
        -- Delete the orphaned profile
        DELETE FROM public.profiles 
        WHERE email = 'grdhruvi10@gmail.com' AND id IS NULL;
    END IF;
END $$;

-- Step 6: Fix any rows with null id by matching email with auth.users
UPDATE public.profiles p
SET id = u.id
FROM auth.users u
WHERE p.email = u.email AND p.id IS NULL;

-- Step 7: Delete any remaining profiles without valid id
DELETE FROM public.profiles WHERE id IS NULL;

-- Step 8: Fix malformed avatar URLs
UPDATE public.profiles
SET avatar_url = 'https://ui-avatars.com/api/?name=' || 
    replace(COALESCE(full_name, split_part(email, '@', 1)), ' ', '+') || 
    '&background=3b82f6&color=ffffff'
WHERE avatar_url IS NULL 
   OR avatar_url LIKE '%&color=$' 
   OR avatar_url LIKE '%&color='
   OR avatar_url = '';

-- Step 9: Set up proper constraints
-- Drop existing constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey CASCADE;

-- Set id as NOT NULL
ALTER TABLE public.profiles ALTER COLUMN id SET NOT NULL;

-- Add primary key
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

-- Add foreign key to auth.users
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Step 10: Ensure all required columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 11: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 12: Recreate policies
-- Drop all existing policies first
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_name);
    END LOOP;
END $$;

-- Create new policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role full access" ON public.profiles
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Step 13: Create or update the trigger function
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
    -- Extract name from metadata
    profile_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'given_name',
        split_part(NEW.email, '@', 1)
    );
    
    -- Generate avatar URL with proper color value
    profile_avatar := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture'
    );
    
    -- If no avatar URL provided, generate one
    IF profile_avatar IS NULL OR profile_avatar = '' THEN
        profile_avatar := 'https://ui-avatars.com/api/?name=' || 
            replace(profile_name, ' ', '+') || 
            '&background=3b82f6&color=ffffff';
    END IF;

    -- Insert or update the profile
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (NEW.id, NEW.email, profile_name, profile_avatar)
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the auth flow
        RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Step 14: Create profiles for any existing users that don't have one
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
    'https://ui-avatars.com/api/?name=' || 
    replace(
        COALESCE(
            u.raw_user_meta_data->>'name',
            u.raw_user_meta_data->>'full_name',
            u.raw_user_meta_data->>'display_name',
            u.raw_user_meta_data->>'given_name',
            split_part(u.email, '@', 1)
        ), 
        ' ', 
        '+'
    ) || 
    '&background=3b82f6&color=ffffff'
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- Step 15: Final verification
SELECT 'Final table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

SELECT 'Profile count:' as info, COUNT(*) as total FROM public.profiles;
SELECT 'Users without profiles:' as info, COUNT(*) as total 
FROM auth.users u 
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);
SELECT 'Profiles without users (orphaned):' as info, COUNT(*) as total 
FROM public.profiles p 
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);
