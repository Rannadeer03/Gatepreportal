-- Add storage policies for academic_test_images bucket
DO $$ BEGIN
    CREATE POLICY "Public Access Academic Test Images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'academic_test_images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Teachers can upload academic test images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'academic_test_images' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Teachers can update academic test images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'academic_test_images' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Teachers can delete academic test images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'academic_test_images' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$; 