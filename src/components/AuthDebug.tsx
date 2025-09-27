import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const AuthDebug = () => {
  const { user, session, loading } = useAuth();

  useEffect(() => {
    // Log current auth state
    console.log('AuthDebug - Current state:', {
      user: user?.email,
      session: !!session,
      loading
    });

    // Check Supabase directly
    const checkSupabase = async () => {
      const { data: { session: supabaseSession }, error } = await supabase.auth.getSession();
      console.log('AuthDebug - Supabase direct check:', {
        session: !!supabaseSession,
        user: supabaseSession?.user?.email,
        error
      });
    };

    checkSupabase();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthDebug - Auth state change:', {
        event,
        session: !!session,
        user: session?.user?.email
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user, session, loading]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 p-4 bg-black/80 text-white rounded-lg text-xs max-w-xs">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <p>Loading: {loading ? 'true' : 'false'}</p>
        <p>User: {user ? user.email : 'null'}</p>
        <p>Session: {session ? 'active' : 'null'}</p>
      </div>
    </div>
  );
};
