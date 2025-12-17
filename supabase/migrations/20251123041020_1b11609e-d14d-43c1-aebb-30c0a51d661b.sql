-- =====================================================
-- PRIORITY 1: COMPREHENSIVE SECURITY IMPROVEMENTS
-- =====================================================

-- =====================================================
-- PART 1: DELETE RLS POLICIES FOR USER DATA MANAGEMENT
-- =====================================================

-- Drop existing DELETE policies
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.preferences;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own seen profiles" ON public.seen_profiles;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can delete matches they are part of" ON public.matches;

-- Preferences: Users can delete their own preferences
CREATE POLICY "Users can delete their own preferences"
ON public.preferences
FOR DELETE
USING (auth.uid() = user_id::uuid);

-- Likes: Users can delete their own likes
CREATE POLICY "Users can delete their own likes"
ON public.likes
FOR DELETE
USING (auth.uid() = from_user::uuid);

-- Seen Profiles: Users can delete their own seen profiles
CREATE POLICY "Users can delete their own seen profiles"
ON public.seen_profiles
FOR DELETE
USING (auth.uid() = user_id::uuid);

-- Messages: Users can delete messages they sent
CREATE POLICY "Users can delete their own messages"
ON public.messages
FOR DELETE
USING (auth.uid() = sender_id::uuid);

-- Notifications: Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id::uuid);

-- Reports: Users can delete their own reports
CREATE POLICY "Users can delete their own reports"
ON public.reports
FOR DELETE
USING (auth.uid() = reporter_id::uuid);

-- Matches: Users can unmatch (delete) matches they're part of
CREATE POLICY "Users can delete matches they are part of"
ON public.matches
FOR DELETE
USING (auth.uid() IN (user1::uuid, user2::uuid));

-- =====================================================
-- PART 2: RATE LIMITING SYSTEM
-- =====================================================

-- Create rate limits tracking table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  action text NOT NULL,
  count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, action, window_start)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access rate limits table
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
USING (false); -- Users cannot access this table directly

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON public.rate_limits(user_id, action, window_start DESC);

-- Function to check and enforce rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id text,
  p_action text,
  p_max_requests integer,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
  v_window_start timestamptz;
BEGIN
  -- Calculate current window start
  v_window_start := date_trunc('minute', now()) - (EXTRACT(MINUTE FROM now())::integer % p_window_minutes || ' minutes')::interval;
  
  -- Clean up old rate limit records (older than 24 hours)
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - interval '24 hours';
  
  -- Get current count for this user and action in current window
  SELECT COALESCE(count, 0)
  INTO v_count
  FROM public.rate_limits
  WHERE user_id = p_user_id
    AND action = p_action
    AND window_start = v_window_start;
  
  -- Check if limit exceeded
  IF v_count >= p_max_requests THEN
    RETURN false;
  END IF;
  
  -- Increment counter
  INSERT INTO public.rate_limits (user_id, action, count, window_start)
  VALUES (p_user_id, p_action, 1, v_window_start)
  ON CONFLICT (user_id, action, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1;
  
  RETURN true;
END;
$$;

-- =====================================================
-- PART 3: FIX FUNCTION SEARCH_PATH WARNINGS
-- =====================================================

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_verification_status function
CREATE OR REPLACE FUNCTION public.update_verification_status(
  p_profile_id uuid,
  p_status text,
  p_reviewer_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS boolean
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert verification review record
  INSERT INTO public.verification_reviews (profile_id, status, reviewer_id, reason)
  VALUES (p_profile_id, p_status, p_reviewer_id, p_reason);
  
  -- Update profile verification status if approved
  IF p_status = 'approved' THEN
    UPDATE public.profiles
    SET verified = true
    WHERE id = p_profile_id;
  END IF;
  
  RETURN true;
END;
$$;

-- Recreate nearby_profiles function with proper search_path
CREATE OR REPLACE FUNCTION public.nearby_profiles(
  user_lat double precision,
  user_lon double precision,
  distance_km double precision,
  age_min integer,
  age_max integer,
  gender_prefs text[],
  excluded_ids text[]
)
RETURNS TABLE (
  id uuid,
  user_id text,
  name text,
  age integer,
  bio text,
  photos text[],
  intro_video_url text,
  gender text,
  verified boolean,
  location geometry,
  distance_meters double precision,
  last_active timestamptz
)
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.name,
    p.age,
    p.bio,
    p.photos,
    p.intro_video_url,
    p.gender,
    p.verified,
    p.location,
    ST_Distance(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
    ) as distance_meters,
    p.last_active
  FROM public.profiles p
  WHERE p.user_id != ALL(excluded_ids)
    AND p.age BETWEEN age_min AND age_max
    AND p.gender = ANY(gender_prefs)
    AND ST_DWithin(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
      distance_km * 1000
    )
  ORDER BY distance_meters;
END;
$$;

-- =====================================================
-- PART 4: RATE LIMITED OPERATIONS (HELPER FUNCTIONS)
-- =====================================================

-- Rate-limited like function
CREATE OR REPLACE FUNCTION public.rate_limited_like(
  p_from_user text,
  p_to_user text
)
RETURNS json
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_allowed boolean;
BEGIN
  -- Check rate limit: 100 likes per hour
  v_allowed := public.check_rate_limit(p_from_user, 'like', 100, 60);
  
  IF NOT v_allowed THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Rate limit exceeded. Please try again later.',
      'rate_limited', true
    );
  END IF;
  
  -- Proceed with like
  INSERT INTO public.likes (from_user, to_user)
  VALUES (p_from_user, p_to_user)
  ON CONFLICT DO NOTHING;
  
  RETURN json_build_object('success', true, 'rate_limited', false);
END;
$$;

-- Rate-limited message function
CREATE OR REPLACE FUNCTION public.rate_limited_message(
  p_match_id uuid,
  p_sender_id text,
  p_content text
)
RETURNS json
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_allowed boolean;
  v_message_id uuid;
BEGIN
  -- Check rate limit: 60 messages per minute
  v_allowed := public.check_rate_limit(p_sender_id, 'message', 60, 1);
  
  IF NOT v_allowed THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Too many messages. Please slow down.',
      'rate_limited', true
    );
  END IF;
  
  -- Insert message
  INSERT INTO public.messages (match_id, sender_id, content)
  VALUES (p_match_id, p_sender_id, p_content)
  RETURNING id INTO v_message_id;
  
  RETURN json_build_object(
    'success', true,
    'message_id', v_message_id,
    'rate_limited', false
  );
END;
$$;

-- =====================================================
-- PART 5: CLEANUP OLD DATA (PERFORMANCE)
-- =====================================================

-- Function to clean up old data periodically
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete old seen profiles (older than 30 days)
  DELETE FROM public.seen_profiles 
  WHERE seen_at < now() - interval '30 days';
  
  -- Delete old notifications (older than 30 days and read)
  DELETE FROM public.notifications 
  WHERE created_at < now() - interval '30 days' 
    AND read = true;
  
  -- Delete old rate limit records
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - interval '24 hours';
END;
$$;