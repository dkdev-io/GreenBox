-- Create users table
-- Stores public-facing user profile information and the public key required for E2EE
CREATE TABLE users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    full_name text,
    avatar_url text,
    public_key text NOT NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Any authenticated user can read public_key, full_name, avatar_url
CREATE POLICY "Users can view public profile data" ON users
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- A user can only update their own record
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);