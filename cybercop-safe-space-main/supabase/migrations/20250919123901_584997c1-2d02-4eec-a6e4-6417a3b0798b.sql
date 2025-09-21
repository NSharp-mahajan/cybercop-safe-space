-- Create tables for AI chatbot, scam tracker, and URL checker

-- Chats table for storing chat sessions
CREATE TABLE public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_session UUID,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Scam reports table for crowd-sourced reporting
CREATE TABLE public.scam_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  url_hash TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  evidence_file_url TEXT,
  reporter_name TEXT,
  reporter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(url_hash)
);

-- Scam votes table for tracking user votes
CREATE TABLE public.scam_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scam_report_id UUID NOT NULL REFERENCES public.scam_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(scam_report_id, user_id)
);

-- URL checks table for rate limiting and caching
CREATE TABLE public.url_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  url_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('safe', 'suspicious', 'malicious')),
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET
);

-- Enable RLS on all tables
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.url_checks ENABLE ROW LEVEL SECURITY;

-- RLS policies for chats
CREATE POLICY "Users can view their own chats or anonymous sessions" 
ON public.chats 
FOR SELECT 
USING (auth.uid() = user_id OR (user_id IS NULL AND anonymous_session IS NOT NULL));

CREATE POLICY "Users can create their own chats or anonymous sessions" 
ON public.chats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR (user_id IS NULL AND anonymous_session IS NOT NULL));

CREATE POLICY "Users can update their own chats or anonymous sessions" 
ON public.chats 
FOR UPDATE 
USING (auth.uid() = user_id OR (user_id IS NULL AND anonymous_session IS NOT NULL));

-- RLS policies for chat messages
CREATE POLICY "Users can view messages from their chats" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chats 
    WHERE chats.id = chat_messages.chat_id 
    AND (chats.user_id = auth.uid() OR chats.anonymous_session IS NOT NULL)
  )
);

CREATE POLICY "Users can create messages in their chats" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chats 
    WHERE chats.id = chat_messages.chat_id 
    AND (chats.user_id = auth.uid() OR chats.anonymous_session IS NOT NULL)
  )
);

-- RLS policies for scam reports
CREATE POLICY "Anyone can view scam reports" 
ON public.scam_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create scam reports" 
ON public.scam_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Moderators can update scam reports" 
ON public.scam_reports 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'moderator'
  )
);

-- RLS policies for scam votes
CREATE POLICY "Users can view all votes" 
ON public.scam_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create votes" 
ON public.scam_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" 
ON public.scam_votes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for URL checks
CREATE POLICY "Anyone can view URL checks" 
ON public.url_checks 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create URL checks" 
ON public.url_checks 
FOR INSERT 
WITH CHECK (true);

-- Add updated_at triggers
CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON public.chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scam_reports_updated_at
BEFORE UPDATE ON public.scam_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_chats_user_id ON public.chats(user_id);
CREATE INDEX idx_chats_anonymous_session ON public.chats(anonymous_session);
CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX idx_scam_reports_url_hash ON public.scam_reports(url_hash);
CREATE INDEX idx_scam_reports_status ON public.scam_reports(status);
CREATE INDEX idx_scam_votes_scam_report_id ON public.scam_votes(scam_report_id);
CREATE INDEX idx_scam_votes_user_id ON public.scam_votes(user_id);
CREATE INDEX idx_url_checks_url_hash ON public.url_checks(url_hash);
CREATE INDEX idx_url_checks_checked_at ON public.url_checks(checked_at);

-- Function to update vote counts
CREATE OR REPLACE FUNCTION public.update_scam_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'upvote' THEN
      UPDATE public.scam_reports 
      SET upvotes = upvotes + 1 
      WHERE id = NEW.scam_report_id;
    ELSE
      UPDATE public.scam_reports 
      SET downvotes = downvotes + 1 
      WHERE id = NEW.scam_report_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vote change
    IF OLD.vote_type = 'upvote' AND NEW.vote_type = 'downvote' THEN
      UPDATE public.scam_reports 
      SET upvotes = upvotes - 1, downvotes = downvotes + 1 
      WHERE id = NEW.scam_report_id;
    ELSIF OLD.vote_type = 'downvote' AND NEW.vote_type = 'upvote' THEN
      UPDATE public.scam_reports 
      SET upvotes = upvotes + 1, downvotes = downvotes - 1 
      WHERE id = NEW.scam_report_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'upvote' THEN
      UPDATE public.scam_reports 
      SET upvotes = upvotes - 1 
      WHERE id = OLD.scam_report_id;
    ELSE
      UPDATE public.scam_reports 
      SET downvotes = downvotes - 1 
      WHERE id = OLD.scam_report_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vote count updates
CREATE TRIGGER scam_votes_update_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.scam_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_scam_vote_counts();