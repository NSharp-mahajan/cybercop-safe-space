import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle both hash and query params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        // Check for error in query params (OAuth error)
        const errorDescription = queryParams.get('error_description');
        if (errorDescription) {
          console.error('OAuth error:', errorDescription);
          setError(errorDescription);
          toast({
            title: "Authentication Error",
            description: errorDescription,
            variant: "destructive",
          });
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        // Check for tokens in hash (implicit flow)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken || refreshToken) {
          console.log('Tokens found in URL, processing...');
          // Give Supabase time to process the tokens
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Try to get the session multiple times
        let session = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (!session && attempts < maxAttempts) {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error(`Auth session error (attempt ${attempts + 1}):`, error);
            setError(error.message);
          } else {
            session = data.session;
          }
          
          if (!session && attempts < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          attempts++;
        }
        
        if (session) {
          console.log('Authentication successful:', session.user.email);
          // Clear any error
          setError(null);
          // Redirect to dashboard or previous page
          const returnTo = localStorage.getItem('returnTo') || '/dashboard';
          localStorage.removeItem('returnTo');
          navigate(returnTo);
        } else {
          console.log('No session found after multiple attempts');
          setError('Unable to complete authentication. Please try again.');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (error: any) {
        console.error('Unexpected auth callback error:', error);
        setError(error.message || 'An unexpected error occurred');
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <h2 className="text-lg font-semibold">Completing authentication...</h2>
        <p className="text-muted-foreground">
          {error ? error : "Please wait while we sign you in."}
        </p>
        {error && (
          <p className="text-sm text-muted-foreground">
            Redirecting to home page...
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
