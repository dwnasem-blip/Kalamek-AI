-- Migration 003: Consent Records and Management
-- Purpose: Track user consent for data processing
-- Date: 2026-11-14
-- PDPL Compliance: Article 18 (Right to object), Article 6 (Lawful basis)

-- ============================================
-- 1. CONSENT TYPE ENUM
-- ============================================
CREATE TYPE consent_type_enum AS ENUM (
  'service_terms',      -- Using the service (mandatory)
  'data_collection',    -- Collecting personal data (optional)
  'openai_vision',      -- OpenAI Vision API for OCR (optional)
  'analytics',          -- Analytics and statistics (optional)
  'marketing_email',    -- Marketing emails (optional)
  'child_parental'      -- Parental consent for minors (conditional)
);

-- ============================================
-- 2. CONSENT RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type consent_type_enum NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  given_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,  -- NULL = never expires
  revoked_at TIMESTAMP WITH TIME ZONE,  -- NULL = not revoked
  ip_address INET,
  user_agent TEXT,
  version VARCHAR(20) DEFAULT '1.0',    -- Policy version
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_consent_user_id ON consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_type ON consent_records(consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_granted ON consent_records(granted);
CREATE INDEX IF NOT EXISTS idx_consent_active ON consent_records(user_id, consent_type, granted, revoked_at)
  WHERE granted = true AND revoked_at IS NULL;

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- Users can view their own consent records
CREATE POLICY "Users can view their own consents"
  ON consent_records FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own consent records
CREATE POLICY "Users can create their own consent records"
  ON consent_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own consent records (revoke/change)
CREATE POLICY "Users can revoke their own consents"
  ON consent_records FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Check if user has active consent for a specific type
CREATE OR REPLACE FUNCTION has_active_consent(
  p_user_id UUID,
  p_consent_type consent_type_enum
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM consent_records
    WHERE user_id = p_user_id
      AND consent_type = p_consent_type
      AND granted = true
      AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all active consents for a user
CREATE OR REPLACE FUNCTION get_active_consents(p_user_id UUID)
RETURNS TABLE(
  consent_type VARCHAR,
  granted BOOLEAN,
  given_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cr.consent_type::VARCHAR,
    cr.granted,
    cr.given_at,
    cr.expires_at
  FROM consent_records cr
  WHERE cr.user_id = p_user_id
    AND cr.revoked_at IS NULL
    AND (cr.expires_at IS NULL OR cr.expires_at > NOW())
  ORDER BY cr.given_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log consent change (revoke)
CREATE OR REPLACE FUNCTION revoke_consent(
  p_user_id UUID,
  p_consent_type consent_type_enum
)
RETURNS void AS $$
BEGIN
  UPDATE consent_records
  SET revoked_at = NOW()
  WHERE user_id = p_user_id
    AND consent_type = p_consent_type
    AND revoked_at IS NULL;

  -- Log the revocation
  PERFORM log_action(
    p_user_id,
    'consent_revoked',
    'consent_records',
    NULL,
    jsonb_build_object('consent_type', p_consent_type::VARCHAR),
    NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log consent grant
CREATE OR REPLACE FUNCTION grant_consent(
  p_user_id UUID,
  p_consent_type consent_type_enum,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_consent_id UUID;
BEGIN
  INSERT INTO consent_records (
    user_id, consent_type, granted, ip_address, user_agent
  ) VALUES (
    p_user_id, p_consent_type, true, p_ip_address, p_user_agent
  )
  RETURNING id INTO v_consent_id;

  -- Log the grant
  PERFORM log_action(
    p_user_id,
    'consent_granted',
    'consent_records',
    v_consent_id,
    NULL,
    jsonb_build_object(
      'consent_type', p_consent_type::VARCHAR,
      'granted', true
    )
  );

  RETURN v_consent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. TRIGGERS
-- ============================================

-- Function to validate consent logic
CREATE OR REPLACE FUNCTION validate_consent_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- service_terms cannot be revoked (mandatory)
  IF NEW.consent_type = 'service_terms'::consent_type_enum
     AND NEW.granted = false THEN
    RAISE EXCEPTION 'Service terms consent is mandatory and cannot be revoked';
  END IF;

  -- If revoking, set revoked_at
  IF OLD.revoked_at IS NULL AND NEW.revoked_at IS NOT NULL THEN
    NEW.granted := false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consent_validation
  BEFORE INSERT OR UPDATE ON consent_records
  FOR EACH ROW
  EXECUTE FUNCTION validate_consent_changes();

-- ============================================
-- 7. INITIAL CONSENT SETUP
-- ============================================

-- Trigger to auto-grant mandatory consents on user creation
CREATE OR REPLACE FUNCTION setup_mandatory_consents()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-grant service_terms consent
  INSERT INTO consent_records (
    user_id, consent_type, granted, version
  ) VALUES (
    NEW.id, 'service_terms'::consent_type_enum, true, '1.0'
  );

  -- Create records for other consent types (not granted yet)
  INSERT INTO consent_records (
    user_id, consent_type, granted, version
  ) VALUES
    (NEW.id, 'data_collection'::consent_type_enum, false, '1.0'),
    (NEW.id, 'openai_vision'::consent_type_enum, false, '1.0'),
    (NEW.id, 'analytics'::consent_type_enum, false, '1.0'),
    (NEW.id, 'marketing_email'::consent_type_enum, false, '1.0');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_consents
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION setup_mandatory_consents();

-- ============================================
-- 8. GRANTS AND PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION has_active_consent TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_active_consents TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_consent TO authenticated;
GRANT EXECUTE ON FUNCTION grant_consent TO authenticated;
GRANT SELECT ON consent_records TO authenticated;
GRANT INSERT ON consent_records TO authenticated;
GRANT UPDATE ON consent_records TO authenticated;

-- ============================================
-- 9. DOCUMENTATION
-- ============================================
COMMENT ON TABLE consent_records IS 'User consent records (PDPL Article 18). Tracks all consent grants and revocations.';
COMMENT ON TYPE consent_type_enum IS 'Types of consent: service_terms (mandatory), data_collection, openai_vision, analytics, marketing_email, child_parental.';
COMMENT ON FUNCTION has_active_consent IS 'Check if user has granted and active consent for a specific type.';
COMMENT ON FUNCTION get_active_consents IS 'Get all active consents for a user.';
COMMENT ON FUNCTION grant_consent IS 'Record a consent grant with IP and user agent for audit trail.';
COMMENT ON FUNCTION revoke_consent IS 'Revoke a consent and create audit log.';
