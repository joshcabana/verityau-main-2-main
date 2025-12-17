-- Create seen_profiles table to track viewed profiles
CREATE TABLE public.seen_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  seen_user_id UUID NOT NULL,
  seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  action TEXT NOT NULL CHECK (action IN ('like', 'pass')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, seen_user_id)
);

-- Enable RLS
ALTER TABLE public.seen_profiles ENABLE ROW LEVEL SECURITY;

-- Users can manage their own seen profiles
CREATE POLICY "Users can manage their own seen profiles"
ON public.seen_profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add last_active timestamp to profiles
ALTER TABLE public.profiles
ADD COLUMN last_active TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for faster queries
CREATE INDEX idx_seen_profiles_user_id ON public.seen_profiles(user_id);
CREATE INDEX idx_seen_profiles_seen_user_id ON public.seen_profiles(seen_user_id);
CREATE INDEX idx_profiles_last_active ON public.profiles(last_active DESC);