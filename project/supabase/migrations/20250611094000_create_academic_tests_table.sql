-- Create academic_tests table
CREATE TABLE IF NOT EXISTS academic_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    duration INTEGER NOT NULL,
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    is_scheduled BOOLEAN DEFAULT false,
    scheduled_date DATE,
    scheduled_time TIME,
    time_limit INTEGER,
    allow_late_submissions BOOLEAN DEFAULT false,
    access_window_start TIMESTAMP WITH TIME ZONE,
    access_window_end TIMESTAMP WITH TIME ZONE,
    easy_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    hard_count INTEGER DEFAULT 0,
    target_easy FLOAT DEFAULT 0.0,
    target_medium FLOAT DEFAULT 0.0,
    target_hard FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE academic_tests ENABLE ROW LEVEL SECURITY;

-- Create policies for academic_tests table
CREATE POLICY "Teachers can view their own academic tests"
    ON academic_tests FOR SELECT
    USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create academic tests"
    ON academic_tests FOR INSERT
    WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own academic tests"
    ON academic_tests FOR UPDATE
    USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own academic tests"
    ON academic_tests FOR DELETE
    USING (auth.uid() = teacher_id); 