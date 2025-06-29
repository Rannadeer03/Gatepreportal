-- Migration: Create storage bucket for student assignment uploads
-- Create a dedicated bucket for student assignment submissions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-assignments',
  'student-assignments',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies to avoid conflicts (if they exist)
DROP POLICY IF EXISTS "Students can upload assignments" ON storage.objects;
DROP POLICY IF EXISTS "Students can view their assignments" ON storage.objects;
DROP POLICY IF EXISTS "Students can update their assignments" ON storage.objects;
DROP POLICY IF EXISTS "Students can delete their assignments" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can view student assignments" ON storage.objects;

-- Create policies for student assignment uploads
CREATE POLICY "Students can upload assignments" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'student-assignments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Students can view their assignments" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'student-assignments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Students can update their assignments" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'student-assignments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Students can delete their assignments" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'student-assignments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Teachers can view student assignments" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'student-assignments' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'teacher'
    )
  ); 