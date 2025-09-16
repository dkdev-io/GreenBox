-- Seed file for RLS testing
-- Create test users in auth.users and public.users tables

-- Insert test users into auth.users (required for foreign key constraint)
INSERT INTO auth.users (id, email, encrypted_password)
VALUES
  ('fb5aea38-4530-42d8-9c1f-6851791dcd8b', 'dan@dkdev.io', 'fake_password_hash'),
  ('5a86c18f-f296-4bab-a848-8e5a101b69c5', 'dpeterkelly@gmail.com', 'fake_password_hash')
ON CONFLICT (id) DO NOTHING;

-- Insert test users into public.users
INSERT INTO public.users (id, full_name, public_key)
VALUES
  ('fb5aea38-4530-42d8-9c1f-6851791dcd8b', 'Test User A', 'test_public_key_A'),
  ('5a86c18f-f296-4bab-a848-8e5a101b69c5', 'Test User B', 'test_public_key_B')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  public_key = EXCLUDED.public_key;