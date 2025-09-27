-- Check if subscription tables exist and have proper structure
-- 1. Check subscription_plans table
SELECT 'Subscription Plans Table:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'subscription_plans'
ORDER BY ordinal_position;

-- Check existing plans
SELECT 'Existing Subscription Plans:' as info;
SELECT * FROM public.subscription_plans ORDER BY sort_order;

-- 2. Check user_subscriptions table
SELECT 'User Subscriptions Table:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- Check constraints on user_subscriptions
SELECT 'User Subscriptions Constraints:' as info;
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public' 
    AND tc.table_name = 'user_subscriptions';

-- 3. Check payment_transactions table
SELECT 'Payment Transactions Table:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'payment_transactions'
ORDER BY ordinal_position;

-- 4. Check feature_usage table
SELECT 'Feature Usage Table:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'feature_usage'
ORDER BY ordinal_position;

-- 5. Check if tables are missing and create them if needed
DO $$
BEGIN
    -- Create subscription_plans if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscription_plans'
    ) THEN
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
        
        -- Enable RLS
        ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
        
        -- Create policy
        CREATE POLICY "Anyone can read subscription plans" ON public.subscription_plans
            FOR SELECT USING (is_active = true);
            
        -- Insert default plans
        INSERT INTO public.subscription_plans (id, name, description, price_monthly, price_yearly, features, max_usage, sort_order) VALUES
        ('free-plan', 'Free', 'Basic cybersecurity tools for everyone', 0, 0, 
         ARRAY['basic_fir_generator', 'password_checker', 'basic_url_checker'], 
         '{"fir_reports": 3, "message_analysis": 10, "ocr_scans": 2}'::jsonb, 0),
        ('pro-plan', 'Pro', 'Advanced security features for power users', 199, 1990,
         ARRAY['unlimited_fir_generator', 'advanced_fraud_detection', 'premium_message_analyzer', 'chrome_extension', 'priority_support'],
         '{"fir_reports": 50, "message_analysis": 500, "ocr_scans": 100}'::jsonb, 1),
        ('enterprise-plan', 'Enterprise', 'Complete cybersecurity suite for organizations', 999, 9990,
         ARRAY['all_pro_features', 'chrome_extension', 'api_access', 'team_management', 'dedicated_support'],
         '{"fir_reports": -1, "message_analysis": -1, "ocr_scans": -1}'::jsonb, 2);
         
        RAISE NOTICE 'Created subscription_plans table and inserted default plans';
    END IF;
    
    -- Create user_subscriptions if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_subscriptions'
    ) THEN
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
        
        -- Enable RLS
        ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
            FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
            FOR UPDATE USING (auth.uid() = user_id);
            
        -- Create indexes
        CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
        CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
        CREATE INDEX idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
        
        RAISE NOTICE 'Created user_subscriptions table';
    END IF;
    
    -- Create payment_transactions if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payment_transactions'
    ) THEN
        CREATE TABLE public.payment_transactions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
            amount INTEGER NOT NULL,
            currency TEXT DEFAULT 'INR',
            status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
            payment_gateway TEXT NOT NULL,
            gateway_transaction_id TEXT,
            gateway_payment_id TEXT,
            metadata JSONB DEFAULT '{}'::jsonb
        );
        
        -- Enable RLS
        ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view own transactions" ON public.payment_transactions
            FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert own transactions" ON public.payment_transactions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            
        -- Create indexes
        CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions(user_id);
        CREATE INDEX idx_payment_transactions_subscription_id ON public.payment_transactions(subscription_id);
        
        RAISE NOTICE 'Created payment_transactions table';
    END IF;
    
    -- Create feature_usage if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'feature_usage'
    ) THEN
        CREATE TABLE public.feature_usage (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            feature_name TEXT NOT NULL,
            usage_count INTEGER DEFAULT 1,
            used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            metadata JSONB DEFAULT '{}'::jsonb
        );
        
        -- Enable RLS
        ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view own feature usage" ON public.feature_usage
            FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert own feature usage" ON public.feature_usage
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update own feature usage" ON public.feature_usage
            FOR UPDATE USING (auth.uid() = user_id);
            
        -- Create indexes
        CREATE INDEX idx_feature_usage_user_id ON public.feature_usage(user_id);
        CREATE INDEX idx_feature_usage_feature_name ON public.feature_usage(feature_name);
        CREATE INDEX idx_feature_usage_used_at ON public.feature_usage(used_at);
        
        RAISE NOTICE 'Created feature_usage table';
    END IF;
END $$;

-- 6. Verify integration with profiles
SELECT 'Checking profile-subscription integration:' as info;
SELECT 
    p.id,
    p.email,
    p.full_name,
    us.plan_id,
    us.status as subscription_status,
    us.ends_at,
    sp.name as plan_name
FROM public.profiles p
LEFT JOIN public.user_subscriptions us ON p.id = us.user_id AND us.status = 'active'
LEFT JOIN public.subscription_plans sp ON us.plan_id = sp.id
WHERE p.id IN (SELECT id FROM auth.users)
LIMIT 10;

-- 7. Create test user with free subscription if needed
DO $$
DECLARE
    test_user_id UUID;
    has_subscription BOOLEAN;
BEGIN
    -- Find a test user
    SELECT id INTO test_user_id
    FROM auth.users
    WHERE email LIKE '%test%' OR email LIKE '%demo%'
    LIMIT 1;
    
    IF test_user_id IS NULL THEN
        -- Use the first available user
        SELECT id INTO test_user_id
        FROM auth.users
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;
    
    IF test_user_id IS NOT NULL THEN
        -- Check if user has any subscription
        SELECT EXISTS (
            SELECT 1 FROM public.user_subscriptions 
            WHERE user_id = test_user_id
        ) INTO has_subscription;
        
        IF NOT has_subscription THEN
            -- Create a free subscription for testing
            INSERT INTO public.user_subscriptions (
                user_id,
                plan_id,
                status,
                billing_cycle,
                starts_at,
                ends_at,
                payment_method,
                amount_paid
            ) VALUES (
                test_user_id,
                'free-plan',
                'active',
                'monthly',
                NOW(),
                NOW() + INTERVAL '100 years',
                'free',
                0
            );
            
            RAISE NOTICE 'Created test free subscription for user %', test_user_id;
        END IF;
    END IF;
END $$;

-- 8. Summary
SELECT 'Summary:' as info;
SELECT 
    (SELECT COUNT(*) FROM public.profiles) as total_profiles,
    (SELECT COUNT(*) FROM public.user_subscriptions) as total_subscriptions,
    (SELECT COUNT(*) FROM public.user_subscriptions WHERE status = 'active') as active_subscriptions,
    (SELECT COUNT(*) FROM public.subscription_plans) as total_plans;
