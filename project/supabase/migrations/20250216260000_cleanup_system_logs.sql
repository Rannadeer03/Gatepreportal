-- Clean up system_logs table if needed
-- This script safely removes orphaned log entries

-- First, let's see what's in the system_logs table
SELECT COUNT(*) as total_logs FROM system_logs;

-- Show logs that reference non-existent profiles
SELECT sl.*, p.email as profile_email 
FROM system_logs sl 
LEFT JOIN profiles p ON sl.user_id = p.id 
WHERE p.id IS NULL;

-- Optionally, clean up orphaned logs (uncomment if needed)
-- DELETE FROM system_logs 
-- WHERE user_id IN (
--     SELECT sl.user_id 
--     FROM system_logs sl 
--     LEFT JOIN profiles p ON sl.user_id = p.id 
--     WHERE p.id IS NULL
-- );

-- Show remaining logs
SELECT COUNT(*) as remaining_logs FROM system_logs; 