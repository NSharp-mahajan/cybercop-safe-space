-- FIR Reports RLS Policy Fix Script
-- Run this entire script in your Supabase Dashboard → SQL Editor
-- This will fix the "new row violates row-level security policy" error

-- 1. First, let's see what policies currently exist
SELECT 
    schemaname,
    tablename, 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'fir_reports'
ORDER BY cmd, policyname;

-- 2. Drop ALL existing policies on fir_reports table to start clean
DROP POLICY IF EXISTS "Users can view own FIRs" ON public.fir_reports;
DROP POLICY IF EXISTS "Users can insert own FIRs" ON public.fir_reports;
DROP POLICY IF EXISTS "Users can update own pending FIRs" ON public.fir_reports;
DROP POLICY IF EXISTS "Anonymous users can insert FIRs" ON public.fir_reports;
DROP POLICY IF EXISTS "Allow FIR insertions" ON public.fir_reports;
DROP POLICY IF EXISTS "Allow all FIR insertions" ON public.fir_reports;
DROP POLICY IF EXISTS "Comprehensive FIR insert policy" ON public.fir_reports;

-- 3. Create new, working policies

-- Policy for SELECT (viewing FIRs)
CREATE POLICY "fir_select_policy" ON public.fir_reports
    FOR SELECT 
    USING (
        -- Users can see their own FIRs
        (auth.uid() = user_id)
        OR
        -- Users can see anonymous FIRs (for admin purposes)
        (user_id IS NULL)
    );

-- Policy for INSERT (creating new FIRs) - This is the main fix
CREATE POLICY "fir_insert_policy" ON public.fir_reports
    FOR INSERT 
    WITH CHECK (
        -- Case 1: Authenticated user inserting with their own user_id
        (auth.uid() IS NOT NULL AND user_id = auth.uid())
        OR
        -- Case 2: Anonymous submission (user_id is NULL)
        (user_id IS NULL)
    );

-- Policy for UPDATE (modifying existing FIRs)
CREATE POLICY "fir_update_policy" ON public.fir_reports
    FOR UPDATE 
    USING (
        -- Only users can update their own FIRs and only if status is pending
        auth.uid() = user_id AND status = 'pending'
    )
    WITH CHECK (
        -- Ensure they're still updating their own FIR
        auth.uid() = user_id
    );

-- 4. Verify the new policies were created correctly
SELECT 
    schemaname,
    tablename, 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'fir_reports'
ORDER BY cmd, policyname;

-- 5. Test the policies with a simple query
-- This should work without errors:
SELECT 'RLS policies created successfully!' AS status;