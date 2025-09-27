import { useState } from "react";
import { Crown, Check, Star, Shield, Zap, Sparkles, CreditCard, Calendar } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Alert, AlertDescription, useSubscription, useAuth, useToast } from '@/lib/hooks';
import { ExtensionDownload } from "@/components/ExtensionDownload";

const Subscription = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { subscriptionPlans, currentSubscription, upgradeSubscription, isLoading, getCurrentPlan } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();

  const currentPlan = getCurrentPlan();

  const formatPrice = (monthly: number, yearly: number) => {
    if (billingCycle === 'yearly' && yearly > 0) {
      const monthlyEquivalent = yearly / 12;
      const savings = Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100);
      return {
        price: yearly,
        period: 'year',
        savings: savings,
        monthlyEquivalent: monthlyEquivalent
      };
    }
    return {
      price: monthly,
      period: 'month',
      savings: 0,
      monthlyEquivalent: monthly
    };
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free': return <Shield className="h-6 w-6" />;
      case 'pro': return <Star className="h-6 w-6" />;
      case 'enterprise': return <Crown className="h-6 w-6" />;
      default: return <Zap className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pro': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'enterprise': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan_id === planId || currentPlan?.id === planId;
  };

  const handleUpgrade = async (planId: string, planName: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to upgrade your subscription.",
        variant: "destructive",
      });
      return;
    }

    if (isCurrentPlan(planId)) {
      toast({
        title: "Already Subscribed",
        description: `You are already on the ${planName} plan.`,
      });
      return;
    }

    await upgradeSubscription(planId, billingCycle);
  };

  const featuresList = {
    'Free': [
      'Basic FIR Generator (3 reports/month)',
      'Password Strength Checker',
      'Basic URL Safety Check',
      'Community Reports Access',
      'Basic Security Tools',
      'Email Support'
    ],
    'Pro': [
      'Unlimited FIR Generator',
      'Advanced Fraud Detection',
      'Premium Message Analyzer',
      'Chrome Extension Access 🔥',
      'Advanced OCR Scanning',
      'Detailed Security Reports',
      'Export Functionality',
      'Priority Email Support',
      'Advanced URL Analysis',
      'Real-time Threat Alerts'
    ],
    'Enterprise': [
      'Everything in Pro',
      'Chrome Extension Access 🔥',
      'Unlimited Usage on All Features',
      'Bulk Operations',
      'API Access',
      'Custom Integrations',
      'White-label Options',
      'Advanced Analytics Dashboard',
      'Team Management',
      'Dedicated Account Manager',
      '24/7 Phone Support',
      'Custom Training Sessions'
    ]
  };

  if (!subscriptionPlans.length) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10 glow-primary">
              <Crown className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-primary bg-clip-text text-transparent">Choose Your Plan</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Upgrade your cybersecurity toolkit with premium features designed to keep you safer online
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-primary' : 'text-muted-foreground'}`}>
              <Calendar className="h-4 w-4 inline mr-1" />
              Monthly
            </span>
            <Switch
              checked={billingCycle === 'yearly'}
              onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
            />
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-primary' : 'text-muted-foreground'}`}>
              <Calendar className="h-4 w-4 inline mr-1" />
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                Save up to 50%
              </Badge>
            )}
          </div>
        </div>

        {/* Current Subscription Alert */}
        {currentSubscription && currentPlan && (
          <Alert className="mb-8 max-w-2xl mx-auto">
            <Crown className="h-4 w-4" />
            <AlertDescription>
              You are currently on the <strong>{currentPlan.name}</strong> plan.
              {currentSubscription.ends_at && (
                <span> Your subscription {currentSubscription.status === 'active' ? 'expires' : 'expired'} on {new Date(currentSubscription.ends_at).toLocaleDateString()}.</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Subscription Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {subscriptionPlans.map((plan) => {
            const pricing = formatPrice(plan.price_monthly, plan.price_yearly || plan.price_monthly * 10);
            const isPopular = plan.name === 'Pro';
            const isCurrent = isCurrentPlan(plan.id);

            return (
              <Card 
                key={plan.id} 
                className={`relative ${isPopular ? 'border-2 border-primary shadow-xl scale-105' : ''} ${isCurrent ? 'bg-muted/50' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${getPlanColor(plan.name)}`}>
                    {getPlanIcon(plan.name)}
                  </div>
                  
                  <CardTitle className="text-2xl mb-2 flex items-center justify-center gap-2">
                    {plan.name}
                    {isCurrent && <Badge variant="outline">Current</Badge>}
                  </CardTitle>
                  
                  <CardDescription className="text-base mb-4">
                    {plan.description}
                  </CardDescription>

                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">
                      ₹{pricing.price === 0 ? '0' : pricing.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {pricing.price === 0 ? 'Forever free' : `per ${pricing.period}`}
                    </div>
                    {billingCycle === 'yearly' && pricing.savings > 0 && (
                      <div className="text-xs text-green-600 font-medium mt-1">
                        Save {pricing.savings}% annually
                      </div>
                    )}
                    {billingCycle === 'yearly' && pricing.price > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        ₹{pricing.monthlyEquivalent.toFixed(0)}/month when billed annually
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <Button
                    className={`w-full mb-6 ${isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={isPopular ? 'default' : isCurrent ? 'outline' : 'default'}
                    onClick={() => handleUpgrade(plan.id, plan.name)}
                    disabled={isLoading || isCurrent}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : plan.name === 'Free' ? (
                      'Get Started'
                    ) : (
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Upgrade Now
                      </div>
                    )}
                  </Button>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Features Included:
                    </h4>
                    
                    <ul className="space-y-2">
                      {(featuresList[plan.name as keyof typeof featuresList] || []).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.max_usage && Object.keys(plan.max_usage).length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                            Usage Limits:
                          </h4>
                          <ul className="space-y-1">
                            {Object.entries(plan.max_usage).map(([feature, limit]) => (
                              <li key={feature} className="flex justify-between text-sm">
                                <span className="capitalize">{feature.replace('_', ' ')}:</span>
                                <span className="font-medium">
                                  {limit === -1 ? 'Unlimited' : `${limit}/month`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Chrome Extension Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Premium Chrome Extension</h2>
          <div className="max-w-4xl mx-auto">
            <ExtensionDownload />
          </div>
        </div>

        {/* Payment Security */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Secure payments powered by Razorpay • UPI, Cards, Net Banking accepted</span>
          </div>
        </div>

        {/* Safety Tips Alert */}
        <Alert className="mt-8">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Secure Payments:</strong> All payments are processed securely through Razorpay. 
            We never store your payment information. You can cancel or change your subscription anytime.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default Subscription;
