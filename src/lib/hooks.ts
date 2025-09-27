// Central export for all commonly used hooks and contexts
// Import this file once at the top of your components: import * from '@/lib/hooks';

// Re-export hooks
export { useToast } from '@/hooks/use-toast';
export { usePremiumFeature } from '@/hooks/usePremiumFeature';

// Re-export contexts
export { useAuth } from '@/contexts/AuthContext';
export { useSubscription } from '@/contexts/SubscriptionContext';

// Re-export commonly used utilities
export { cn } from '@/lib/utils';

// Re-export UI components that are frequently used
export { Button } from '@/components/ui/button';
export { Input } from '@/components/ui/input';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
export { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
export { Badge } from '@/components/ui/badge';
export { toast } from '@/hooks/use-toast';
