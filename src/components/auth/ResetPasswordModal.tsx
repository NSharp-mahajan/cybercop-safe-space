import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToSignIn: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ 
  isOpen, 
  onClose, 
  onBackToSignIn 
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(email.trim());
      
      if (result.success) {
        setEmailSent(true);
        toast({
          title: "Reset Email Sent!",
          description: "Check your email for password reset instructions.",
        });
      } else {
        toast({
          title: "Reset Failed",
          description: result.error || "Failed to send reset email. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setEmailSent(false);
    setIsLoading(false);
    onClose();
  };

  const handleBackToSignIn = () => {
    setEmail("");
    setEmailSent(false);
    setIsLoading(false);
    onBackToSignIn();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {emailSent ? "Check Your Email" : "Reset Password"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {emailSent 
              ? "We've sent you a password reset link" 
              : "Enter your email address and we'll send you a reset link"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {emailSent ? (
            // Success state
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-green-100">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  We've sent a password reset link to:
                </p>
                <p className="font-medium text-foreground">{email}</p>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Click the link in your email to reset your password.</p>
                <p>The link will expire in 24 hours for security.</p>
              </div>

              <div className="space-y-3 pt-4">
                <Button onClick={handleBackToSignIn} className="w-full">
                  Back to Sign In
                </Button>
                
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  className="w-full text-sm text-primary hover:underline"
                >
                  Didn't receive email? Try again
                </button>
              </div>
            </div>
          ) : (
            // Reset form
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToSignIn}
                disabled={isLoading}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </form>
          )}

          {/* Help text */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>Having trouble? Contact support for assistance.</p>
            <p>Make sure to check your spam/junk folder.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};