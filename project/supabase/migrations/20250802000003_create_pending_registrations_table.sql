-- Create pending_registrations table for handling rate-limited registrations
CREATE TABLE IF NOT EXISTS pending_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    registration_number TEXT,
    department TEXT,
    password_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'rate_limited',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON pending_registrations(status);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_created_at ON pending_registrations(created_at);

-- Enable RLS
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for pending_registrations
-- Super admins can view and manage all pending registrations
CREATE POLICY "Super admins can view all pending registrations" ON pending_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can insert pending registrations" ON pending_registrations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can update pending registrations" ON pending_registrations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- Allow public insert for rate-limited registrations (no auth required)
CREATE POLICY "Allow public insert for rate limited registrations" ON pending_registrations
    FOR INSERT WITH CHECK (status = 'rate_limited');

-- Add comment
COMMENT ON TABLE pending_registrations IS 'Stores registration attempts that failed due to rate limiting or other temporary issues';