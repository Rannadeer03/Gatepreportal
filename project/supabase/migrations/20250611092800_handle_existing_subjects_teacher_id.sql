-- Handle existing subjects that don't have teacher_id assigned
-- For now, we'll leave them as NULL so they can be accessed by all teachers
-- This is a temporary solution until we implement proper subject assignment

-- Update the subjects table RLS policy to allow teachers to access subjects without teacher_id
DROP POLICY IF EXISTS "Teachers can manage their subjects" ON subjects;

CREATE POLICY "Teachers can manage their subjects"
  ON subjects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
      AND (subjects.teacher_id IS NULL OR subjects.teacher_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
      AND (subjects.teacher_id IS NULL OR subjects.teacher_id = auth.uid())
    )
  ); 