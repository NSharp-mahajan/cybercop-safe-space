import { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';

// Premium feature access hook
export const usePremiumFeature = (featureName: string) => {
  const { hasFeatureAccess, checkUsageLimit, trackFeatureUsage, getCurrentPlan } = useSubscription();
  const [isChecking, setIsChecking] = useState(false);

  const checkAccess = async (): Promise<{ 
    hasAccess: boolean; 
    reason?: 'no_feature' | 'usage_limit' | 'not_authenticated';
    current?: number;
    limit?: number;
  }> => {
    try {
      setIsChecking(true);

      // Check if user has the feature in their plan
      if (!hasFeatureAccess(featureName)) {
        return { hasAccess: false, reason: 'no_feature' };
      }

      // Check usage limits
      const usageCheck = await checkUsageLimit(featureName);
      if (!usageCheck.allowed) {
        return { 
          hasAccess: false, 
          reason: 'usage_limit',
          current: usageCheck.current,
          limit: usageCheck.limit
        };
      }

      return { hasAccess: true };
    } catch (error) {
      console.error('Error checking premium feature access:', error);
      return { hasAccess: false, reason: 'not_authenticated' };
    } finally {
      setIsChecking(false);
    }
  };

  const useFeature = async (metadata?: Record<string, any>): Promise<boolean> => {
    const accessCheck = await checkAccess();
    if (!accessCheck.hasAccess) {
      return false;
    }

    // Track the usage
    await trackFeatureUsage(featureName, metadata);
    return true;
  };

  return {
    checkAccess,
    useFeature,
    isChecking,
    currentPlan: getCurrentPlan()?.name || 'Free',
  };
};
