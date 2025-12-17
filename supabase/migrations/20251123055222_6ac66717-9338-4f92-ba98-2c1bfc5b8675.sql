-- Fix search_path for nearby_profiles function
DROP FUNCTION IF EXISTS public.nearby_profiles(double precision, double precision, double precision, text[], integer, integer, uuid[]);

CREATE OR REPLACE FUNCTION public.nearby_profiles(
  user_lat double precision,
  user_lon double precision,
  distance_km double precision,
  gender_prefs text[],
  age_min integer,
  age_max integer,
  excluded_ids uuid[]
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  age integer,
  bio text,
  photos text[],
  intro_video_url text,
  location geometry,
  gender text,
  verified boolean,
  distance_meters double precision,
  last_active timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    p.location,
    p.gender,
    p.verified,
    ST_Distance(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
    ) as distance_meters,
    p.last_active
  FROM public.profiles p
  WHERE 
    p.gender = ANY(gender_prefs)
    AND p.age BETWEEN age_min AND age_max
    AND p.user_id != ALL(excluded_ids)
    AND p.verified = true
    AND ST_DWithin(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
      distance_km * 1000
    )
  ORDER BY 
    p.verified DESC,
    distance_meters ASC
  LIMIT 50;
END;
$$;

-- Fix search_path for update_verification_status function
DROP FUNCTION IF EXISTS public.update_verification_status(uuid, uuid, text, text);

CREATE OR REPLACE FUNCTION public.update_verification_status(
  p_profile_id uuid,
  p_reviewer_id uuid,
  p_status text,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_profile_name text;
BEGIN
  -- Get user_id and name from profile
  SELECT user_id, name INTO v_user_id, v_profile_name
  FROM public.profiles
  WHERE id = p_profile_id;

  -- Update profile verification status
  UPDATE public.profiles
  SET verified = (p_status = 'approved')
  WHERE id = p_profile_id;

  -- Insert verification review record
  INSERT INTO public.verification_reviews (profile_id, reviewer_id, status, reason)
  VALUES (p_profile_id, p_reviewer_id, p_status, p_reason);

  -- Create notification for user
  IF p_status = 'approved' THEN
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
      v_user_id,
      'verification_approved',
      '✅ Verification Approved!',
      'Your profile has been verified. You now have a verified badge!'
    );
  ELSE
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
      v_user_id,
      'verification_rejected',
      'Verification Not Approved',
      COALESCE(p_reason, 'Your verification video did not meet our requirements. Please try again.')
    );
  END IF;

  RETURN true;
END;
$$;