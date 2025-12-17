-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name text,
  age int,
  gender text,
  looking_for text[],
  location geography(Point, 4326),
  bio text,
  intro_video_url text,
  verification_video_url text,
  photos text[],
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view verified profiles
CREATE POLICY "Users can view verified profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (verified = true OR auth.uid() = user_id);

-- Users can manage their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create preferences table
CREATE TABLE public.preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  age_range int4range,
  distance_km int DEFAULT 100,
  gender_prefs text[],
  serious_only boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
ON public.preferences
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create likes table
CREATE TABLE public.likes (
  from_user uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  to_user uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (from_user, to_user)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view likes they sent"
ON public.likes
FOR SELECT
TO authenticated
USING (auth.uid() = from_user);

CREATE POLICY "Users can create likes"
ON public.likes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = from_user);

CREATE POLICY "Users can delete their own likes"
ON public.likes
FOR DELETE
TO authenticated
USING (auth.uid() = from_user);

-- Create matches table
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1 uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2 uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  both_interested boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user1, user2)
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own matches"
ON public.matches
FOR SELECT
TO authenticated
USING (auth.uid() = user1 OR auth.uid() = user2);

CREATE POLICY "Users can create matches"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user1 OR auth.uid() = user2);

CREATE POLICY "Users can update their matches"
ON public.matches
FOR UPDATE
TO authenticated
USING (auth.uid() = user1 OR auth.uid() = user2);

-- Create verity_dates table
CREATE TABLE public.verity_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  room_url text,
  scheduled_at timestamptz,
  completed boolean DEFAULT false,
  user1_feedback text,
  user2_feedback text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.verity_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verity dates"
ON public.verity_dates
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = verity_dates.match_id
    AND (matches.user1 = auth.uid() OR matches.user2 = auth.uid())
  )
);

CREATE POLICY "Users can update their own verity date feedback"
ON public.verity_dates
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = verity_dates.match_id
    AND (matches.user1 = auth.uid() OR matches.user2 = auth.uid())
  )
);

CREATE POLICY "Users can create verity dates for their matches"
ON public.verity_dates
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = verity_dates.match_id
    AND (matches.user1 = auth.uid() OR matches.user2 = auth.uid())
  )
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('intro-videos', 'intro-videos', false),
  ('verification-videos', 'verification-videos', false),
  ('photos', 'photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for intro-videos
CREATE POLICY "Users can upload their own intro videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'intro-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Verified users can view intro videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'intro-videos'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.verified = true
    )
  )
);

CREATE POLICY "Users can update their own intro videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'intro-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own intro videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'intro-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage RLS policies for verification-videos (only owner can access)
CREATE POLICY "Users can upload their own verification videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own verification videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own verification videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'verification-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own verification videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage RLS policies for photos
CREATE POLICY "Users can upload their own photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Verified users can view photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'photos'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.verified = true
    )
  )
);

CREATE POLICY "Users can update their own photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable realtime for necessary tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.verity_dates;

-- Create indices for better query performance
CREATE INDEX idx_profiles_verified ON public.profiles(verified);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_likes_to_user ON public.likes(to_user);
CREATE INDEX idx_matches_users ON public.matches(user1, user2);
CREATE INDEX idx_verity_dates_match_id ON public.verity_dates(match_id);