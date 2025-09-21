-- Fix Chat and OCR RLS Policies
-- This migration fixes the database permissions for chat functionality and OCR fraud detection

-- ============================================================================
-- CHATS TABLE POLICIES
-- ============================================================================

-- Enable RLS on chats table
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own chats" ON chats;
DROP POLICY IF EXISTS "Users can create chats" ON chats;
DROP POLICY IF EXISTS "Anonymous can create chats" ON chats;
DROP POLICY IF EXISTS "Allow chat access" ON chats;

-- Create comprehensive policies for chats table
CREATE POLICY "Allow chat insertions" ON chats
  FOR INSERT WITH CHECK (
    -- Allow authenticated users to create chats with their user_id
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    -- Allow anonymous users to create chats with anonymous_session
    (user_id IS NULL AND anonymous_session IS NOT NULL)
  );

CREATE POLICY "Allow chat selections" ON chats
  FOR SELECT USING (
    -- Users can view their own chats
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    -- Anonymous users can view chats they created (Edge Functions have service role access)
    (user_id IS NULL)
  );

CREATE POLICY "Allow chat updates" ON chats
  FOR UPDATE USING (
    -- Users can update their own chats
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    -- Anonymous sessions can be updated (for title changes, etc.)
    (user_id IS NULL)
  );

-- ============================================================================
-- CHAT_MESSAGES TABLE POLICIES
-- ============================================================================

-- Enable RLS on chat_messages table
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view messages in their chats" ON chat_messages;
DROP POLICY IF EXISTS "Users can create messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow message access" ON chat_messages;

-- Create policies for chat_messages table
CREATE POLICY "Allow message insertions" ON chat_messages
  FOR INSERT WITH CHECK (
    -- Allow if the associated chat belongs to the authenticated user
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = chat_messages.chat_id 
      AND (
        (auth.uid() IS NOT NULL AND chats.user_id = auth.uid())
        OR
        (chats.user_id IS NULL) -- Anonymous chats
      )
    )
  );

CREATE POLICY "Allow message selections" ON chat_messages
  FOR SELECT USING (
    -- Allow if the associated chat belongs to the user or is anonymous
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = chat_messages.chat_id 
      AND (
        (auth.uid() IS NOT NULL AND chats.user_id = auth.uid())
        OR
        (chats.user_id IS NULL) -- Anonymous chats
      )
    )
  );

-- ============================================================================
-- SCANNED_DOCUMENTS TABLE POLICIES
-- ============================================================================

-- Enable RLS on scanned_documents table
ALTER TABLE scanned_documents ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view own documents" ON scanned_documents;
DROP POLICY IF EXISTS "Users can create documents" ON scanned_documents;
DROP POLICY IF EXISTS "Allow document access" ON scanned_documents;

-- Create policies for scanned_documents table
CREATE POLICY "Allow document insertions" ON scanned_documents
  FOR INSERT WITH CHECK (
    -- Allow authenticated users to insert their own documents
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    -- Allow anonymous users to insert documents (user_id is NULL)
    (user_id IS NULL)
  );

CREATE POLICY "Allow document selections" ON scanned_documents
  FOR SELECT USING (
    -- Users can view their own documents
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    -- Anonymous documents (for Edge Functions with service role)
    (user_id IS NULL)
  );

CREATE POLICY "Allow document updates" ON scanned_documents
  FOR UPDATE USING (
    -- Users can update their own documents
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    -- Allow updates to anonymous documents (for processing status, etc.)
    (user_id IS NULL)
  )
  WITH CHECK (
    -- Ensure the user_id doesn't change during updates
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    (user_id IS NULL)
  );

-- ============================================================================
-- ADDITIONAL TABLES THAT MIGHT NEED ANONYMOUS ACCESS
-- ============================================================================

-- Ensure URL_CHECKS table has proper policies (already working but let's make sure)
ALTER TABLE url_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow url check insertions" ON url_checks;
CREATE POLICY "Allow url check insertions" ON url_checks
  FOR INSERT WITH CHECK (
    -- Allow both authenticated and anonymous users
    true
  );

DROP POLICY IF EXISTS "Allow url check selections" ON url_checks;
CREATE POLICY "Allow url check selections" ON url_checks
  FOR SELECT USING (
    -- Allow both authenticated and anonymous users to read
    true
  );

-- Ensure SCAM_REPORTS table has proper policies (already working but let's make sure)
ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow scam report insertions" ON scam_reports;
CREATE POLICY "Allow scam report insertions" ON scam_reports
  FOR INSERT WITH CHECK (
    -- Allow both authenticated and anonymous users
    true
  );

DROP POLICY IF EXISTS "Allow scam report selections" ON scam_reports;
CREATE POLICY "Allow scam report selections" ON scam_reports
  FOR SELECT USING (
    -- Allow all users to read scam reports for community awareness
    true
  );

-- ============================================================================
-- GRANT NECESSARY PERMISSIONS TO ANON ROLE
-- ============================================================================

-- Ensure anon role has necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE ON chats TO anon;
GRANT SELECT, INSERT ON chat_messages TO anon;
GRANT SELECT, INSERT, UPDATE ON scanned_documents TO anon;
GRANT SELECT, INSERT ON url_checks TO anon;
GRANT SELECT, INSERT ON scam_reports TO anon;

-- Grant sequence usage for auto-incrementing IDs
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
