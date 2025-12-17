-- Update nearby_profiles function to include last_active in return type
DROP FUNCTION IF EXISTS nearby_profiles(float8, float8, float8, text[], int4, int4, uuid[]);

CREATE OR REPLACE FUNCTION nearby_profiles(
  user_lat float8,
  user_lon float8,
  distance_km float8,
  gender_prefs text[],
  age_min int4,
  age_max int4,
  excluded_ids uuid[]
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  age int4,
  bio text,
  photos text[],
  intro_video_url text,
  location geometry,
  gender text,
  verified boolean,
  distance_meters float8,
  last_active timestamptz
) AS $$
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
  FROM profiles p
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
    -- Boost verified profiles
    p.verified DESC,
    -- Then sort by distance
    distance_meters ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;