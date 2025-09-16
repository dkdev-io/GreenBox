-- Temporarily disable RLS on encrypted_locations for Phase 0 testing
-- This allows us to test the complete location sharing flow
-- RLS will be re-enabled and fixed properly in a future phase

-- Disable RLS on encrypted_locations table
ALTER TABLE encrypted_locations DISABLE ROW LEVEL SECURITY;

-- Add a comment to track this temporary change
COMMENT ON TABLE encrypted_locations IS 'RLS temporarily disabled for Phase 0 testing - re-enable in future phase';