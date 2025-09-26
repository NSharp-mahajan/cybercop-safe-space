-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly INTEGER NOT NULL DEFAULT 0,
  features TEXT[] DEFAULT '{}',
  max_usage JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES public.subscription_plans(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')) DEFAULT 'active',
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  payment_id TEXT,
  amount_paid INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create payment transactions table
CREATE TABLE public.payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  gateway_response JSONB,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create feature usage tracking table
CREATE TABLE public.feature_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  usage_date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, feature_name, usage_date)
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for subscription_plans (public read)
CREATE POLICY "Anyone can read subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- Create policies for user_subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for payment_transactions
CREATE POLICY "Users can view own transactions" ON public.payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.payment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for feature_usage
CREATE POLICY "Users can view own feature usage" ON public.feature_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feature usage" ON public.feature_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feature usage" ON public.feature_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_subscription_id ON public.payment_transactions(subscription_id);
CREATE INDEX idx_feature_usage_user_id ON public.feature_usage(user_id);
CREATE INDEX idx_feature_usage_feature_name ON public.feature_usage(feature_name);
CREATE INDEX idx_feature_usage_date ON public.feature_usage(usage_date);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (id, name, description, price_monthly, price_yearly, features, max_usage, sort_order) VALUES
('free-plan', 'Free', 'Basic cybersecurity protection', 0, 0, 
 ARRAY['basic_fir_generator', 'basic_fraud_detection', 'community_reports'], 
 '{"fir_reports": 5, "message_analysis": 10, "ocr_scans": 3}'::jsonb, 0),

('pro-plan', 'Pro', 'Advanced security features for power users', 199, 1990,
 ARRAY['unlimited_fir_generator', 'advanced_fraud_detection', 'premium_message_analyzer', 'chrome_extension', 'priority_support'],
 '{"fir_reports": 50, "message_analysis": 500, "ocr_scans": 100}'::jsonb, 1),

('enterprise-plan', 'Enterprise', 'Complete cybersecurity suite for organizations', 999, 9990,
 ARRAY['all_pro_features', 'chrome_extension', 'api_access', 'team_management', 'dedicated_support'],
 '{"fir_reports": -1, "message_analysis": -1, "ocr_scans": -1}'::jsonb, 2);

-- Function to get user's current active subscription
CREATE OR REPLACE FUNCTION public.get_user_current_subscription(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  plan_id TEXT,
  status TEXT,
  billing_cycle TEXT,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  plan_name TEXT,
  plan_features TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    us.plan_id,
    us.status,
    us.billing_cycle,
    us.starts_at,
    us.ends_at,
    sp.name as plan_name,
    sp.features as plan_features
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid 
    AND us.status = 'active'
    AND us.ends_at > NOW()
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check feature access
CREATE OR REPLACE FUNCTION public.check_user_feature_access(user_uuid UUID, feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_features TEXT[];
BEGIN
  -- Get user's current subscription features
  SELECT sp.features INTO user_features
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid 
    AND us.status = 'active'
    AND us.ends_at > NOW()
  ORDER BY us.created_at DESC
  LIMIT 1;

  -- If no subscription found, default to free features
  IF user_features IS NULL THEN
    SELECT features INTO user_features
    FROM public.subscription_plans
    WHERE id = 'free-plan';
  END IF;

  -- Check if feature is in user's plan
  RETURN feature_name = ANY(user_features);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track feature usage
CREATE OR REPLACE FUNCTION public.track_feature_usage(user_uuid UUID, feature_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO public.feature_usage (user_id, feature_name, usage_count, usage_date)
  VALUES (user_uuid, feature_name, 1, CURRENT_DATE)
  ON CONFLICT (user_id, feature_name, usage_date)
  DO UPDATE SET usage_count = feature_usage.usage_count + 1;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
