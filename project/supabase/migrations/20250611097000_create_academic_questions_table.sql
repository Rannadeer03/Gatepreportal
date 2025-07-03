-- Create academic_questions table for academic portal
CREATE TABLE IF NOT EXISTS academic_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'text', 'image'
    options JSONB NOT NULL, -- array of options
    correct_option TEXT NOT NULL, -- correct answer as text
    difficulty_level TEXT NOT NULL, -- e.g., 'easy', 'medium', 'hard'
    subject_id TEXT NOT NULL, -- subject name or code
    image_url TEXT, -- optional image
    explanation TEXT, -- optional explanation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE academic_questions ENABLE ROW LEVEL SECURITY;

-- Policy: Only teachers can insert/select/update/delete their own questions (if you want to restrict by teacher, add teacher_id and policies)
CREATE POLICY "All users can view academic questions"
    ON academic_questions FOR SELECT
    USING (true);

CREATE POLICY "Authenticated can insert academic questions"
    ON academic_questions FOR INSERT
    WITH CHECK (auth.role() = 'authenticated'); 