-- Migration: Create assignment_submissions table for student uploads
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'submitted',
    UNIQUE(assignment_id, student_id)
);

-- Enable Row Level Security
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

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