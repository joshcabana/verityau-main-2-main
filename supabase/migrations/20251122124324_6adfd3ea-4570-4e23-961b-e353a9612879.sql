-- ============================================
-- SECURITY FIX: Storage Bucket Policies
-- ============================================

-- Intro Videos Bucket Policies
CREATE POLICY "Users can upload own intro videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'intro-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own intro videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'intro-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view verified intro videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'intro-videos'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id::text = (storage.foldername(name))[1]
    AND profiles.verified = true
  )
);

CREATE POLICY "Users can update own intro videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'intro-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own intro videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'intro-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Verification Videos Bucket Policies
CREATE POLICY "Users can upload own verification videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own verification videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own verification videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'verification-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own verification videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Photos Bucket Policies
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view verified user photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id::text = (storage.foldername(name))[1]
    AND profiles.verified = true
  )
);

CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- SECURITY FIX: Remove Dangerous Waitlist Policy
-- ============================================

DROP POLICY IF EXISTS "Service role can view waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Anyone can view waitlist" ON public.waitlist;

-- No SELECT policy = only backend/service role can read
-- Keep the INSERT policy for public signups

-- ============================================
-- SECURITY FIX: Database Constraints for Validation
-- ============================================

-- Add constraints to profiles table
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_name_length CHECK (length(name) > 0 AND length(name) <= 100),
ADD CONSTRAINT profiles_age_range CHECK (age >= 18 AND age <= 99),
ADD CONSTRAINT profiles_bio_length CHECK (length(bio) <= 500);

-- Add referral code to waitlist if not exists
ALTER TABLE public.waitlist
ADD COLUMN IF NOT EXISTS referral_code text,
ADD COLUMN IF NOT EXISTS referral_source text;