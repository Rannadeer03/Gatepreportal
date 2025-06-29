-- Migration: Add allow_multiple_attempts to tests table
ALTER TABLE tests ADD COLUMN IF NOT EXISTS allow_multiple_attempts BOOLEAN DEFAULT FALSE;

-- Set all existing tests to not allow multiple attempts by default
UPDATE tests SET allow_multiple_attempts = FALSE WHERE allow_multiple_attempts IS NULL; 