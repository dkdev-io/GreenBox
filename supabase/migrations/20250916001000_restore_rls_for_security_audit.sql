-- Re-enable RLS on encrypted_locations table for security audit
-- This restores the proper security policies that ensure users can only access their own data

-- Re-enable RLS on encrypted_locations table
ALTER TABLE encrypted_locations ENABLE ROW LEVEL SECURITY;

-- Clear the temporary comment
COMMENT ON TABLE encrypted_locations IS NULL;

-- Ensure the correct policies exist (they should still be in place from previous migration)
-- Drop and recreate policies to ensure they are current

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "simple_send_policy" ON encrypted_locations;
DROP POLICY IF EXISTS "simple_receive_policy" ON encrypted_locations;
DROP POLICY IF EXISTS "service_role_access" ON encrypted_locations;

-- Policy 1: Users can only insert with their own sender_id
CREATE POLICY "simple_send_policy" ON encrypted_locations
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Policy 2: Users can only select where they are the recipient
CREATE POLICY "simple_receive_policy" ON encrypted_locations
    FOR SELECT
    USING (auth.uid() = recipient_id);

-- Policy 3: Service role access (for admin operations like purging)
CREATE POLICY "service_role_access" ON encrypted_locations
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);