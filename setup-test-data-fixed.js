// Fixed script that uses actual auth user IDs
const { createClient } = require('@supabase/supabase-js');
const _sodium = require('libsodium-wrappers');

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Known private keys from .env.keys - we'll need to update these to match actual users
const USER_A_PRIVATE_KEY = 'x2u1TllcWI_iB34b_9PnRCb5o6TulCH7rmHRjD_dyes';
const USER_B_PRIVATE_KEY = 'J4s8jnIrLM4FpGXutFB7DdErfN7vdZy8DdFaeuWAdKU';

async function setupTestDataFixed() {
  try {
    await _sodium.ready;
    const sodium = _sodium;

    console.log('Setting up test data with actual auth user IDs...');

    // First, get the existing auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Failed to list auth users:', authError);
      return false;
    }

    console.log('Found auth users:', authUsers.users.length);

    // Find our users by email
    const userA = authUsers.users.find(u => u.email === 'dan@dkdev.io');
    const userB = authUsers.users.find(u => u.email === 'test-user-b@dkdev.io');

    if (!userA || !userB) {
      console.error('❌ Required auth users not found');
      console.log('Available users:', authUsers.users.map(u => u.email));
      return false;
    }

    console.log('User A ID:', userA.id);
    console.log('User B ID:', userB.id);

    // Generate public keys from private keys
    const userAPrivateKeyBytes = sodium.from_base64(USER_A_PRIVATE_KEY);
    const userAPublicKey = sodium.to_base64(sodium.crypto_scalarmult_base(userAPrivateKeyBytes));

    const userBPrivateKeyBytes = sodium.from_base64(USER_B_PRIVATE_KEY);
    const userBPublicKey = sodium.to_base64(sodium.crypto_scalarmult_base(userBPrivateKeyBytes));

    console.log('Generated public keys:');
    console.log('User A Public Key:', userAPublicKey);
    console.log('User B Public Key:', userBPublicKey);

    // Create database users with actual auth IDs
    const users = [
      {
        id: userA.id, // Use actual auth user ID
        created_at: new Date().toISOString(),
        full_name: 'Dan (Test User A)',
        avatar_url: null,
        public_key: userAPublicKey
      },
      {
        id: userB.id, // Use actual auth user ID
        created_at: new Date().toISOString(),
        full_name: 'Test User B',
        avatar_url: null,
        public_key: userBPublicKey
      }
    ];

    // Insert users (using service role to bypass RLS)
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .upsert(users)
      .select();

    if (usersError) {
      console.error('❌ Failed to create users:', usersError);
      return false;
    }

    console.log('✅ Users created successfully:', usersData);

    // Create friendship between User A and User B
    const friendship = {
      user_id_1: userA.id,
      user_id_2: userB.id,
      status: 'active',
      requested_by: userA.id
    };

    const { data: friendshipData, error: friendshipError } = await supabase
      .from('friendships')
      .upsert(friendship)
      .select();

    if (friendshipError && friendshipError.code !== '23505') {
      console.error('❌ Failed to create friendship:', friendshipError);
      return false;
    }

    console.log('✅ Friendship verified/created successfully');

    // Update our app configuration with actual IDs
    console.log('\n🔑 IMPORTANT: Update these IDs in your app:');
    console.log(`USER_A_ID=${userA.id}`);
    console.log(`USER_B_ID=${userB.id}`);
    console.log('\nUpdate the TEST_USERS object in src/services/supabase.js with these IDs');

    return true;

  } catch (error) {
    console.error('❌ Setup failed:', error);
    return false;
  }
}

setupTestDataFixed().then(success => {
  if (success) {
    console.log('\n🎉 Test data setup completed successfully!');
  } else {
    console.log('\n💥 Test data setup failed!');
  }
  process.exit(success ? 0 : 1);
});