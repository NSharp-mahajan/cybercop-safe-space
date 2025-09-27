import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Loader2, CreditCard, User, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Alert, AlertDescription, Badge, useSubscription, useAuth, toast } from '@/lib/hooks';

const SubscriptionTest = () => {
  const { user } = useAuth();
  const { 
    currentSubscription, 
    subscriptionPlans, 
    getCurrentPlan, 
    upgradeSubscription, 
    refreshSubscription 
  } = useSubscription();
  
  const [testResults, setTestResults] = useState<Record<string, { 
    status: 'pending' | 'success' | 'error'; 
    message: string;
    details?: any;
  }>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [razorpayConfig, setRazorpayConfig] = useState<any>(null);

  // Check Razorpay configuration
  const checkRazorpayConfig = async () => {
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const result = {
      status: keyId ? 'success' : 'error' as const,
      message: keyId 
        ? `Razorpay Key ID configured: ${keyId.substring(0, 10)}...`
        : 'Razorpay Key ID not found in environment variables',
      details: {
        keyId: keyId ? `${keyId.substring(0, 10)}...` : 'Not configured',
        isTestKey: keyId?.startsWith('rzp_test_')
      }
    };
    
    setTestResults(prev => ({ ...prev, razorpayConfig: result }));
    setRazorpayConfig(result.details);
    return result.status === 'success';
  };

  // Check database tables
  const checkDatabaseTables = async () => {
    try {
      const tables = ['subscription_plans', 'user_subscriptions', 'payment_transactions', 'feature_usage'];
      const results: any = {};

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (error) {
            results[table] = { exists: false, error: error.message };
          } else {
            results[table] = { exists: true, count: data?.length || 0 };
          }
        } catch (e) {
          results[table] = { exists: false, error: String(e) };
        }
      }

      const allExist = Object.values(results).every((r: any) => r.exists);
      setTestResults(prev => ({
        ...prev,
        databaseTables: {
          status: allExist ? 'success' : 'error',
          message: allExist ? 'All subscription tables exist' : 'Some tables are missing',
          details: results
        }
      }));

      return allExist;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        databaseTables: {
          status: 'error',
          message: 'Failed to check database tables',
          details: { error: String(error) }
        }
      }));
      return false;
    }
  };

  // Check subscription plans
  const checkSubscriptionPlans = async () => {
    try {
      const { data: plans, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('sort_order');

      if (error) throw error;

      setTestResults(prev => ({
        ...prev,
        subscriptionPlans: {
          status: plans && plans.length > 0 ? 'success' : 'error',
          message: plans && plans.length > 0 
            ? `Found ${plans.length} subscription plans` 
            : 'No subscription plans found',
          details: plans
        }
      }));

      return plans && plans.length > 0;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        subscriptionPlans: {
          status: 'error',
          message: 'Failed to fetch subscription plans',
          details: { error: String(error) }
        }
      }));
      return false;
    }
  };

  // Check user profile and subscription
  const checkUserSubscription = async () => {
    if (!user) {
      setTestResults(prev => ({
        ...prev,
        userSubscription: {
          status: 'error',
          message: 'No authenticated user found',
          details: null
        }
      }));
      return false;
    }

    try {
      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Check subscription
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (subError) throw subError;

      const activeSubscription = subscriptions?.find(s => s.status === 'active');

      setTestResults(prev => ({
        ...prev,
        userSubscription: {
          status: 'success',
          message: activeSubscription 
            ? `Active ${activeSubscription.subscription_plans?.name} subscription found`
            : 'No active subscription (free tier)',
          details: {
            profile,
            subscriptions,
            activeSubscription
          }
        }
      }));

      return true;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        userSubscription: {
          status: 'error',
          message: 'Failed to check user subscription',
          details: { error: String(error) }
        }
      }));
      return false;
    }
  };

  // Test free plan subscription
  const testFreeSubscription = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to test subscription",
        variant: "destructive"
      });
      return;
    }

    try {
      // First check if user already has a subscription
      const { data: existing } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (existing) {
        toast({
          title: "Subscription Exists",
          description: "You already have an active subscription",
        });
        return;
      }

      await upgradeSubscription('free-plan', 'monthly');
      
      toast({
        title: "Success",
        description: "Free subscription created successfully",
      });

      // Refresh test results
      await runAllTests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create free subscription",
        variant: "destructive"
      });
    }
  };

  // Test Razorpay payment flow (test mode)
  const testRazorpayPayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to test payment",
        variant: "destructive"
      });
      return;
    }

    if (!razorpayConfig?.keyId) {
      toast({
        title: "Configuration Error",
        description: "Razorpay is not configured. Please add VITE_RAZORPAY_KEY_ID to your .env file",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Test Payment",
      description: "Opening Razorpay test payment dialog. Use test card: 4111 1111 1111 1111",
    });

    // Attempt to upgrade to Pro plan
    await upgradeSubscription('pro-plan', 'monthly');
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});

    const tests = [
      { name: 'Razorpay Config', fn: checkRazorpayConfig },
      { name: 'Database Tables', fn: checkDatabaseTables },
      { name: 'Subscription Plans', fn: checkSubscriptionPlans },
      { name: 'User Subscription', fn: checkUserSubscription }
    ];

    for (const test of tests) {
      await test.fn();
      // Add delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runAllTests();
  }, [user]);

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription System Test</h1>
        <p className="text-muted-foreground">
          Test the integration between profiles, subscriptions, and Razorpay payment gateway
        </p>
      </div>

      {/* User Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current User
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Current Plan:</strong> {getCurrentPlan()?.name || 'None'}</p>
              {currentSubscription && (
                <>
                  <p><strong>Status:</strong> <Badge variant="outline">{currentSubscription.status}</Badge></p>
                  <p><strong>Billing:</strong> {currentSubscription.billing_cycle}</p>
                  <p><strong>Expires:</strong> {new Date(currentSubscription.ends_at).toLocaleDateString()}</p>
                </>
              )}
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                No user logged in. Please sign in to test subscription features.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>System Tests</span>
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              size="sm"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(testResults).map(([key, result]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(result.status)}
                <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
              <p className="text-sm text-muted-foreground ml-7">{result.message}</p>
              {result.details && (
                <details className="ml-7">
                  <summary className="text-sm cursor-pointer text-blue-600">View Details</summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Test Actions
          </CardTitle>
          <CardDescription>
            Test various subscription scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">1. Test Free Subscription</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Create a free subscription for the current user (no payment required)
            </p>
            <Button 
              onClick={testFreeSubscription}
              disabled={!user || !!currentSubscription}
            >
              Create Free Subscription
            </Button>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">2. Test Razorpay Payment (Test Mode)</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Test the payment flow with Razorpay test cards. Use card number: 4111 1111 1111 1111
            </p>
            <div className="space-y-2">
              {!razorpayConfig?.keyId && (
                <Alert className="mb-2">
                  <AlertDescription>
                    ⚠️ Razorpay is not configured. Add <code>VITE_RAZORPAY_KEY_ID</code> to your .env file
                  </AlertDescription>
                </Alert>
              )}
              <Button 
                onClick={testRazorpayPayment}
                disabled={!user || !razorpayConfig?.keyId}
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Test Pro Plan Payment
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">3. Available Plans</h3>
            <div className="grid gap-2 mt-2">
              {subscriptionPlans.map(plan => (
                <div key={plan.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{plan.price_monthly}/mo</p>
                      <p className="text-sm text-muted-foreground">₹{plan.price_yearly}/yr</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert className="mt-6">
        <AlertDescription>
          <strong>Testing Instructions:</strong>
          <ol className="mt-2 list-decimal list-inside space-y-1">
            <li>Ensure you have added Razorpay test API keys to your .env file</li>
            <li>Sign in with a test account</li>
            <li>Run the system tests to verify everything is set up correctly</li>
            <li>Test creating a free subscription first</li>
            <li>For payment testing, use Razorpay test cards (e.g., 4111 1111 1111 1111)</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SubscriptionTest;
