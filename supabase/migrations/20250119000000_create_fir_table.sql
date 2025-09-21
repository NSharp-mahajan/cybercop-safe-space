-- Create FIR (First Information Report) table
CREATE TABLE IF NOT EXISTS public.fir_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Personal Information
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    contact TEXT NOT NULL,
    
    -- Incident Details
    incident_date DATE NOT NULL,
    incident_location TEXT NOT NULL,
    incident_description TEXT NOT NULL,
    
    -- Language and Status
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    
    -- Additional Fields
    evidence_files TEXT[], -- Array of file URLs
    additional_notes TEXT,
    
    -- User Information
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    anonymous_session TEXT, -- For anonymous submissions
    
    -- Official Use
    assigned_officer TEXT,
    fir_number TEXT UNIQUE, -- Official FIR number
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fir_reports_status ON public.fir_reports(status);
CREATE INDEX IF NOT EXISTS idx_fir_reports_created_at ON public.fir_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_fir_reports_user_id ON public.fir_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_fir_reports_fir_number ON public.fir_reports(fir_number);

-- Enable Row Level Security
ALTER TABLE public.fir_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for different access levels
-- Users can only see their own FIRs
CREATE POLICY "Users can view own FIRs" ON public.fir_reports
    FOR SELECT USING (auth.uid() = user_id);

-- Allow FIR insertions for both authenticated and anonymous users
CREATE POLICY "Allow FIR insertions" ON public.fir_reports
    FOR INSERT WITH CHECK (
        -- Allow if user is authenticated and inserting their own FIR
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR
        -- Allow if inserting as anonymous (user_id is NULL)
        (user_id IS NULL)
    );

-- Users can update their own FIRs (only if status is pending)
CREATE POLICY "Users can update own pending FIRs" ON public.fir_reports
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_fir_reports_updated_at 
    BEFORE UPDATE ON public.fir_reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
