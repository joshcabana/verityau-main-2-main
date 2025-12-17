-- Fix Phase 1: Storage RLS Policies (Drop existing first)
-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('photos', 'photos', true),
  ('intro-videos', 'intro-videos', true),
  ('verification-videos', 'verification-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own verification videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own verification videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own verification videos" ON storage.objects;

-- RLS Policies for photos bucket
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view all photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');

CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policies for intro-videos bucket
CREATE POLICY "Users can upload their own intro videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'intro-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view all intro videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'intro-videos');

CREATE POLICY "Users can update their own intro videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'intro-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own intro videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'intro-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policies for verification-videos bucket (private - admin only)
CREATE POLICY "Users can upload their own verification videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own verification videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own verification videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'verification-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own verification videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);