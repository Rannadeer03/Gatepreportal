-- Add avatar_url column to profiles table for storing profile photo URL
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT; 