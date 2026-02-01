-- Create video_progress table to track student video completions
CREATE TABLE IF NOT EXISTS video_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES academic_video_tutorials(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    watch_time INTEGER DEFAULT 0, -- in seconds
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, video_id)
);

-- Create indexes for better performance
CREATE INDEX idx_video_progress_student_id ON video_progress(student_id);
CREATE INDEX idx_video_progress_video_id ON video_progress(video_id);
CREATE INDEX idx_video_progress_completed ON video_progress(completed);
CREATE INDEX idx_video_progress_completed_at ON video_progress(completed_at);

-- Enable Row Level Security
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for video_progress table
CREATE POLICY "Students can view their own video progress"
  ON video_progress FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can create their own video progress"
  ON video_progress FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own video progress"
  ON video_progress FOR UPDATE
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can delete their own video progress"
  ON video_progress FOR DELETE
  USING (student_id = auth.uid());

-- Teachers can view progress for their videos
CREATE POLICY "Teachers can view progress for their videos"
  ON video_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM academic_video_tutorials
      WHERE academic_video_tutorials.id = video_progress.video_id
      AND academic_video_tutorials.teacher_id = auth.uid()
    )
  );
