-- Add storage policies for academic_assignment_submissions bucket
DO $$ BEGIN
    CREATE POLICY "Public Access Academic Assignment Submissions"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'academic_assignment_submissions');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Students can upload academic assignment submissions"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'academic_assignment_submissions' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'student'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Students can update their own academic assignment submissions"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'academic_assignment_submissions' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'student'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Students can delete their own academic assignment submissions"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'academic_assignment_submissions' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'student'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$; 