-- Fix system_logs RLS policies to allow logging
-- This addresses the "new row violates row-level security policy" error

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own logs" ON system_logs;
DROP POLICY IF EXISTS "Super admins can read all logs" ON system_logs;
DROP POLICY IF EXISTS "Users can read their own logs" ON system_logs;

-- Allow authenticated users to insert their own logs
CREATE POLICY "Users can insert their own logs"
  ON system_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    auth.uid() IS NULL  -- Allow logging even without user context
  );

-- Allow users to read their own logs
CREATE POLICY "Users can read their own logs"
  ON system_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow super admins to read all logs
CREATE POLICY "Super admins can read all logs"
  ON system_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Allow service role to do everything (for admin operations)
CREATE POLICY "Service role can manage all logs"
  ON system_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Also allow anonymous logging for error tracking
CREATE POLICY "Allow anonymous error logging"
  ON system_logs
  FOR INSERT
  TO anon
  WITH CHECK (
    action_type IN ('error', 'registration_attempt', 'login_attempt')
  );