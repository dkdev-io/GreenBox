// Check what auth users exist
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkAuthUsers() {
  try {
    console.log('Checking auth users...');

    const { data: authUsers, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('❌ Failed to list auth users:', error);
      return;
    }

    console.log('✅ Found', authUsers.users.length, 'auth users:');
    authUsers.users.forEach(user => {
      console.log(`  - Email: ${user.email}`);
      console.log(`    ID: ${user.id}`);
      console.log(`    Created: ${user.created_at}`);
      console.log(`    Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log('');
    });

    // Check database users
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*');

    if (dbError) {
      console.error('❌ Failed to query database users:', dbError);
      return;
    }

    console.log('✅ Found', dbUsers.length, 'database users:');
    dbUsers.forEach(user => {
      console.log(`  - Name: ${user.full_name}`);
      console.log(`    ID: ${user.id}`);
      console.log(`    Public key: ${user.public_key?.substring(0, 20)}...`);
      console.log('');
    });

    // Check if auth user IDs match database user IDs
    console.log('Checking ID alignment...');
    const authIds = authUsers.users.map(u => u.id);
    const dbIds = dbUsers.map(u => u.id);

    console.log('Auth IDs:', authIds);
    console.log('DB IDs:', dbIds);

    const matches = authIds.filter(id => dbIds.includes(id));
    console.log('Matching IDs:', matches.length);

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkAuthUsers();