// Create test user records in the users table with public keys
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createTestUserRecords() {
  try {
    console.log('Creating user records...');

    const users = [
      {
        id: 'c88a3793-ff60-4e00-9610-8ccb9fdcb9d6',
        full_name: 'Dan (Test User A)',
        public_key: 'yz_Zs0NzPXCZk2_D4o2_k0u7L8Y9KF5zF1kL2oGfP8I'
      },
      {
        id: '12d8f2cb-cc72-4f8d-a0dc-500d5766bc70',
        full_name: 'Test User B',
        public_key: 'W9Hg8xKoL3tN5d2Pz7mK9q4uF6bN8vR1sY5eQ3wT7zC'
      }
    ];

    for (const user of users) {
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select();

      if (error) {
        console.error(`❌ Failed to create user record for ${user.full_name}:`, error.message);
      } else {
        console.log(`✅ Created user record for ${user.full_name}`);
      }
    }

    // Create friendship
    const { data: friendshipData, error: friendshipError } = await supabase
      .from('friendships')
      .insert({
        user_id_1: 'c88a3793-ff60-4e00-9610-8ccb9fdcb9d6',
        user_id_2: '12d8f2cb-cc72-4f8d-a0dc-500d5766bc70',
        status: 'active',
        requested_by: 'c88a3793-ff60-4e00-9610-8ccb9fdcb9d6'
      });

    if (friendshipError) {
      console.error('❌ Failed to create friendship:', friendshipError.message);
    } else {
      console.log('✅ Created friendship between users');
    }

    console.log('\n✅ Test data setup complete!');

  } catch (error) {
    console.error('❌ Failed:', error);
  }
}

createTestUserRecords();