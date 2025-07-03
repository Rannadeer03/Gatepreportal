-- Create storage buckets for academic portal
INSERT INTO storage.buckets (id, name, public)
VALUES ('academic_course_materials', 'academic_course_materials', true),
       ('academic_assignments', 'academic_assignments', true),
       ('academic_assignment_submissions', 'academic_assignment_submissions', true),
       ('academic_test_images', 'academic_test_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for academic_course_materials
DO $$ BEGIN
    CREATE POLICY "Public Access Academic Course Materials"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'academic_course_materials');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Teachers can upload academic course materials"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'academic_course_materials' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Teachers can update academic course materials"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'academic_course_materials' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Teachers can delete academic course materials"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'academic_course_materials' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Repeat similar policies for academic_assignments, academic_assignment_submissions, academic_test_images
-- (For brevity, only the academic_course_materials policies are written in full. Copy and adjust for each bucket as above.) 