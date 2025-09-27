// Test script to check Supabase auth state
import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuthState() {
  console.log('Checking auth state...');
  
  try {
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return;
    }
    
    if (session) {
      console.log('Current session:', {
        user: session.user.email,
        expires_at: new Date(session.expires_at * 1000).toLocaleString(),
        provider: session.user.app_metadata.provider
      });
    } else {
      console.log('No active session');
    }
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (session) {
        console.log('New session user:', session.user.email);
      }
    });
    
    // Clean up after 30 seconds
    setTimeout(() => {
      subscription.unsubscribe();
      console.log('Stopped listening to auth changes');
    }, 30000);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAuthState();
