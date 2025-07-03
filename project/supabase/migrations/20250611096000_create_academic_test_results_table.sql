-- Create academic_test_results table
CREATE TABLE IF NOT EXISTS academic_test_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID NOT NULL REFERENCES academic_tests(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    score DECIMAL NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    wrong_answers INTEGER NOT NULL DEFAULT 0,
    unattempted INTEGER NOT NULL DEFAULT 0,
    time_taken INTEGER, -- in minutes
    started_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    answers JSONB, -- Store student's answers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(test_id, student_id)
);

-- Enable Row Level Security
ALTER TABLE academic_test_results ENABLE ROW LEVEL SECURITY;

-- Create policies for academic_test_results table
CREATE POLICY "Students can view their own academic test results"
  ON academic_test_results FOR SELECT
  USING (
    student_id = auth.uid()
  );

CREATE POLICY "Students can create their own academic test results"
  ON academic_test_results FOR INSERT
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM academic_tests
      WHERE academic_tests.id = academic_test_results.test_id
      AND academic_tests.is_active = true
    )
  );

CREATE POLICY "Students can update their own academic test results"
  ON academic_test_results FOR UPDATE
  USING (
    student_id = auth.uid()
  )
  WITH CHECK (
    student_id = auth.uid()
  );

CREATE POLICY "Teachers can view results for their academic tests"
  ON academic_test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM academic_tests
      WHERE academic_tests.id = academic_test_results.test_id
      AND academic_tests.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update results for their academic tests"
  ON academic_test_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM academic_tests
      WHERE academic_tests.id = academic_test_results.test_id
      AND academic_tests.teacher_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_academic_test_results_updated_at()
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
CREATE TRIGGER update_academic_test_results_updated_at
    BEFORE UPDATE ON academic_test_results
    FOR EACH ROW
    EXECUTE FUNCTION update_academic_test_results_updated_at(); 