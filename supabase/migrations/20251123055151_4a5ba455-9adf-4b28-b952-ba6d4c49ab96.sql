-- Enable RLS on all public tables that don't have it
ALTER TABLE IF EXISTS public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to recreate them properly
DROP POLICY IF EXISTS "Users can view their own analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can insert their own analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can view connections they're part of" ON public.connections;
DROP POLICY IF EXISTS "Users can create connections" ON public.connections;
DROP POLICY IF EXISTS "Users can update their connections" ON public.connections;
DROP POLICY IF EXISTS "Authenticated users can view active tests" ON public.ab_tests;
DROP POLICY IF EXISTS "Users can view their own test assignments" ON public.ab_test_assignments;
DROP POLICY IF EXISTS "Users can insert their own test assignments" ON public.ab_test_assignments;
DROP POLICY IF EXISTS "Users can view their own rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;

-- RLS Policies for analytics_events (user_id is uuid)
CREATE POLICY "Users can view their own analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for connections (user1 and user2 are uuid)
CREATE POLICY "Users can view connections they're part of"
  ON public.connections
  FOR SELECT
  USING (auth.uid() = user1 OR auth.uid() = user2);

CREATE POLICY "Users can create connections"
  ON public.connections
  FOR INSERT
  WITH CHECK (auth.uid() = user1 OR auth.uid() = user2);

CREATE POLICY "Users can update their connections"
  ON public.connections
  FOR UPDATE
  USING (auth.uid() = user1 OR auth.uid() = user2);

-- RLS Policies for ab_tests (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view active tests"
  ON public.ab_tests
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND active = true);

-- RLS Policies for ab_test_assignments (user_id is uuid)
CREATE POLICY "Users can view their own test assignments"
  ON public.ab_test_assignments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test assignments"
  ON public.ab_test_assignments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for rate_limits (user_id is TEXT, system-managed)
CREATE POLICY "Users can view their own rate limits"
  ON public.rate_limits
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "System can manage rate limits"
  ON public.rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Fix search_path for get_mutual_connections function (parameters are uuid not text)
DROP FUNCTION IF EXISTS public.get_mutual_connections(uuid, uuid);

CREATE OR REPLACE FUNCTION public.get_mutual_connections(user_a uuid, user_b uuid)
RETURNS TABLE (
  mutual_friend_id uuid,
  mutual_friend_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT 
    p.user_id as mutual_friend_id,
    p.name as mutual_friend_name
  FROM public.connections c1
  INNER JOIN public.connections c2 
    ON (c1.user1 = c2.user1 OR c1.user1 = c2.user2 OR c1.user2 = c2.user1 OR c1.user2 = c2.user2)
  INNER JOIN public.profiles p 
    ON (p.user_id::text = c1.user1::text OR p.user_id::text = c1.user2::text)
  WHERE 
    (c1.user1 = user_a OR c1.user2 = user_a)
    AND (c2.user1 = user_b OR c2.user2 = user_b)
    AND c1.status = 'accepted'
    AND c2.status = 'accepted'
    AND p.user_id::text != user_a::text
    AND p.user_id::text != user_b::text;
$$;

-- Fix search_path for rate limiting functions (user_id is text)
DROP FUNCTION IF EXISTS public.check_rate_limit(text, text, integer, integer);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id text,
  p_action text,
  p_max_requests integer,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_window_start timestamp;
BEGIN
  v_window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  SELECT count INTO v_count
  FROM public.rate_limits
  WHERE user_id = p_user_id
    AND action = p_action
    AND window_start > v_window_start;
  
  IF v_count IS NULL THEN
    v_count := 0;
  END IF;
  
  IF v_count >= p_max_requests THEN
    RETURN false;
  END IF;
  
  INSERT INTO public.rate_limits (user_id, action, count, window_start)
  VALUES (p_user_id, p_action, 1, now())
  ON CONFLICT (user_id, action, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1;
  
  RETURN true;
END;
$$;

-- Fix search_path for rate_limited_like function
DROP FUNCTION IF EXISTS public.rate_limited_like(uuid, uuid);

CREATE OR REPLACE FUNCTION public.rate_limited_like(
  p_from_user uuid,
  p_to_user uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_can_proceed boolean;
  v_result json;
BEGIN
  v_can_proceed := public.check_rate_limit(p_from_user::text, 'like', 100, 1440);
  
  IF NOT v_can_proceed THEN
    v_result := json_build_object(
      'success', false,
      'error', 'Rate limit exceeded. Please try again later.'
    );
    RETURN v_result;
  END IF;
  
  INSERT INTO public.likes (from_user, to_user)
  VALUES (p_from_user::text, p_to_user::text)
  ON CONFLICT (from_user, to_user) DO NOTHING;
  
  v_result := json_build_object(
    'success', true,
    'message', 'Like recorded successfully'
  );
  RETURN v_result;
END;
$$;

-- Fix search_path for rate_limited_message function
DROP FUNCTION IF EXISTS public.rate_limited_message(uuid, text, text);

CREATE OR REPLACE FUNCTION public.rate_limited_message(
  p_sender_id uuid,
  p_match_id text,
  p_content text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_can_proceed boolean;
  v_result json;
BEGIN
  v_can_proceed := public.check_rate_limit(p_sender_id::text, 'message', 100, 60);
  
  IF NOT v_can_proceed THEN
    v_result := json_build_object(
      'success', false,
      'error', 'Rate limit exceeded. Please slow down.'
    );
    RETURN v_result;
  END IF;
  
  INSERT INTO public.messages (sender_id, match_id, content)
  VALUES (p_sender_id::text, p_match_id, p_content);
  
  v_result := json_build_object(
    'success', true,
    'message', 'Message sent successfully'
  );
  RETURN v_result;
END;
$$;