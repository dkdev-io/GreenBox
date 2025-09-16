-- Temporarily disable RLS to test if that's the issue
-- Connect as superuser to modify RLS
\connect postgres postgres

-- Check current policies
\d+ encrypted_locations

-- Temporarily disable RLS to test
ALTER TABLE encrypted_locations DISABLE ROW LEVEL SECURITY;

-- Test if this fixes the issue, then we'll re-enable with corrected policies