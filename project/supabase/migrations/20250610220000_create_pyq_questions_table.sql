-- Create pyq_questions table for placement preparation
CREATE TABLE IF NOT EXISTS pyq_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    company_name TEXT NOT NULL,
    position TEXT NOT NULL,
    year INTEGER NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('aptitude', 'technical', 'coding', 'interview', 'other')),
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    question_file_path TEXT,
    question_file_name TEXT,
    answer_file_path TEXT,
    answer_file_name TEXT,
    solution TEXT,
    tags TEXT[],
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_pyq_questions_company_name ON pyq_questions(company_name);
CREATE INDEX idx_pyq_questions_position ON pyq_questions(position);
CREATE INDEX idx_pyq_questions_year ON pyq_questions(year);
CREATE INDEX idx_pyq_questions_question_type ON pyq_questions(question_type);
CREATE INDEX idx_pyq_questions_difficulty_level ON pyq_questions(difficulty_level);
CREATE INDEX idx_pyq_questions_created_by ON pyq_questions(created_by);
CREATE INDEX idx_pyq_questions_is_active ON pyq_questions(is_active);

-- Enable Row Level Security
ALTER TABLE pyq_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for pyq_questions table
CREATE POLICY "Enable read access for authenticated users" ON pyq_questions
    FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "Enable insert for teachers" ON pyq_questions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
        AND created_by = auth.uid()
    );

CREATE POLICY "Enable update for teachers" ON pyq_questions
    FOR UPDATE
    TO authenticated
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

CREATE POLICY "Enable delete for teachers" ON pyq_questions
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pyq_questions_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_pyq_questions_updated_at
    BEFORE UPDATE ON pyq_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_pyq_questions_updated_at();

-- Create storage bucket for PYQ files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pyq-files', 'pyq-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for PYQ files
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'pyq-files');

CREATE POLICY "Authenticated users can upload PYQ files" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'pyq-files'
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );

CREATE POLICY "Teachers can update PYQ files" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'pyq-files'
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );

CREATE POLICY "Teachers can delete PYQ files" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'pyq-files'
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    ); 