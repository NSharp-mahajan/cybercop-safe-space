-- Fix FIR Reports RLS Policies
-- The issue was having multiple INSERT policies that conflict with each other

-- Drop the existing conflicting INSERT policies
DROP POLICY IF EXISTS "Users can insert own FIRs" ON public.fir_reports;
DROP POLICY IF EXISTS "Anonymous users can insert FIRs" ON public.fir_reports;

-- Create a single comprehensive INSERT policy that handles both cases
CREATE POLICY "Allow FIR insertions" ON public.fir_reports
  FOR INSERT WITH CHECK (
    -- Allow if user is authenticated and inserting their own FIR
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    -- Allow if inserting as anonymous (user_id is NULL)
    (user_id IS NULL)
  );