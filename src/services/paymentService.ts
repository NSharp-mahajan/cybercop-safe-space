import { supabase } from '@/integrations/supabase/client';

export interface PaymentConfig {
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_usage: Record<string, number>;
  is_active: boolean;
  sort_order: number;
}

export interface PaymentOptions {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  currency?: string;
  paymentMethod?: 'razorpay' | 'stripe';
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  subscriptionId?: string;
  error?: string;
}

class PaymentService {
  private razorpayKeyId: string;

  constructor() {
    // Get Razorpay key from environment
    this.razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      // Return mock data for development
      return [
        {
          id: 'free-plan',
          name: 'Free',
          description: 'Basic cybersecurity tools for everyone',
          price_monthly: 0,
          price_yearly: 0,
          features: ['basic_fir_generator', 'password_checker', 'basic_url_checker'],
          max_usage: { fir_reports: 3, message_analysis: 10, ocr_scans: 2 },
          is_active: true,
          sort_order: 0
        },
        {
          id: 'pro-plan',
          name: 'Pro',
          description: 'Advanced security features for power users',
          price_monthly: 199,
          price_yearly: 1990,
          features: ['unlimited_fir_generator', 'advanced_fraud_detection', 'premium_message_analyzer', 'chrome_extension', 'priority_support'],
          max_usage: { fir_reports: 50, message_analysis: 500, ocr_scans: 100 },
          is_active: true,
          sort_order: 1
        },
        {
          id: 'enterprise-plan',
          name: 'Enterprise',
          description: 'Complete cybersecurity suite for organizations',
          price_monthly: 999,
          price_yearly: 9990,
          features: ['all_pro_features', 'chrome_extension', 'api_access', 'team_management', 'dedicated_support'],
          max_usage: { fir_reports: -1, message_analysis: -1, ocr_scans: -1 },
          is_active: true,
          sort_order: 2
        }
      ];
    }
  }

  async getUserCurrentSubscription(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('ends_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  }

  async checkFeatureAccess(userId: string, featureName: string): Promise<boolean> {
    try {
      const subscription = await this.getUserCurrentSubscription(userId);
      
      if (!subscription) {
        // Check if it's a free feature
        const freePlan = await this.getSubscriptionPlans().then(plans => 
          plans.find(plan => plan.name === 'Free')
        );
        return freePlan?.features.includes(featureName) || false;
      }

      return subscription.subscription_plans?.features?.includes(featureName) || false;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  async initializeRazorpayPayment(options: PaymentOptions, userEmail: string, userName: string): Promise<PaymentResult> {
    try {
      // Get plan details
      const plans = await this.getSubscriptionPlans();
      const plan = plans.find(p => p.id === options.planId);

      if (!plan) {
        return { success: false, error: 'Plan not found' };
      }

      const amount = options.billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
      const amountInPaise = Math.round(amount * 100); // Razorpay expects amount in paise

      if (amount === 0) {
        // Free plan - just create subscription
        return await this.createFreeSubscription(options, plan);
      }

      // Load Razorpay script
      await this.loadRazorpayScript();

      return new Promise((resolve) => {
        const razorpayOptions = {
          key: this.razorpayKeyId,
          amount: amountInPaise,
          currency: options.currency || 'INR',
          name: 'CyberCop Safe Space',
          description: `${plan.name} - ${options.billingCycle} subscription`,
          image: 'https://storage.googleapis.com/gpt-engineer-file-uploads/PV4PIq528rhqfb6i594ANQRv5jk2/uploads/1757931531206-cyber.png',
          prefill: {
            name: userName,
            email: userEmail,
          },
          theme: {
            color: '#3b82f6'
          },
          handler: async (response: any) => {
            // Verify payment and create subscription
            const result = await this.verifyRazorpayPayment(response, options, plan);
            resolve(result);
          },
          modal: {
            ondismiss: () => {
              resolve({ success: false, error: 'Payment cancelled by user' });
            }
          }
        };

        const razorpay = new (window as any).Razorpay(razorpayOptions);
        razorpay.open();
      });
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      return { success: false, error: 'Failed to initialize payment' };
    }
  }

  private async loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.body.appendChild(script);
    });
  }

  private async createFreeSubscription(options: PaymentOptions, plan: SubscriptionPlan): Promise<PaymentResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Calculate subscription end date
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 100); // Free plan never expires

      // Create subscription record
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: options.planId,
          status: 'active',
          billing_cycle: options.billingCycle,
          starts_at: startDate.toISOString(),
          ends_at: endDate.toISOString(),
          payment_method: 'free',
          amount_paid: 0
        })
        .select()
        .single();

      if (subError) {
        console.error('Free subscription creation error:', subError);
        console.error('Error details:', {
          message: subError.message,
          details: subError.details,
          hint: subError.hint,
          code: subError.code
        });
        return { success: false, error: `Failed to create subscription: ${subError.message}` };
      }

      return {
        success: true,
        subscriptionId: subscription.id
      };
    } catch (error) {
      console.error('Free subscription error:', error);
      return { success: false, error: 'Failed to create free subscription' };
    }
  }

  private async verifyRazorpayPayment(
    razorpayResponse: any, 
    options: PaymentOptions, 
    plan: SubscriptionPlan
  ): Promise<PaymentResult> {
    try {
      console.log('Starting payment verification...');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);
      if (!user) {
        console.error('No authenticated user found');
        return { success: false, error: 'User not authenticated' };
      }

      // Calculate subscription end date
      const startDate = new Date();
      const endDate = new Date(startDate);
      if (options.billingCycle === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      // Create subscription record
      console.log('Creating subscription with data:', {
        user_id: user.id,
        plan_id: options.planId,
        status: 'active',
        billing_cycle: options.billingCycle,
        starts_at: startDate.toISOString(),
        ends_at: endDate.toISOString(),
        payment_method: 'razorpay',
        payment_id: razorpayResponse.razorpay_payment_id,
        amount_paid: options.billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly
      });
      
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: options.planId,
          status: 'active',
          billing_cycle: options.billingCycle,
          starts_at: startDate.toISOString(),
          ends_at: endDate.toISOString(),
          payment_method: 'razorpay',
          payment_id: razorpayResponse.razorpay_payment_id,
          amount_paid: options.billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly
        })
        .select()
        .single();

      if (subError) {
        console.error('Subscription creation error:', subError);
        console.error('Error details:', {
          message: subError.message,
          details: subError.details,
          hint: subError.hint,
          code: subError.code
        });
        return { success: false, error: `Failed to create subscription: ${subError.message}` };
      }

      // Create payment transaction record
      await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          subscription_id: subscription.id,
          amount: options.billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly,
          currency: options.currency || 'INR',
          status: 'completed',
          payment_gateway: 'razorpay',
          gateway_transaction_id: razorpayResponse.razorpay_payment_id,
          gateway_payment_id: razorpayResponse.razorpay_payment_id,
          metadata: razorpayResponse
        });

      return {
        success: true,
        transactionId: razorpayResponse.razorpay_payment_id,
        subscriptionId: subscription.id
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return { success: false, error: 'Payment verification failed' };
    }
  }

  async trackFeatureUsage(featureName: string, metadata?: Record<string, any>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('feature_usage')
        .insert({
          user_id: user.id,
          feature_name: featureName,
          usage_count: 1,
          metadata: metadata || {}
        });

      if (error) {
        console.error('Error tracking feature usage:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Feature usage tracking error:', error);
      return false;
    }
  }

  async getFeatureUsage(featureName: string, timeframe: 'day' | 'month' | 'all' = 'month'): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      let query = supabase
        .from('feature_usage')
        .select('usage_count')
        .eq('user_id', user.id)
        .eq('feature_name', featureName);

      if (timeframe === 'day') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('used_at', today.toISOString());
      } else if (timeframe === 'month') {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        query = query.gte('used_at', monthStart.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching feature usage:', error);
        return 0;
      }

      return data?.reduce((total, record) => total + (record.usage_count || 1), 0) || 0;
    } catch (error) {
      console.error('Feature usage fetch error:', error);
      return 0;
    }
  }
}

export const paymentService = new PaymentService();
