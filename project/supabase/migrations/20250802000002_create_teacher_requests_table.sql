-- Create teacher_requests table for super admin teacher management
CREATE TABLE IF NOT EXISTS teacher_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  faculty_id TEXT,
  department TEXT NOT NULL,
  bio TEXT,
  phone_number TEXT,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending_registration' CHECK (status IN ('pending_registration', 'registered', 'activated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teacher_requests_email ON teacher_requests(email);
CREATE INDEX IF NOT EXISTS idx_teacher_requests_created_by ON teacher_requests(created_by);
CREATE INDEX IF NOT EXISTS idx_teacher_requests_status ON teacher_requests(status);

-- Enable RLS
ALTER TABLE teacher_requests ENABLE ROW LEVEL SECURITY;

-- Super admin can manage all teacher requests
CREATE POLICY "Super admin can manage teacher requests"
  ON teacher_requests FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Grant permissions
GRANT ALL ON teacher_requests TO authenticated;