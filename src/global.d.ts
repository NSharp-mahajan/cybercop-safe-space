/// <reference types="vite/client" />

// Make commonly used hooks and utilities globally available
import * as hooks from '@/hooks';
import * as contexts from '@/contexts/AuthContext';
import * as subscriptionContext from '@/contexts/SubscriptionContext';

declare global {
  // Re-export hooks globally
  const useToast: typeof hooks.useToast;
  const usePremiumFeature: typeof hooks.usePremiumFeature;
  
  // Re-export context hooks globally
  const useAuth: typeof contexts.useAuth;
  const useSubscription: typeof subscriptionContext.useSubscription;
}
