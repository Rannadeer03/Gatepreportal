-- Fix notifications type constraint to ensure it matches the expected values
-- Drop the existing constraint and recreate it
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Recreate the constraint with the correct values
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('assignment', 'test', 'submission', 'grade', 'course_material', 'test_completion', 'general')); 