-- Migration: Ensure assignment_submissions table exists with correct structure
-- Create the assignment_submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'submitted',
    grade INTEGER CHECK (grade >= 0 AND grade <= 100),
    feedback TEXT,
    graded_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(assignment_id, student_id)
);

-- Enable Row Level Security
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Students can view their own submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Students can submit assignments" ON assignment_submissions;
DROP POLICY IF EXISTS "Students can update their own submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Teachers can view all submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Teachers can grade submissions" ON assignment_submissions;

-- Students can select their own submissions
CREATE POLICY "Students can view their own submissions" ON assignment_submissions
  FOR SELECT
  USING (student_id = auth.uid());

-- Students can insert their own submissions
CREATE POLICY "Students can submit assignments" ON assignment_submissions
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Students can update their own submissions (e.g., resubmit)
CREATE POLICY "Students can update their own submissions" ON assignment_submissions
  FOR UPDATE
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Teachers can view all submissions
CREATE POLICY "Teachers can view all submissions" ON assignment_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'teacher'
    )
  );

-- Teachers can update submissions (grade them)
CREATE POLICY "Teachers can grade submissions" ON assignment_submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'teacher'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'teacher'
    )
  ); 