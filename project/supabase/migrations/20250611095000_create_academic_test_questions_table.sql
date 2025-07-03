-- Create academic_test_questions table
CREATE TABLE IF NOT EXISTS academic_test_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID NOT NULL REFERENCES academic_tests(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(test_id, question_id)
);

-- Enable Row Level Security
ALTER TABLE academic_test_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for academic_test_questions table
CREATE POLICY "Anyone can view academic test questions"
    ON academic_test_questions FOR SELECT
    USING (true);

CREATE POLICY "Teachers can manage academic test questions"
    ON academic_test_questions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM academic_tests
        WHERE academic_tests.id = academic_test_questions.test_id
        AND academic_tests.teacher_id = auth.uid()
    )); 