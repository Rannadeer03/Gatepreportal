-- Add storage policies for academic_assignments bucket
DO $$ BEGIN
    CREATE POLICY "Public Access Academic Assignments"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'academic_assignments');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Teachers can upload academic assignments"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'academic_assignments' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Teachers can update academic assignments"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'academic_assignments' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Teachers can delete academic assignments"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'academic_assignments' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$; 