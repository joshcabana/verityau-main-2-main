-- Add advanced profile fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS height_cm INTEGER,
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS values TEXT[];

-- Add advanced preference fields
ALTER TABLE preferences
ADD COLUMN IF NOT EXISTS height_range INTEGER[],
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS values TEXT[];

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC);

-- Enable RLS on analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Analytics policies (users can only insert their own events, admins can read all)
CREATE POLICY "Users can insert their own analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

-- Create connections/friendships table
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1 UUID NOT NULL,
  user2 UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1, user2)
);

CREATE INDEX IF NOT EXISTS idx_connections_user1 ON connections(user1);
CREATE INDEX IF NOT EXISTS idx_connections_user2 ON connections(user2);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);

-- Enable RLS on connections
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Connection policies
CREATE POLICY "Users can view their connections"
  ON connections FOR SELECT
  USING (auth.uid() = user1 OR auth.uid() = user2);

CREATE POLICY "Users can create connections"
  ON connections FOR INSERT
  WITH CHECK (auth.uid() = user1);

CREATE POLICY "Users can update their connections"
  ON connections FOR UPDATE
  USING (auth.uid() = user1 OR auth.uid() = user2);

-- Create A/B testing tables
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  variants JSONB NOT NULL, -- {variant_name: {weight: 0.5, config: {...}}}
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  variant TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ab_assignments_user ON ab_test_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_assignments_test ON ab_test_assignments(test_id);

-- Enable RLS on A/B testing tables
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;

-- A/B test policies
CREATE POLICY "Anyone can view active tests"
  ON ab_tests FOR SELECT
  USING (active = true);

CREATE POLICY "Users can view their assignments"
  ON ab_test_assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their assignments"
  ON ab_test_assignments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add rescheduling fields to verity_dates
ALTER TABLE verity_dates
ADD COLUMN IF NOT EXISTS reschedule_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS user1_status TEXT DEFAULT 'pending', -- pending, accepted, maybe_later, declined
ADD COLUMN IF NOT EXISTS user2_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS user1_preferred_times JSONB,
ADD COLUMN IF NOT EXISTS user2_preferred_times JSONB;

-- Function to find mutual connections
CREATE OR REPLACE FUNCTION get_mutual_connections(
  user_a UUID,
  user_b UUID
)
RETURNS TABLE(mutual_friend_id UUID, mutual_friend_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.user_id, p.name
  FROM connections c1
  JOIN connections c2 ON c1.user2 = c2.user2
  JOIN profiles p ON p.user_id = c1.user2
  WHERE c1.user1 = user_a 
    AND c2.user1 = user_b
    AND c1.status = 'accepted'
    AND c2.status = 'accepted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;