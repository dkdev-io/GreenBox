-- Simplify RLS policies for encrypted_locations table to get them working

-- Drop all existing policies
DROP POLICY IF EXISTS "authenticated_users_can_send_locations" ON encrypted_locations;
DROP POLICY IF EXISTS "authenticated_users_can_receive_locations" ON encrypted_locations;
DROP POLICY IF EXISTS "service_role_full_access" ON encrypted_locations;

-- Create much simpler policies to test
-- Policy 1: Simple sender check
CREATE POLICY "simple_send_policy" ON encrypted_locations
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Policy 2: Simple recipient check
CREATE POLICY "simple_receive_policy" ON encrypted_locations
    FOR SELECT
    USING (auth.uid() = recipient_id);

-- Policy 3: Service role access (for admin operations)
CREATE POLICY "service_role_access" ON encrypted_locations
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);