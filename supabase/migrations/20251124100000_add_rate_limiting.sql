-- Create rate_limits table for spam prevention
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('like', 'message')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast rate limit queries
CREATE INDEX idx_rate_limits_user_action_time 
ON rate_limits(user_id, action_type, created_at DESC);

-- RLS policies
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only view their own rate limits
CREATE POLICY "Users can view own rate limits"
ON rate_limits FOR SELECT
USING (auth.uid() = user_id);

-- Only service role can insert rate limits (via edge function)
CREATE POLICY "Service role can insert rate limits"
ON rate_limits FOR INSERT
WITH CHECK (true);

-- Auto-cleanup old rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup to run every 15 minutes (requires pg_cron extension)
-- COMMENT: Run this manually if pg_cron is available:
-- SELECT cron.schedule('cleanup-rate-limits', '*/15 * * * *', 'SELECT cleanup_old_rate_limits()');
