-- Fix RLS policies for encrypted_locations table
-- The current policy is failing, let's replace it with a working one

-- Drop existing policies
DROP POLICY IF EXISTS "Users can send encrypted locations" ON encrypted_locations;
DROP POLICY IF EXISTS "Users can receive encrypted locations" ON encrypted_locations;

-- Create new policies with explicit checks
-- Policy 1: Users can insert records where they are the sender
CREATE POLICY "authenticated_users_can_send_locations" ON encrypted_locations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND sender_id = auth.uid()
        AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
    );

-- Policy 2: Users can select records where they are the recipient
CREATE POLICY "authenticated_users_can_receive_locations" ON encrypted_locations
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() IS NOT NULL
        AND recipient_id = auth.uid()
        AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
    );

-- Add a policy for service role (for testing and admin operations)
CREATE POLICY "service_role_full_access" ON encrypted_locations
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);