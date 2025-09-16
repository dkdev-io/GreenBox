// Reset passwords for test users
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function resetPasswords() {
  try {
    console.log('Resetting passwords for test users...');

    // Reset password for User A
    const { data: userA, error: errorA } = await supabase.auth.admin.updateUserById(
      'fb5aea38-4530-42d8-9c1f-6851791dcd8b',
      {
        password: 'testpass123'
      }
    );

    if (errorA) {
      console.error('❌ Failed to reset User A password:', errorA);
    } else {
      console.log('✅ Reset password for dan@dkdev.io');
    }

    // Reset password for User B
    const { data: userB, error: errorB } = await supabase.auth.admin.updateUserById(
      '5a86c18f-f296-4bab-a848-8e5a101b69c5',
      {
        password: 'testpass123'
      }
    );

    if (errorB) {
      console.error('❌ Failed to reset User B password:', errorB);
    } else {
      console.log('✅ Reset password for test-user-b@dkdev.io');
    }

    console.log('\nTest credentials:');
    console.log('Email: dan@dkdev.io');
    console.log('Password: testpass123');
    console.log('');
    console.log('Email: test-user-b@dkdev.io');
    console.log('Password: testpass123');

  } catch (error) {
    console.error('❌ Password reset failed:', error);
  }
}

resetPasswords();