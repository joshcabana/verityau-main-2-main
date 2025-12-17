-- Create messages table for real-time chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages from their matches
CREATE POLICY "Users can view messages from their matches"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = messages.match_id
    AND (matches.user1 = auth.uid() OR matches.user2 = auth.uid())
  )
);

-- Users can send messages to their matches
CREATE POLICY "Users can send messages to their matches"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = messages.match_id
    AND (matches.user1 = auth.uid() OR matches.user2 = auth.uid())
  )
);

-- Users can mark their own messages as read
CREATE POLICY "Users can mark messages as read"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = messages.match_id
    AND (matches.user1 = auth.uid() OR matches.user2 = auth.uid())
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create PostGIS function for distance-based profile filtering
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