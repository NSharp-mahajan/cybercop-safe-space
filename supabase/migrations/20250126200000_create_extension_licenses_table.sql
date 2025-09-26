-- Create extension licenses table
CREATE TABLE public.extension_licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  extension_id TEXT NOT NULL,
  license_key TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'expired')) DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, extension_id)
);

-- Enable RLS
ALTER TABLE public.extension_licenses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own extension licenses" ON public.extension_licenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own extension licenses" ON public.extension_licenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own extension licenses" ON public.extension_licenses
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for extension verification (public access)
CREATE POLICY "Extension can verify licenses" ON public.extension_licenses
  FOR SELECT USING (true);

-- Create indexes
CREATE INDEX idx_extension_licenses_user_id ON public.extension_licenses(user_id);
CREATE INDEX idx_extension_licenses_license_key ON public.extension_licenses(license_key);
CREATE INDEX idx_extension_licenses_status ON public.extension_licenses(status);
CREATE INDEX idx_extension_licenses_expires_at ON public.extension_licenses(expires_at);

-- Function to automatically create extension license when user subscribes to Pro/Enterprise
CREATE OR REPLACE FUNCTION public.handle_pro_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create license for Pro/Enterprise plans
  IF NEW.status = 'active' THEN
    -- Check if this is a Pro or Enterprise subscription
    DECLARE
      plan_name TEXT;
    BEGIN
      SELECT sp.name INTO plan_name
      FROM public.subscription_plans sp
      WHERE sp.id = NEW.plan_id;
      
      IF plan_name IN ('Pro', 'Enterprise') THEN
        -- Create extension license
        INSERT INTO public.extension_licenses (
          user_id,
          extension_id,
          license_key,
          status,
          expires_at,
          subscription_id
        ) VALUES (
          NEW.user_id,
          'cybercop-fraud-detector',
          'CC-' || UPPER(SUBSTR(NEW.user_id::TEXT, 1, 8)) || '-' || 
          UPPER(TO_CHAR(EXTRACT(EPOCH FROM NOW()), 'FM999999999')) || '-' ||
          UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 9)),
          'active',
          NEW.ends_at,
          NEW.id
        )
        ON CONFLICT (user_id, extension_id) 
        DO UPDATE SET
          license_key = EXCLUDED.license_key,
          status = 'active',
          expires_at = EXCLUDED.expires_at,
          subscription_id = EXCLUDED.subscription_id,
          updated_at = NOW();
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create extension license on subscription activation
CREATE TRIGGER on_subscription_activated
  AFTER INSERT OR UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_pro_subscription();

-- Function to deactivate extension license when subscription ends
CREATE OR REPLACE FUNCTION public.handle_subscription_deactivation()
RETURNS TRIGGER AS $$
BEGIN
  -- Deactivate extension license when subscription becomes inactive
  IF OLD.status = 'active' AND NEW.status IN ('cancelled', 'expired') THEN
    UPDATE public.extension_licenses 
    SET 
      status = 'inactive',
      updated_at = NOW()
    WHERE subscription_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to deactivate extension license on subscription cancellation
CREATE TRIGGER on_subscription_deactivated
  AFTER UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_subscription_deactivation();
