-- Simplified Chat Permissions for Anonymous Users
-- This migration creates more permissive RLS policies specifically for anonymous chat functionality

-- Temporarily disable RLS to clean up and recreate policies
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow chat insertions" ON chats;
DROP POLICY IF EXISTS "Allow chat selections" ON chats;
DROP POLICY IF EXISTS "Allow chat updates" ON chats;
DROP POLICY IF EXISTS "Allow message insertions" ON chat_messages;
DROP POLICY IF EXISTS "Allow message selections" ON chat_messages;

-- Re-enable RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies for chats
CREATE POLICY "Anonymous users can manage chats" ON chats
  FOR ALL USING (
    -- Allow all operations for anonymous users (Edge Functions use service role)
    true
  )
  WITH CHECK (
    -- Allow inserts for anonymous users
    true
  );

-- Create simple, permissive policies for chat_messages
CREATE POLICY "Anonymous users can manage messages" ON chat_messages
  FOR ALL USING (
    -- Allow all operations (Edge Functions use service role)
    true
  )
  WITH CHECK (
    -- Allow inserts
    true
  );

-- Also ensure scanned_documents has permissive policies
ALTER TABLE scanned_documents DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow document insertions" ON scanned_documents;
DROP POLICY IF EXISTS "Allow document selections" ON scanned_documents;
DROP POLICY IF EXISTS "Allow document updates" ON scanned_documents;
ALTER TABLE scanned_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anonymous users can manage documents" ON scanned_documents
  FOR ALL USING (true)
  WITH CHECK (true);

-- Grant explicit permissions to anon role (ensure they exist)
GRANT ALL ON chats TO anon;
GRANT ALL ON chat_messages TO anon;
GRANT ALL ON scanned_documents TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Ensure public role also has permissions (fallback)
GRANT ALL ON chats TO public;
GRANT ALL ON chat_messages TO public;
GRANT ALL ON scanned_documents TO public;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO public;
