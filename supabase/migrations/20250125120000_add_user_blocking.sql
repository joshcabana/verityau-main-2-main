-- Create blocked_users table
CREATE TABLE IF NOT EXISTS blocked_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Create indexes for performance
CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON blocked_users(blocked_id);

-- Enable RLS
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own blocks (who they've blocked)
CREATE POLICY "Users can view their own blocks"
  ON blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);

-- Users can block other users
CREATE POLICY "Users can block others"
  ON blocked_users FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

-- Users can unblock users they've blocked
CREATE POLICY "Users can unblock"
  ON blocked_users FOR DELETE
  USING (auth.uid() = blocker_id);

-- Function to check if a user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(user_id uuid, other_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = user_id AND blocked_id = other_user_id)
       OR (blocker_id = other_user_id AND blocked_id = user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON TABLE blocked_users IS 'Stores user blocking relationships. Blocking is mutual - if A blocks B, B cannot see A either.';
COMMENT ON FUNCTION is_user_blocked IS 'Returns true if either user has blocked the other (mutual blocking).';
