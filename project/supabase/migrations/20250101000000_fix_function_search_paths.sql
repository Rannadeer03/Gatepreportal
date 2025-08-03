-- Fix function search paths for security
-- This migration addresses the "function_search_path_mutable" linter warnings

-- Drop existing functions first
DROP FUNCTION IF EXISTS log_user_activity(UUID, TEXT, JSONB, INET, TEXT, TEXT);
DROP FUNCTION IF EXISTS approve_user(UUID, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS prevent_multiple_test_attempts();
DROP FUNCTION IF EXISTS generate_otp_code();
DROP FUNCTION IF EXISTS create_otp_verification(UUID, TEXT, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS verify_otp_code(UUID, TEXT);
DROP FUNCTION IF EXISTS cleanup_expired_otp_codes();

-- Drop triggers that depend on functions first
DROP TRIGGER IF EXISTS trigger_log_profile_changes ON profiles;
DROP TRIGGER IF EXISTS trigger_prevent_multiple_test_attempts ON test_results;

-- Now drop the functions that had triggers
DROP FUNCTION IF EXISTS log_profile_changes();

-- Fix log_user_activity function
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_action_type TEXT,
  p_action_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO system_logs (user_id, action_type, action_details, ip_address, user_agent, session_id)
  VALUES (p_user_id, p_action_type, p_action_details, p_ip_address, p_user_agent, p_session_id)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Fix approve_user function
CREATE OR REPLACE FUNCTION approve_user(
  p_user_id UUID,
  p_approved_by UUID,
  p_approval_status TEXT,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if approver is super admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_approved_by AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super admin can approve users';
  END IF;

  -- Update user approval status
  UPDATE profiles 
  SET 
    approval_status = p_approval_status,
    approved_by = p_approved_by,
    approved_at = CASE WHEN p_approval_status = 'approved' THEN NOW() ELSE NULL END,
    rejection_reason = p_rejection_reason
  WHERE id = p_user_id;

  -- Log the approval/rejection
  PERFORM log_user_activity(
    p_user_id,
    CASE WHEN p_approval_status = 'approved' THEN 'user_approved' ELSE 'user_rejected' END,
    jsonb_build_object(
      'approved_by', p_approved_by,
      'rejection_reason', p_rejection_reason
    )
  );

  RETURN TRUE;
END;
$$;

-- Fix log_profile_changes function
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log profile creation
  IF TG_OP = 'INSERT' THEN
    PERFORM log_user_activity(
      NEW.id,
      'profile_created',
      jsonb_build_object(
        'role', NEW.role,
        'department', NEW.department,
        'registration_number', NEW.registration_number,
        'faculty_id', NEW.faculty_id
      )
    );
    RETURN NEW;
  END IF;

  -- Log profile updates
  IF TG_OP = 'UPDATE' THEN
    PERFORM log_user_activity(
      NEW.id,
      'profile_updated',
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'old_department', OLD.department,
        'new_department', NEW.department
      )
    );
    RETURN NEW;
  END IF;

  -- Log profile deletion
  IF TG_OP = 'DELETE' THEN
    PERFORM log_user_activity(
      OLD.id,
      'profile_deleted',
      jsonb_build_object(
        'role', OLD.role,
        'department', OLD.department
      )
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- Recreate the trigger for log_profile_changes
CREATE TRIGGER trigger_log_profile_changes
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_profile_changes();

-- Fix prevent_multiple_test_attempts function
CREATE OR REPLACE FUNCTION prevent_multiple_test_attempts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if student has already taken this test
  IF EXISTS (
    SELECT 1 FROM test_results 
    WHERE student_id = NEW.student_id 
    AND test_id = NEW.test_id
  ) THEN
    RAISE EXCEPTION 'Student has already taken this test';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger for prevent_multiple_test_attempts
CREATE TRIGGER trigger_prevent_multiple_test_attempts
  BEFORE INSERT ON test_results
  FOR EACH ROW
  EXECUTE FUNCTION prevent_multiple_test_attempts();

-- Fix generate_otp_code function
CREATE OR REPLACE FUNCTION generate_otp_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Generate a 6-digit OTP code
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

-- Fix create_otp_verification function
CREATE OR REPLACE FUNCTION create_otp_verification(
  p_user_id UUID,
  p_otp_code TEXT,
  p_expires_at TIMESTAMPTZ
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  verification_id UUID;
BEGIN
  INSERT INTO otp_verifications (user_id, otp_code, expires_at)
  VALUES (p_user_id, p_otp_code, p_expires_at)
  RETURNING id INTO verification_id;
  
  RETURN verification_id;
END;
$$;

-- Fix verify_otp_code function
CREATE OR REPLACE FUNCTION verify_otp_code(
  p_user_id UUID,
  p_otp_code TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  verification_exists BOOLEAN;
BEGIN
  -- Check if OTP code exists and is not expired
  SELECT EXISTS (
    SELECT 1 FROM otp_verifications 
    WHERE user_id = p_user_id 
    AND otp_code = p_otp_code 
    AND expires_at > NOW()
    AND used = FALSE
  ) INTO verification_exists;
  
  -- Mark as used if found
  IF verification_exists THEN
    UPDATE otp_verifications 
    SET used = TRUE, used_at = NOW()
    WHERE user_id = p_user_id 
    AND otp_code = p_otp_code 
    AND expires_at > NOW()
    AND used = FALSE;
  END IF;
  
  RETURN verification_exists;
END;
$$;

-- Fix cleanup_expired_otp_codes function
CREATE OR REPLACE FUNCTION cleanup_expired_otp_codes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM otp_verifications 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$; 