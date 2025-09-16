// Script to set up test users in Supabase database
const { createClient } = require('@supabase/supabase-js');
const _sodium = require('libsodium-wrappers');

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Use service role key to bypass RLS for setup
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Known private keys from .env.keys
const USER_A_PRIVATE_KEY = 'x2u1TllcWI_iB34b_9PnRCb5o6TulCH7rmHRjD_dyes';
const USER_B_PRIVATE_KEY = 'J4s8jnIrLM4FpGXutFB7DdErfN7vdZy8DdFaeuWAdKU';

async function setupTestData() {
  try {
    await _sodium.ready;
    const sodium = _sodium;

    console.log('Setting up test data in Supabase...');

    // Generate public keys from private keys
    const userAPrivateKeyBytes = sodium.from_base64(USER_A_PRIVATE_KEY);
    const userAPublicKey = sodium.to_base64(sodium.crypto_scalarmult_base(userAPrivateKeyBytes));

    const userBPrivateKeyBytes = sodium.from_base64(USER_B_PRIVATE_KEY);
    const userBPublicKey = sodium.to_base64(sodium.crypto_scalarmult_base(userBPrivateKeyBytes));

    console.log('Generated public keys:');
    console.log('User A Public Key:', userAPublicKey);
    console.log('User B Public Key:', userBPublicKey);

    // First create auth users
    console.log('Creating auth users first...');

    const authUsers = [
      {
        id: 'fb5aea38-4530-42d8-9c1f-6851791dcd8b',
        email: 'dan@dkdev.io',
        password: 'testpass123',
        user_metadata: {
          full_name: 'Dan (Test User A)'
        }
      },
      {
        id: '5a86c18f-f296-4bab-a848-8e5a101b69c5',
        email: 'test-user-b@dkdev.io',
        password: 'testpass123',
        user_metadata: {
          full_name: 'Test User B'
        }
      }
    ];

    for (const authUser of authUsers) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        user_id: authUser.id, // Specify the exact ID we want
        email: authUser.email,
        password: authUser.password,
        user_metadata: authUser.user_metadata,
        email_confirm: true
      });

      if (authError && authError.message !== 'A user with this email address has already been registered') {
        console.error(`❌ Failed to create auth user ${authUser.email}:`, authError);
        return false;
      } else {
        console.log(`✅ Auth user created/verified: ${authUser.email}`);
      }
    }

    // Now create database users (which reference auth.users)
    const users = [
      {
        id: 'fb5aea38-4530-42d8-9c1f-6851791dcd8b',
        created_at: new Date().toISOString(),
        full_name: 'Dan (Test User A)',
        avatar_url: null,
        public_key: userAPublicKey
      },
      {
        id: '5a86c18f-f296-4bab-a848-8e5a101b69c5',
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
      user_id_1: 'fb5aea38-4530-42d8-9c1f-6851791dcd8b',
      user_id_2: '5a86c18f-f296-4bab-a848-8e5a101b69c5',
      status: 'active',
      requested_by: 'fb5aea38-4530-42d8-9c1f-6851791dcd8b'
    };

    const { data: friendshipData, error: friendshipError } = await supabase
      .from('friendships')
      .upsert(friendship)
      .select();

    if (friendshipError && friendshipError.code !== '23505') {
      // Ignore duplicate key errors (friendship already exists)
      console.error('❌ Failed to create friendship:', friendshipError);
      return false;
    }

    console.log('✅ Friendship verified/created successfully');

    return true;

  } catch (error) {
    console.error('❌ Setup failed:', error);
    return false;
  }
}

// Run setup
setupTestData().then(success => {
  if (success) {
    console.log('\n🎉 Test data setup completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Use the app with either test user');
    console.log('2. Test the end-to-end location sharing flow');
    console.log('3. View data at http://127.0.0.1:54323 (Supabase Studio)');
  } else {
    console.log('\n💥 Test data setup failed!');
  }
  process.exit(success ? 0 : 1);
});