-- Migration: Add grading columns to assignment_submissions table
ALTER TABLE assignment_submissions 
ADD COLUMN IF NOT EXISTS grade INTEGER CHECK (grade >= 0 AND grade <= 100),
ADD COLUMN IF NOT EXISTS feedback TEXT,
ADD COLUMN IF NOT EXISTS graded_at TIMESTAMP WITH TIME ZONE;

-- Add policy for teachers to view all submissions
CREATE POLICY "Teachers can view all submissions" ON assignment_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'teacher'
    )
  );

-- Add policy for teachers to update submissions (grade them)
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