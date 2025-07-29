-- Create academic_video_tutorials table
CREATE TABLE IF NOT EXISTS academic_video_tutorials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    youtube_embed_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER, -- in seconds
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_academic_video_tutorials_teacher_id ON academic_video_tutorials(teacher_id);
CREATE INDEX idx_academic_video_tutorials_subject ON academic_video_tutorials(subject);
CREATE INDEX idx_academic_video_tutorials_created_at ON academic_video_tutorials(created_at);
CREATE INDEX idx_academic_video_tutorials_is_active ON academic_video_tutorials(is_active);

-- Enable Row Level Security
ALTER TABLE academic_video_tutorials ENABLE ROW LEVEL SECURITY;

-- Create policies for academic_video_tutorials table
CREATE POLICY "Teachers can view their own video tutorials"
  ON academic_video_tutorials FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create their own video tutorials"
  ON academic_video_tutorials FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own video tutorials"
  ON academic_video_tutorials FOR UPDATE
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own video tutorials"
  ON academic_video_tutorials FOR DELETE
  USING (teacher_id = auth.uid());

-- Students can view all active video tutorials
CREATE POLICY "Students can view active video tutorials"
  ON academic_video_tutorials FOR SELECT
  USING (is_active = true); 