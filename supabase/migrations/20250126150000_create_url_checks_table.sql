-- Create url_checks table for storing URL scan results
CREATE TABLE IF NOT EXISTS url_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  url_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('safe', 'suspicious', 'malicious')),
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_url_checks_url_hash ON url_checks(url_hash);
CREATE INDEX IF NOT EXISTS idx_url_checks_checked_at ON url_checks(checked_at);
CREATE INDEX IF NOT EXISTS idx_url_checks_user_id ON url_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_url_checks_ip_address ON url_checks(ip_address);

-- Enable Row Level Security
ALTER TABLE url_checks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own URL checks" ON url_checks
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role can insert URL checks" ON url_checks
  FOR INSERT
  WITH CHECK (true);

-- Add a comment to the table
COMMENT ON TABLE url_checks IS 'Stores URL security scan results and history';
