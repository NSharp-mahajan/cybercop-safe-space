import { useState } from "react";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, AlertTriangle, LogOut, User } from "lucide-react";
import { useAuth, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Alert, AlertDescription } from '@/lib/hooks';
import { AuthModal } from "@/components/auth/AuthModal";

export default function AuthTest() {
  const { user, session, loading, signOut, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const [testEmail, setTestEmail] = useState("");
  const [testPassword, setTestPassword] = useState("");
  const [testName, setTestName] = useState("");
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error' | 'warning' | null; message: string }>({ type: null, message: "" });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalTab, setModalTab] = useState<'signin' | 'signup'>('signin');

  const testSignUp = async () => {
    setTestResult({ type: null, message: "" });
    const result = await signUpWithEmail(testEmail, testPassword, testName);
    if (result.success) {
      setTestResult({ type: 'success', message: "Sign up successful! Check your email for confirmation." });
    } else {
      setTestResult({ type: 'error', message: `Sign up failed: ${result.error}` });
    }
  };

  const testSignIn = async () => {
    setTestResult({ type: null, message: "" });
    const result = await signInWithEmail(testEmail, testPassword);
    if (result.success) {
      setTestResult({ type: 'success', message: "Sign in successful!" });
    } else {
      setTestResult({ type: 'error', message: `Sign in failed: ${result.error}` });
    }
  };

  const testPasswordReset = async () => {
    setTestResult({ type: null, message: "" });
    const result = await resetPassword(testEmail);
    if (result.success) {
      setTestResult({ type: 'success', message: "Password reset email sent! Check your inbox." });
    } else {
      setTestResult({ type: 'error', message: `Password reset failed: ${result.error}` });
    }
  };

  const testSignOut = async () => {
    await signOut();
    setTestResult({ type: 'success', message: "Signed out successfully!" });
  };

  const openModal = (tab: 'signin' | 'signup') => {
    setModalTab(tab);
    setShowAuthModal(true);
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Authentication System Test</h1>
      
      {/* Current Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Authentication Status</CardTitle>
          <CardDescription>Real-time authentication state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {loading ? (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            ) : user ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">
              Status: {loading ? "Loading..." : user ? "Authenticated" : "Not authenticated"}
            </span>
          </div>
          
          {user && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Email: {user.email}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>User ID: {user.id}</p>
                <p>Created: {new Date(user.created_at).toLocaleString()}</p>
                <p>Email Confirmed: {user.email_confirmed_at ? "Yes" : "No"}</p>
              </div>
              <Button onClick={testSignOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Authentication Modal */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Authentication Modal</CardTitle>
          <CardDescription>Test the actual authentication UI components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={() => openModal('signin')}>
              Open Sign In Modal
            </Button>
            <Button onClick={() => openModal('signup')} variant="outline">
              Open Sign Up Modal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Direct API Test */}
      <Card>
        <CardHeader>
          <CardTitle>Direct API Test</CardTitle>
          <CardDescription>Test authentication functions directly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-name">Full Name (for signup)</Label>
              <Input
                id="test-name"
                type="text"
                placeholder="John Doe"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-email">Email</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-password">Password</Label>
              <Input
                id="test-password"
                type="password"
                placeholder="••••••••"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={testSignUp} disabled={!testEmail || !testPassword || !testName}>
              Test Sign Up
            </Button>
            <Button onClick={testSignIn} disabled={!testEmail || !testPassword} variant="outline">
              Test Sign In
            </Button>
            <Button onClick={testPasswordReset} disabled={!testEmail} variant="outline">
              Test Password Reset
            </Button>
          </div>

          {testResult.type && (
            <Alert variant={testResult.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Feature Status */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Authentication Features Status</CardTitle>
          <CardDescription>Overview of all authentication capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Email/Password Authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Google OAuth Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Password Reset Functionality</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Email Confirmation (for new signups)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>User Profile Creation (automatic)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Session Persistence</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Auth State Synchronization</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={modalTab}
      />
    </div>
  );
}
