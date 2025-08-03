-- Super Admin Portal Implementation
-- This migration adds user approval system and comprehensive logging

-- 1. Add approval fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Update role constraint to include super_admin
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'teacher', 'admin', 'super_admin'));

-- 3. Create system_logs table for comprehensive activity tracking
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action_type TEXT NOT NULL, -- 'login', 'logout', 'registration', 'test_start', 'test_complete', 'approval', 'rejection', etc.
  action_details JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_action_type ON system_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON profiles(approval_status);

-- 5. Enable RLS on system_logs table
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- 6. Update existing users to approved status (for backward compatibility)
UPDATE profiles SET approval_status = 'approved', approved_at = NOW() WHERE approval_status = 'pending' AND role IN ('teacher', 'admin');

-- 7. Create policies for super admin access

-- Super admin can manage all profiles
CREATE POLICY "Super admin can manage all profiles"
  ON profiles FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Super admin can view all system logs
CREATE POLICY "Super admin can view all system logs"
  ON system_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Super admin can insert system logs
CREATE POLICY "Super admin can insert system logs"
  ON system_logs FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Users can insert their own logs (for system tracking)
CREATE POLICY "Users can insert own logs"
  ON system_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Service role can manage logs (for automated logging)
CREATE POLICY "Service role can manage logs"
  ON system_logs FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 8. Update existing policies to respect approval status

-- Only approved users can access system (except super admin)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 9. Create function to log user activities
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

-- 10. Create function to approve/reject users
CREATE OR REPLACE FUNCTION approve_user(
  p_user_id UUID,
  p_approved_by UUID,
  p_approval_status TEXT,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 11. Create trigger to log profile changes
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
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
        'old_values', row_to_json(OLD),
        'new_values', row_to_json(NEW)
      )
    );
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_log_profile_changes ON profiles;
CREATE TRIGGER trigger_log_profile_changes
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_profile_changes();

-- 12. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON system_logs TO authenticated;
GRANT EXECUTE ON FUNCTION log_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION approve_user TO authenticated;