-- Test Script to Verify RLS Policies are Working
-- Run this AFTER running the fix_rls_policies.sql script

-- 1. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'fir_reports';

-- 2. List all current policies
SELECT 
    policyname,
    cmd,
    permissive,
    with_check,
    qual
FROM pg_policies 
WHERE tablename = 'fir_reports'
ORDER BY cmd, policyname;

-- 3. Test if we can insert a test record (this should work now)
-- Note: This is just a syntax check, actual data will depend on auth state
EXPLAIN (FORMAT TEXT) 
INSERT INTO public.fir_reports (
    name,
    address,
    contact,
    incident_date,
    incident_location,
    incident_description,
    language,
    status,
    user_id,
    anonymous_session
) VALUES (
    'Test User',
    'Test Address',
    'Test Contact',
    CURRENT_DATE,
    'Test Location',
    'Test Description',
    'en',
    'pending',
    NULL,  -- Anonymous submission
    'test-session-id'
);

-- 4. Show table structure to verify all columns exist
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'fir_reports' 
ORDER BY ordinal_position;