import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // First, check if we have a hash fragment with tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          // Wait a bit for Supabase to process the tokens
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: "Authentication Error",
            description: error.message || "There was an error during authentication. Please try again.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        if (data.session) {
          // Session exists - user is authenticated
          console.log('User authenticated:', data.session.user.email);
          // Redirect to dashboard or previous page
          const returnTo = localStorage.getItem('returnTo') || '/dashboard';
          localStorage.removeItem('returnTo');
          navigate(returnTo);
        } else {
          // No session - might still be processing
          console.log('No session found in callback');
          navigate('/');
        }
      } catch (error) {
        console.error('Unexpected auth callback error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <h2 className="text-lg font-semibold">Completing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we sign you in.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
