-- Fix faculty_id column type to ensure it's TEXT, not UUID
-- This addresses the "invalid input syntax for type uuid" error

-- STEP 1: First, drop the foreign key constraint that's causing the issue
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_faculty_id_fkey;

-- STEP 2: Drop any other potential foreign key constraints on faculty_id
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN 
    -- Find and drop any foreign key constraints on faculty_id
    FOR constraint_name IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'profiles' 
        AND kcu.column_name = 'faculty_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped foreign key constraint: %', constraint_name;
    END LOOP;
END $$;

-- STEP 3: Now safely change the column type to TEXT
DO $$ 
BEGIN 
    -- Check if faculty_id column exists and change its type
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'faculty_id'
    ) THEN
        -- Change faculty_id to text type
        ALTER TABLE profiles ALTER COLUMN faculty_id TYPE TEXT USING faculty_id::TEXT;
        RAISE NOTICE 'Changed faculty_id column type to TEXT';
    ELSE
        RAISE NOTICE 'faculty_id column does not exist';
    END IF;
END $$;

-- STEP 4: Ensure faculty_id is nullable and has proper defaults
ALTER TABLE profiles ALTER COLUMN faculty_id DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN faculty_id SET DEFAULT NULL;

-- STEP 5: Remove the UNIQUE constraint if it exists (since faculty IDs might not be unique across institutions)
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN 
    -- Find and drop any unique constraints on faculty_id
    FOR constraint_name IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'profiles' 
        AND kcu.column_name = 'faculty_id'
        AND tc.constraint_type = 'UNIQUE'
    LOOP
        EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped unique constraint: %', constraint_name;
    END LOOP;
END $$;

-- STEP 6: Add a comment to document the field
COMMENT ON COLUMN profiles.faculty_id IS 'Faculty identification number or code (text format, not UUID)';