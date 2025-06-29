-- Migration: Fix teacher access to view all assignments and subjects
-- Ensure teachers can view all subjects (needed for assignment review)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON subjects;

CREATE POLICY "Enable read access for authenticated users" ON subjects
    FOR SELECT
    TO authenticated
    USING (true);

-- Ensure teachers can view all assignments (needed for assignment review)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON assignments;

CREATE POLICY "Enable read access for authenticated users" ON assignments
    FOR SELECT
    TO authenticated
    USING (true);

-- Ensure teachers can view all assignment submissions
DROP POLICY IF EXISTS "Teachers can view all submissions" ON assignment_submissions;

CREATE POLICY "Teachers can view all submissions" ON assignment_submissions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'teacher'
        )
    );

-- Ensure teachers can grade all submissions
DROP POLICY IF EXISTS "Teachers can grade submissions" ON assignment_submissions;

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