-- Auto-approve students on registration
-- Students get immediate access, teachers are admin-managed
-- Migration created: 2026-02-07

-- Update existing pending students to approved (auto-approve all pending students)
-- This gives immediate access to students who registered before this change
UPDATE profiles 
SET 
  approval_status = 'approved',
  approved_at = NOW(),
  approved_by = (SELECT id FROM profiles WHERE role = 'super_admin' LIMIT 1)
WHERE 
  role = 'student' 
  AND approval_status = 'pending';

-- Add database comment for clarity on approval logic
COMMENT ON COLUMN profiles.approval_status IS 
  'Approval status: students are auto-approved on registration, teachers/admins require super_admin approval';

-- Add index for better query performance on approval status
CREATE INDEX IF NOT EXISTS idx_profiles_role_approval_status 
ON profiles(role, approval_status)
WHERE approval_status = 'pending';
