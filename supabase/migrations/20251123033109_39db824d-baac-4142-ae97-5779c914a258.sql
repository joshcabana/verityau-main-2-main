-- Drop and recreate nearby_profiles function to include verified field
DROP FUNCTION IF EXISTS nearby_profiles(double precision,double precision,integer,text[],integer,integer,uuid[]);

CREATE FUNCTION nearby_profiles(
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
  verified BOOLEAN,
  distance_meters DOUBLE PRECISION
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
    COALESCE(p.verified, false) as verified,
    ST_Distance(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
    ) as distance_meters
  FROM profiles p
  WHERE 
    p.user_id != ALL(excluded_ids)
    AND p.gender = ANY(gender_prefs)
    AND p.age >= age_min
    AND p.age <= age_max
    AND ST_DWithin(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
      distance_km * 1000
    )
  ORDER BY 
    -- Boost verified profiles to appear first
    p.verified DESC NULLS LAST,
    -- Then sort by distance
    distance_meters ASC;
END;
$$ LANGUAGE plpgsql STABLE;