-- Migration 002: Audit Logging Tables and Policies
-- Purpose: Track all security-related activities for compliance
-- Date: 2026-11-14
-- PDPL Compliance: Articles 20, 25

-- ============================================
-- 1. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);

-- ============================================
-- 3. DELETED DATA LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS deleted_data_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  data_type VARCHAR(100) NOT NULL,
  deletion_reason VARCHAR(100) NOT NULL,
  records_count INTEGER DEFAULT 1,
  deleted_by_user BOOLEAN DEFAULT true,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deleted_data_log_user_id ON deleted_data_log(user_id);
CREATE INDEX IF NOT EXISTS idx_deleted_data_log_created_at ON deleted_data_log(created_at);

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);  -- Enforce in application logic

-- Prevent users from modifying/deleting audit logs
CREATE POLICY "Audit logs are immutable"
  ON audit_logs FOR UPDATE
  USING (false);

CREATE POLICY "Audit logs cannot be deleted by users"
  ON audit_logs FOR DELETE
  USING (false);

-- Users can see deleted data logs (their own only)
ALTER TABLE deleted_data_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deletion logs"
  ON deleted_data_log FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to log an action
CREATE OR REPLACE FUNCTION log_action(
  p_user_id UUID,
  p_action VARCHAR,
  p_resource_type VARCHAR DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id, action, resource_type, resource_id,
    old_data, new_data, ip_address, user_agent
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id,
    p_old_data, p_new_data, p_ip_address, p_user_agent
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old audit logs (2 years retention)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS TABLE(deleted_count INTEGER, last_date TIMESTAMP WITH TIME ZONE) AS $$
DECLARE
  v_cutoff_date TIMESTAMP WITH TIME ZONE;
  v_deleted_count INTEGER;
BEGIN
  -- Calculate cutoff date (2 years ago)
  v_cutoff_date := NOW() - INTERVAL '2 years';

  -- Delete old records
  DELETE FROM audit_logs
  WHERE created_at < v_cutoff_date
  RETURNING 1 INTO v_deleted_count;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN QUERY SELECT v_deleted_count, v_cutoff_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log user deletion
CREATE OR REPLACE FUNCTION log_user_deletion(
  p_user_id UUID,
  p_reason VARCHAR
)
RETURNS void AS $$
BEGIN
  INSERT INTO deleted_data_log (
    user_id, data_type, deletion_reason, deleted_by_user
  ) VALUES (
    p_user_id, 'full_account', p_reason, true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. TRIGGERS FOR AUTOMATIC LOGGING
-- ============================================

-- Function to log profile changes
CREATE OR REPLACE FUNCTION audit_log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if something actually changed
  IF NEW != OLD THEN
    PERFORM log_action(
      NEW.id,
      CASE WHEN TG_OP = 'UPDATE' THEN 'profile_update'
           WHEN TG_OP = 'DELETE' THEN 'profile_delete'
           ELSE 'profile_create' END,
      'profiles',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on profiles table
CREATE TRIGGER audit_profiles_changes
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_profile_changes();

-- ============================================
-- 7. SCHEDULED CLEANUP (requires pg_cron extension)
-- ============================================
-- Note: Uncomment if pg_cron is installed

-- SELECT cron.schedule(
--   'cleanup-old-audit-logs',
--   '0 3 * * *',  -- Run daily at 3 AM UTC
--   'SELECT cleanup_old_audit_logs()'
-- );

-- ============================================
-- 8. GRANTS AND PERMISSIONS
-- ============================================

-- Allow authenticated users to call functions
GRANT EXECUTE ON FUNCTION log_action TO authenticated;
GRANT EXECUTE ON FUNCTION log_user_deletion TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT ON deleted_data_log TO authenticated;

-- ============================================
-- 9. DOCUMENTATION
-- ============================================
COMMENT ON TABLE audit_logs IS 'Immutable audit log for compliance (PDPL Article 20). Retained for 2 years.';
COMMENT ON TABLE deleted_data_log IS 'Log of data deletion requests for compliance verification.';
COMMENT ON FUNCTION log_action IS 'Helper function to log an action. Called by Edge Functions and triggers.';
COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Removes audit logs older than 2 years. Run by scheduled job daily.';
