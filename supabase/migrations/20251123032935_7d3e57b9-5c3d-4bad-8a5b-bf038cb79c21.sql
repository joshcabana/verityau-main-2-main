-- Phase 3: Admin & Verification System

-- Add admin role to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create verification_reviews table to track approval/rejection history
CREATE TABLE IF NOT EXISTS verification_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('approved', 'rejected')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on verification_reviews
ALTER TABLE verification_reviews ENABLE ROW LEVEL SECURITY;

-- Only admins can view verification reviews
CREATE POLICY "Admins can view all verification reviews"
ON verification_reviews FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Only admins can create verification reviews
CREATE POLICY "Admins can create verification reviews"
ON verification_reviews FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(verified);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_verification_reviews_profile_id ON verification_reviews(profile_id);

-- Create function to update verified status with notification
CREATE OR REPLACE FUNCTION update_verification_status(
  p_profile_id UUID,
  p_reviewer_id UUID,
  p_status TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_profile_name TEXT;
BEGIN
  -- Get user_id and name from profile
  SELECT user_id, name INTO v_user_id, v_profile_name
  FROM profiles
  WHERE id = p_profile_id;

  -- Update profile verification status
  UPDATE profiles
  SET verified = (p_status = 'approved'),
      updated_at = now()
  WHERE id = p_profile_id;

  -- Insert verification review record
  INSERT INTO verification_reviews (profile_id, reviewer_id, status, reason)
  VALUES (p_profile_id, p_reviewer_id, p_status, p_reason);

  -- Create notification for user
  IF p_status = 'approved' THEN
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      v_user_id,
      'verification_approved',
      '✅ Verification Approved!',
      'Your profile has been verified. You now have a verified badge!'
    );
  ELSE
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      v_user_id,
      'verification_rejected',
      'Verification Not Approved',
      COALESCE(p_reason, 'Your verification video did not meet our requirements. Please try again.')
    );
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;