// Just create auth users and get their IDs
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createAuthUsers() {
  try {
    console.log('Creating auth users...');

    const users = [
      {
        email: 'dan@dkdev.io',
        password: 'testpass123',
        user_metadata: {
          full_name: 'Dan (Test User A)'
        }
      },
      {
        email: 'test-user-b@dkdev.io',
        password: 'testpass123',
        user_metadata: {
          full_name: 'Test User B'
        }
      }
    ];

    for (const user of users) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: user.user_metadata,
        email_confirm: true
      });

      if (authError) {
        console.error(`❌ Failed to create ${user.email}:`, authError.message);
      } else {
        console.log(`✅ Created ${user.email} with ID: ${authData.user.id}`);
      }
    }

    // List all auth users
    const { data: allUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Failed to list users:', listError);
    } else {
      console.log('\nAll auth users:');
      allUsers.users.forEach(u => {
        console.log(`  ${u.email}: ${u.id}`);
      });
    }

  } catch (error) {
    console.error('❌ Failed:', error);
  }
}

createAuthUsers();