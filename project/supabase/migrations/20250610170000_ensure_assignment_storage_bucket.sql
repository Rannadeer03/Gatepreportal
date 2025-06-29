-- Migration: Ensure assignments storage bucket exists with proper configuration
-- Create the assignments storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assignments',
  'assignments',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies to avoid conflicts (if they exist)
DROP POLICY IF EXISTS "Students can upload assignment submissions" ON storage.objects;
DROP POLICY IF EXISTS "Students can view their own submissions" ON storage.objects;
DROP POLICY IF EXISTS "Students can update their own submissions" ON storage.objects;
DROP POLICY IF EXISTS "Students can delete their own submissions" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can view all assignment files" ON storage.objects;

-- Create policies for student submissions
CREATE POLICY "Students can upload assignment submissions" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'assignments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND (storage.foldername(name))[2] = 'submissions'
  );

CREATE POLICY "Students can view their own submissions" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'assignments' 
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR 
      (storage.foldername(name))[2] = 'assignments' -- Allow viewing original assignments
    )
  );

CREATE POLICY "Students can update their own submissions" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'assignments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND (storage.foldername(name))[2] = 'submissions'
  );

CREATE POLICY "Students can delete their own submissions" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'assignments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND (storage.foldername(name))[2] = 'submissions'
  );

CREATE POLICY "Teachers can view all assignment files" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'assignments' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'teacher'
    )
  ); 