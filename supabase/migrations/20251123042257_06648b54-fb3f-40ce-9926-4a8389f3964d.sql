-- Add subscription fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_tier text,
ADD COLUMN IF NOT EXISTS subscription_product_id text,
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz;

-- Create index for subscription queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_product_id, subscription_expires_at);

-- Add boost tracking for premium feature
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS boost_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS boost_count integer DEFAULT 0;

-- Create index for boosted profiles (for prioritizing in matchmaking)
CREATE INDEX IF NOT EXISTS idx_profiles_boosted ON public.profiles(boost_expires_at DESC NULLS LAST);