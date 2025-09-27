import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { paymentService, SubscriptionPlan } from '@/services/paymentService';
import { useToast } from '@/lib/hooks';
import { useAuth } from '@/contexts/AuthContext';

interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  billing_cycle: string;
  ends_at: string;
  subscription_plans?: SubscriptionPlan;
}

interface SubscriptionContextType {
  currentSubscription: UserSubscription | null;
  subscriptionPlans: SubscriptionPlan[];
  isLoading: boolean;
  hasFeatureAccess: (featureName: string) => boolean;
  checkUsageLimit: (featureName: string) => Promise<{ allowed: boolean; current: number; limit: number }>;
  trackFeatureUsage: (featureName: string, metadata?: Record<string, any>) => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
  upgradeSubscription: (planId: string, billingCycle: 'monthly' | 'yearly') => Promise<void>;
  getCurrentPlan: () => SubscriptionPlan | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadSubscriptionPlans = async () => {
    try {
      const plans = await paymentService.getSubscriptionPlans();
      setSubscriptionPlans(plans);
    } catch (error) {
      console.error('Error loading subscription plans:', error);
    }
  };

  const refreshSubscription = async () => {
    try {
      if (!user?.id) {
        setCurrentSubscription(null);
        return;
      }

      const subscription = await paymentService.getUserCurrentSubscription(user.id);
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      setCurrentSubscription(null);
    }
  };

  const getCurrentPlan = (): SubscriptionPlan | null => {
    if (currentSubscription?.subscription_plans) {
      return currentSubscription.subscription_plans;
    }
    
    // Default to free plan
    return subscriptionPlans.find(plan => plan.name === 'Free') || null;
  };

  const hasFeatureAccess = (featureName: string): boolean => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return false;

    return currentPlan.features.includes(featureName);
  };

  const checkUsageLimit = async (featureName: string): Promise<{ allowed: boolean; current: number; limit: number }> => {
    try {
      if (!user?.id) {
        return { allowed: false, current: 0, limit: 0 };
      }

      const current = await paymentService.getFeatureUsage(featureName, 'month');
      const currentPlan = getCurrentPlan();
      const limit = currentPlan?.max_usage?.[featureName] || 0;
      
      // -1 means unlimited
      const allowed = limit === -1 || current < limit;
      
      return { allowed, current, limit };
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return { allowed: false, current: 0, limit: 0 };
    }
  };

  const trackFeatureUsage = async (featureName: string, metadata?: Record<string, any>): Promise<boolean> => {
    try {
      return await paymentService.trackFeatureUsage(featureName, metadata);
    } catch (error) {
      console.error('Error tracking feature usage:', error);
      return false;
    }
  };

  const upgradeSubscription = async (planId: string, billingCycle: 'monthly' | 'yearly') => {
    try {
      setIsLoading(true);
      console.log('Upgrading subscription:', { planId, billingCycle, user: user?.id });
      
      if (!user) {
        console.error('No user found for subscription upgrade');
        toast({
          title: "Authentication Required",
          description: "Please sign in to upgrade your subscription.",
          variant: "destructive",
        });
        return;
      }

      const result = await paymentService.initializeRazorpayPayment(
        { planId, billingCycle },
        user.email || '',
        user.user_metadata?.name || 'User'
      );

      console.log('Payment result:', result);

      if (result.success) {
        console.log('Payment successful, refreshing subscription...');
        toast({
          title: "🎉 Welcome to Pro!",
          description: "Your subscription has been successfully activated. Redirecting to your Pro dashboard...",
        });
        await refreshSubscription();
        
        // Redirect to Pro dashboard after successful payment
        setTimeout(() => {
          window.location.href = '/pro-dashboard';
        }, 2000);
      } else {
        console.error('Payment failed:', result.error);
        toast({
          title: "Payment Failed",
          description: result.error || "Failed to process payment. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast({
        title: "Upgrade Failed",
        description: "An error occurred while upgrading. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeSubscription = async () => {
      setIsLoading(true);
      await loadSubscriptionPlans();
      if (user) {
        await refreshSubscription();
      }
      setIsLoading(false);
    };

    initializeSubscription();
  }, [user]);

  const value: SubscriptionContextType = {
    currentSubscription,
    subscriptionPlans,
    isLoading,
    hasFeatureAccess,
    checkUsageLimit,
    trackFeatureUsage,
    refreshSubscription,
    upgradeSubscription,
    getCurrentPlan,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
