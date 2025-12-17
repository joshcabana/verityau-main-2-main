-- Fix function search path security warning
CREATE OR REPLACE FUNCTION public.nearby_profiles(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  distance_km INTEGER,
  gender_prefs TEXT[],
  age_min INTEGER,
  age_max INTEGER,
  excluded_ids UUID[]
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  age INTEGER,
  bio TEXT,
  photos TEXT[],
  intro_video_url TEXT,
  location GEOMETRY,
  gender TEXT,
  distance_meters DOUBLE PRECISION
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
    ST_Distance(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
    ) as distance_meters
  FROM public.profiles p
  WHERE p.verified = true
    AND p.user_id != ALL(excluded_ids)
    AND p.age >= age_min
    AND p.age <= age_max
    AND (
      array_length(gender_prefs, 1) IS NULL 
      OR 'everyone' = ANY(gender_prefs)
      OR p.gender = ANY(gender_prefs)
    )
    AND ST_DWithin(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
      distance_km * 1000
    )
  ORDER BY p.last_active DESC NULLS LAST
  LIMIT 50;
END;
$$;