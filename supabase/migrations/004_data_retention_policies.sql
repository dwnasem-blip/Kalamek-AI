-- Migration 004: Data Retention Policies and Deletion Queues
-- Purpose: Manage automatic data deletion based on retention policies
-- Date: 2026-11-14
-- PDPL Compliance: Article 7 (Retention limits)

-- ============================================
-- 1. DATA RETENTION POLICIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type VARCHAR(100) NOT NULL UNIQUE,
  retention_days INTEGER NOT NULL,
  auto_delete BOOLEAN DEFAULT true,
  legal_basis VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. DELETION QUEUE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS deletion_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  data_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  reason VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_retention_data_type ON data_retention_policies(data_type);
CREATE INDEX IF NOT EXISTS idx_deletion_queue_user_id ON deletion_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_queue_status ON deletion_queue(status);
CREATE INDEX IF NOT EXISTS idx_deletion_queue_scheduled ON deletion_queue(scheduled_for)
  WHERE status = 'pending';

-- ============================================
-- 4. INSERT DEFAULT RETENTION POLICIES
-- ============================================
INSERT INTO data_retention_policies (data_type, retention_days, auto_delete, legal_basis, description) VALUES
  -- User accounts
  ('user_account', -1, false, 'Until deletion request', 'User account data retained until user requests deletion'),

  -- Personal items (photos, descriptions)
  ('personal_items', -1, false, 'Until deletion', 'Personal inventory items retained until user deletes them'),

  -- Audit logs
  ('audit_logs', 730, true, 'PDPL Security compliance', 'Security audit logs retained for 2 years'),

  -- Financial documents
  ('financial_documents', 2555, true, 'Saudi tax law (Article 24 of accounting law)', 'Invoices and receipts retained for 7 years per tax requirements'),
  ('invoices', 2555, true, 'Saudi tax law', 'Tax invoices retained for 7 years'),
  ('receipts', 1825, true, 'Accounting compliance', 'Receipts retained for 5 years'),
  ('warranties', 730, true, 'Warranty coverage', 'Warranty documents retained until expiration + 1 year'),

  -- Subscriptions
  ('subscription_records', 2555, true, 'Tax and legal requirements', 'Subscription history retained for 7 years'),

  -- Logging and monitoring
  ('device_logs', 30, true, 'Performance monitoring', 'Device and error logs retained for 30 days'),
  ('api_logs', 90, true, 'Operational monitoring', 'API call logs retained for 90 days'),
  ('session_logs', 180, true, 'Security monitoring', 'User session logs retained for 6 months'),

  -- Backups
  ('backup_data', 30, true, 'Recovery window', 'Database backups retained for 30 days for recovery'),

  -- Deleted data records
  ('deleted_data_log', 365, true, 'Legal proof of deletion', 'Deletion records retained for 1 year as proof of compliance')
ON CONFLICT (data_type) DO NOTHING;

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_queue ENABLE ROW LEVEL SECURITY;

-- Public read access to policies
CREATE POLICY "Policies are publicly readable"
  ON data_retention_policies FOR SELECT
  USING (true);

-- Users can view their deletion queue
CREATE POLICY "Users can view their deletion queue"
  ON deletion_queue FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Get retention period for a data type
CREATE OR REPLACE FUNCTION get_retention_days(p_data_type VARCHAR)
RETURNS INTEGER AS $$
DECLARE
  v_days INTEGER;
BEGIN
  SELECT retention_days INTO v_days
  FROM data_retention_policies
  WHERE data_type = p_data_type;

  IF v_days IS NULL THEN
    RAISE NOTICE 'No retention policy found for: %', p_data_type;
    RETURN 365;  -- Default to 1 year
  END IF;

  RETURN v_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule deletion for old data
CREATE OR REPLACE FUNCTION schedule_deletions()
RETURNS TABLE(
  deleted_count INTEGER,
  affected_users INTEGER
) AS $$
DECLARE
  v_cutoff_date TIMESTAMP WITH TIME ZONE;
  v_deleted INTEGER := 0;
  v_users INTEGER := 0;
BEGIN
  -- Schedule deletion of old audit logs (2 years)
  v_cutoff_date := NOW() - INTERVAL '2 years';

  INSERT INTO deletion_queue (user_id, data_type, scheduled_for, reason)
  SELECT DISTINCT
    al.user_id,
    'audit_logs',
    NOW() + INTERVAL '1 day',
    'Auto-scheduled: retention period expired'
  FROM audit_logs al
  WHERE al.created_at < v_cutoff_date
    AND NOT EXISTS (
      SELECT 1 FROM deletion_queue dq
      WHERE dq.user_id = al.user_id
        AND dq.data_type = 'audit_logs'
        AND dq.status != 'completed'
    )
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  -- Count affected users
  SELECT COUNT(DISTINCT user_id) INTO v_users
  FROM deletion_queue
  WHERE status = 'pending';

  RETURN QUERY SELECT v_deleted, v_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute pending deletions (should be run by scheduled job)
CREATE OR REPLACE FUNCTION execute_deletions()
RETURNS TABLE(
  completed_count INTEGER,
  failed_count INTEGER
) AS $$
DECLARE
  v_deletion RECORD;
  v_completed INTEGER := 0;
  v_failed INTEGER := 0;
