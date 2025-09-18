-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'officer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create FIR submissions table
CREATE TABLE public.fir_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  complainant_name TEXT NOT NULL,
  complainant_phone TEXT NOT NULL,
  complainant_email TEXT,
  incident_date DATE NOT NULL,
  incident_location TEXT NOT NULL,
  incident_description TEXT NOT NULL,
  case_type TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'closed')),
  fir_number TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create password checks table
CREATE TABLE public.password_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL, -- Store hash for tracking purposes, not actual password
  strength_score INTEGER NOT NULL CHECK (strength_score BETWEEN 0 AND 100),
  has_uppercase BOOLEAN DEFAULT false,
  has_lowercase BOOLEAN DEFAULT false,
  has_numbers BOOLEAN DEFAULT false,
  has_symbols BOOLEAN DEFAULT false,
  length INTEGER NOT NULL,
  common_password BOOLEAN DEFAULT false,
  suggestions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create OCR scanned documents table
CREATE TABLE public.scanned_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  file_url TEXT,
  extracted_text TEXT,
  document_type TEXT,
  fraud_risk_score INTEGER CHECK (fraud_risk_score BETWEEN 0 AND 10),
  fraud_indicators TEXT[],
  recommendations TEXT[],
  confidence_level INTEGER CHECK (confidence_level BETWEEN 0 AND 10),
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scam library table
CREATE TABLE public.scam_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  warning_signs TEXT[],
  prevention_tips TEXT[],
  real_examples TEXT[],
  reported_count INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT false,
  tags TEXT[],
  image_url TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create law learning modules table
CREATE TABLE public.law_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration INTEGER, -- in minutes
  prerequisites UUID[],
  learning_objectives TEXT[],
  quiz_questions JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user progress table for law learning
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.law_modules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  quiz_score INTEGER,
  time_spent INTEGER DEFAULT 0, -- in minutes
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Create help queries table
CREATE TABLE public.help_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  response TEXT,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dynamic alerts/news table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  alert_type TEXT DEFAULT 'info' CHECK (alert_type IN ('info', 'warning', 'danger', 'success')),
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  target_audience TEXT[] DEFAULT '{"all"}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fir_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanned_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.law_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for FIR submissions
CREATE POLICY "Users can view their own FIR submissions" ON public.fir_submissions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own FIR submissions" ON public.fir_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own FIR submissions" ON public.fir_submissions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own FIR submissions" ON public.fir_submissions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for password checks
CREATE POLICY "Users can view their own password checks" ON public.password_checks
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Anyone can create password checks" ON public.password_checks
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for scanned documents
CREATE POLICY "Users can view their own scanned documents" ON public.scanned_documents
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can create scanned documents" ON public.scanned_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update their own scanned documents" ON public.scanned_documents
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete their own scanned documents" ON public.scanned_documents
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policies for scam library (public read)
CREATE POLICY "Anyone can read scam library" ON public.scam_library
  FOR SELECT USING (true);

-- Create RLS policies for law modules (public read)
CREATE POLICY "Anyone can read published law modules" ON public.law_modules
  FOR SELECT USING (is_published = true);

-- Create RLS policies for user progress
CREATE POLICY "Users can view their own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for help queries
CREATE POLICY "Users can view their own help queries" ON public.help_queries
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can create help queries" ON public.help_queries
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policies for alerts (public read)
CREATE POLICY "Anyone can read active alerts" ON public.alerts
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fir_submissions_updated_at BEFORE UPDATE ON public.fir_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_scanned_documents_updated_at BEFORE UPDATE ON public.scanned_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_scam_library_updated_at BEFORE UPDATE ON public.scam_library FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_law_modules_updated_at BEFORE UPDATE ON public.law_modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_help_queries_updated_at BEFORE UPDATE ON public.help_queries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON public.alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for scam library
INSERT INTO public.scam_library (title, description, category, risk_level, warning_signs, prevention_tips, real_examples, reported_count, is_trending, tags) VALUES
('Phishing Email Scams', 'Fraudulent emails attempting to steal personal information', 'Email Fraud', 'high', 
 ARRAY['Urgent language', 'Suspicious sender', 'Request for personal info', 'Poor grammar'], 
 ARRAY['Verify sender identity', 'Check URL carefully', 'Never share passwords', 'Use two-factor authentication'],
 ARRAY['Fake bank emails asking for account details', 'Lottery winner notifications', 'Tax refund scams'],
 1247, true, ARRAY['email', 'phishing', 'identity theft']),
 
('UPI Payment Frauds', 'Scams involving fake UPI payment requests and refunds', 'Digital Payment', 'critical',
 ARRAY['Unknown payment requests', 'Fake refund calls', 'QR code scams', 'Wrong number transfers'],
 ARRAY['Verify payment recipient', 'Never share UPI PIN', 'Double-check QR codes', 'Report suspicious activity'],
 ARRAY['Fake GPay/PhonePe refund calls', 'Restaurant bill QR code replacement', 'Wrong number money request'],
 2156, true, ARRAY['upi', 'digital payment', 'mobile fraud']),

('Investment Scheme Frauds', 'Ponzi schemes and fake investment opportunities', 'Financial Fraud', 'high',
 ARRAY['High guaranteed returns', 'Pressure to invest quickly', 'Unlicensed advisors', 'Referral bonuses'],
 ARRAY['Research investment firms', 'Check regulatory approvals', 'Be wary of guaranteed returns', 'Consult financial advisors'],
 ARRAY['Cryptocurrency pyramid schemes', 'Fixed deposit frauds', 'Stock market tips scams'],
 892, false, ARRAY['investment', 'ponzi', 'financial fraud']);

-- Insert sample data for law modules
INSERT INTO public.law_modules (title, description, content, category, difficulty_level, estimated_duration, learning_objectives, quiz_questions, order_index) VALUES
('Introduction to Cyber Law', 'Basic understanding of cyber law principles in India', 
 'Cyber law encompasses legal issues related to the use of the internet, computers, and digital technologies...', 
 'Fundamentals', 'beginner', 30, 
 ARRAY['Understand basic cyber law concepts', 'Learn about IT Act 2000', 'Recognize cyber crimes'],
 '[{"question": "What year was the IT Act passed in India?", "options": ["1998", "2000", "2002", "2005"], "correct": 1}]',
 1),
 
('Types of Cyber Crimes', 'Understanding different categories of cyber crimes', 
 'Cyber crimes can be broadly categorized into crimes against individuals, property, and government...', 
 'Crime Types', 'intermediate', 45, 
 ARRAY['Classify different cyber crimes', 'Understand legal definitions', 'Learn punishment guidelines'],
 '[{"question": "Which section deals with hacking in IT Act?", "options": ["Section 43", "Section 66", "Section 72", "Section 79"], "correct": 1}]',
 2);

-- Insert sample alerts
INSERT INTO public.alerts (title, content, alert_type, priority, is_active, target_audience) VALUES
('New UPI Fraud Alert', 'Be aware of fake refund calls claiming to reverse wrong transactions. Never share your UPI PIN with anyone.', 'warning', 4, true, ARRAY['all']),
('Cyber Security Awareness Week', 'Join our free cyber security workshops this week. Learn to protect yourself from online threats.', 'info', 2, true, ARRAY['all']),
('Emergency: Ransomware Attack Reported', 'Several organizations hit by new ransomware variant. Update your antivirus and backup data immediately.', 'danger', 5, true, ARRAY['all']);