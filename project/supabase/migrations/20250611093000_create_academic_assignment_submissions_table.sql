-- Create academic_assignment_submissions table
CREATE TABLE IF NOT EXISTS academic_assignment_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES academic_assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    grade TEXT,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE academic_assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for academic_assignment_submissions table
CREATE POLICY "Students can view their own submissions" ON academic_assignment_submissions
    FOR SELECT
    TO authenticated
    USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own submissions" ON academic_assignment_submissions
    FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view all submissions" ON academic_assignment_submissions
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM academic_assignments
        WHERE academic_assignments.id = academic_assignment_submissions.assignment_id
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    )); 