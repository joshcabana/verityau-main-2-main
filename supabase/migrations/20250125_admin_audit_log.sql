-- Admin Audit Log Table
-- Tracks all admin actions for security and compliance

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'ban_user', 'resolve_report', 'delete_photo', 'approve_verification', etc
  target_type TEXT, -- 'user', 'report', 'photo', 'match', etc
  target_id UUID, -- ID of the affected resource
  details JSONB, -- Additional context (e.g., ban reason, old/new values)
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Call Errors Table
-- Tracks Daily.co failures for monitoring

CREATE TABLE IF NOT EXISTS video_call_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verity_date_id UUID REFERENCES verity_dates(id) ON DELETE CASCADE,
  error_message TEXT NOT NULL,
  error_code TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX idx_admin_audit_log_target ON admin_audit_log(target_type, target_id);

CREATE INDEX idx_video_call_errors_verity_date ON video_call_errors(verity_date_id);
CREATE INDEX idx_video_call_errors_timestamp ON video_call_errors(timestamp DESC);

-- RLS Policies: Only admins can read audit logs
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_can_read_audit_log" ON admin_audit_log
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS for video call errors: Admins and service role only
ALTER TABLE video_call_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_can_read_video_errors" ON video_call_errors
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Service role can insert errors (automatic logging)
CREATE POLICY "service_can_insert_video_errors" ON video_call_errors
  FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS anyway

-- Grant permissions
GRANT SELECT ON admin_audit_log TO authenticated;
GRANT SELECT, INSERT ON video_call_errors TO authenticated;

-- Comment documentation
COMMENT ON TABLE admin_audit_log IS 'Audit trail of all admin actions for compliance and security monitoring';
COMMENT ON TABLE video_call_errors IS 'Logs Daily.co video call failures for debugging and monitoring';
COMMENT ON COLUMN admin_audit_log.action IS 'Type of admin action performed (e.g., ban_user, resolve_report)';
COMMENT ON COLUMN admin_audit_log.details IS 'JSON object with action-specific context like reason, old values, etc';
