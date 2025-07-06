-- Add teacher_id column to subjects table
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Update RLS policies for subjects table to include teacher_id
DROP POLICY IF EXISTS "Anyone can read subjects" ON subjects;
DROP POLICY IF EXISTS "Service role can manage subjects" ON subjects;

-- Create new policies that consider teacher_id
CREATE POLICY "Anyone can read subjects"
  ON subjects
  FOR SELECT
  TO authenticated
  USING (true);

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

CREATE POLICY "Service role can manage subjects"
  ON subjects
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true); 