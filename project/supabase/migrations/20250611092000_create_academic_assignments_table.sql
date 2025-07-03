-- Create academic_assignments table
CREATE TABLE IF NOT EXISTS academic_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    file_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE academic_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for academic_assignments table
CREATE POLICY "Enable read access for authenticated users" ON academic_assignments
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for teachers" ON academic_assignments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );

CREATE POLICY "Enable update for teachers" ON academic_assignments
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );

CREATE POLICY "Enable delete for teachers" ON academic_assignments
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    ); 