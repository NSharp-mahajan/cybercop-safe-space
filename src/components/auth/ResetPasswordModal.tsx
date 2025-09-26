import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToAuth: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ 
  isOpen, 
  onClose, 
  onBackToAuth 
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });

    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setIsLoading(false);
    setIsSuccess(false);
    onClose();
  };

  const handleBackToAuth = () => {
    setEmail("");
    setIsLoading(false);
    setIsSuccess(false);
    onBackToAuth();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            {isSuccess ? "Check Your Email" : "Reset Password"}
          </DialogTitle>
          <DialogDescription>
            {isSuccess 
              ? "We've sent you a password reset link. Check your email and follow the instructions to reset your password."
              : "Enter your email address and we'll send you a link to reset your password."
            }
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="p-4 rounded-full bg-green-100">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                If an account with email <strong>{email}</strong> exists, you'll receive a password reset link shortly.
              </p>
              <p className="text-xs text-muted-foreground">
                Don't see the email? Check your spam folder.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBackToAuth} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBackToAuth}
                disabled={isLoading}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !email.trim()}
                className="flex-1"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