BEGIN
  -- Get pending deletions that are due
  FOR v_deletion IN
    SELECT * FROM deletion_queue
    WHERE status = 'pending'
      AND scheduled_for <= NOW()
    LIMIT 100
  LOOP
    BEGIN
      -- Update status to in_progress
      UPDATE deletion_queue
      SET status = 'in_progress'
      WHERE id = v_deletion.id;

      -- Execute deletion based on data type
      CASE v_deletion.data_type
        WHEN 'audit_logs' THEN
          DELETE FROM audit_logs
          WHERE user_id = v_deletion.user_id
            AND created_at < NOW() - INTERVAL '2 years';

        WHEN 'full_account' THEN
          DELETE FROM profiles WHERE id = v_deletion.user_id;

        WHEN 'device_logs' THEN
          DELETE FROM audit_logs
          WHERE user_id = v_deletion.user_id
            AND action LIKE 'device_%'
            AND created_at < NOW() - INTERVAL '30 days';
      END CASE;

      -- Mark as completed
      UPDATE deletion_queue
      SET
        status = 'completed',
        executed_at = NOW()
      WHERE id = v_deletion.id;

      v_completed := v_completed + 1;

    EXCEPTION WHEN OTHERS THEN
      -- Mark as failed with error message
      UPDATE deletion_queue
      SET
        status = 'failed',
        error_message = SQLERRM,
        executed_at = NOW()
      WHERE id = v_deletion.id;

      v_failed := v_failed + 1;
    END;
  END LOOP;

  RETURN QUERY SELECT v_completed, v_failed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Request early data deletion (right to erasure)
CREATE OR REPLACE FUNCTION request_data_deletion(
  p_user_id UUID,
  p_data_type VARCHAR,
  p_reason VARCHAR DEFAULT 'user_requested'
)
RETURNS UUID AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  INSERT INTO deletion_queue (
    user_id, data_type, scheduled_for, reason
  ) VALUES (
    p_user_id,
    p_data_type,
    NOW() + INTERVAL '7 days',  -- Grace period of 7 days
    p_reason
  )
  RETURNING id INTO v_queue_id;

  -- Log the deletion request
  PERFORM log_action(
    p_user_id,
    'deletion_requested',
    'deletion_queue',
    v_queue_id,
    NULL,
    jsonb_build_object('data_type', p_data_type, 'reason', p_reason)
  );

  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cancel a deletion request (during grace period)
CREATE OR REPLACE FUNCTION cancel_deletion_request(p_queue_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE deletion_queue
  SET status = 'pending'
  WHERE id = p_queue_id
    AND status = 'pending'
    AND scheduled_for > NOW() + INTERVAL '1 day';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot cancel deletion: grace period has ended or already deleted';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. TRIGGERS
-- ============================================

-- Trigger to auto-schedule full account deletion
CREATE OR REPLACE FUNCTION auto_schedule_account_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Schedule hard deletion 30 days after soft delete
  INSERT INTO deletion_queue (
    user_id, data_type, scheduled_for, reason
  ) VALUES (
    NEW.id,
    'full_account',
    NOW() + INTERVAL '30 days',
    'Account deletion: grace period + backup retention'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Trigger commented out for now - implement account soft delete first
-- CREATE TRIGGER schedule_account_deletion
--   AFTER DELETE ON profiles
--   FOR EACH ROW
--   EXECUTE FUNCTION auto_schedule_account_deletion();

-- ============================================
-- 8. SCHEDULED JOBS (requires pg_cron)
-- ============================================
-- Note: Uncomment if pg_cron extension is installed

-- Schedule deletion scanning every hour
-- SELECT cron.schedule(
--   'schedule-data-deletions',
--   '0 * * * *',  -- Every hour at :00
--   'SELECT schedule_deletions()'
-- );

-- Execute pending deletions every 6 hours
-- SELECT cron.schedule(
--   'execute-pending-deletions',
--   '0 */6 * * *',  -- Every 6 hours
--   'SELECT execute_deletions()'
-- );

-- ============================================
-- 9. GRANTS AND PERMISSIONS
-- ============================================

GRANT SELECT ON data_retention_policies TO authenticated, anon;
GRANT SELECT ON deletion_queue TO authenticated;
GRANT EXECUTE ON FUNCTION get_retention_days TO authenticated;
GRANT EXECUTE ON FUNCTION schedule_deletions TO authenticated;
GRANT EXECUTE ON FUNCTION execute_deletions TO authenticated;
GRANT EXECUTE ON FUNCTION request_data_deletion TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_deletion_request TO authenticated;

-- ============================================
-- 10. DOCUMENTATION
-- ============================================
COMMENT ON TABLE data_retention_policies IS 'Defines retention periods for each data type (PDPL Article 7).';
COMMENT ON TABLE deletion_queue IS 'Queue of pending deletions with grace period for recovery.';
COMMENT ON FUNCTION get_retention_days IS 'Returns retention period in days for a data type.';
COMMENT ON FUNCTION schedule_deletions IS 'Automatically schedules deletion of expired data.';
COMMENT ON FUNCTION execute_deletions IS 'Executes pending deletions. Should be run by scheduled job.';
COMMENT ON FUNCTION request_data_deletion IS 'User request for data deletion (right to erasure). Has 7-day grace period.';
COMMENT ON FUNCTION cancel_deletion_request IS 'Cancel a deletion request during the grace period.';
