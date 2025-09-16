// Temporarily disable RLS to test if that's the core issue
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Use service role to disable RLS temporarily
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testWithoutRLS() {
  try {
    console.log('Disabling RLS temporarily...');

    // Disable RLS on encrypted_locations table
    const { error: disableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE encrypted_locations DISABLE ROW LEVEL SECURITY'
    });

    if (disableError) {
      // Try direct SQL execution (since exec_sql might not exist)
      console.log('exec_sql not available, this is expected in Supabase');
      console.log('We need to use a different approach...');

      // Let's just test with service role key (which bypasses RLS)
      console.log('Testing insert with service role (bypasses RLS)...');

      const { data: serviceInsert, error: serviceError } = await supabase
        .from('encrypted_locations')
        .insert({
          sender_id: 'fb5aea38-4530-42d8-9c1f-6851791dcd8b',
          recipient_id: '5a86c18f-f296-4bab-a848-8e5a101b69c5',
          payload: 'service_role_test_' + Date.now()
        })
        .select();

      if (serviceError) {
        console.error('❌ Even service role insert failed:', serviceError.message);
        console.log('This suggests a deeper issue (maybe foreign key constraint)');
      } else {
        console.log('✅ Service role insert succeeded:', serviceInsert);
        console.log('This confirms the issue is specifically with RLS policies');
      }

      return;
    }

    console.log('RLS disabled successfully');

    // Now test normal authenticated insert
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    const anonSupabase = createClient(supabaseUrl, anonKey);

    // Sign in as normal user
    const { data: authData, error: authError } = await anonSupabase.auth.signInWithPassword({
      email: 'dan@dkdev.io',
      password: 'testpass123'
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return;
    }

    console.log('✅ Authenticated as:', authData.user.email);

    // Try insert without RLS
    const { data: noRlsInsert, error: noRlsError } = await anonSupabase
      .from('encrypted_locations')
      .insert({
        sender_id: authData.user.id,
        recipient_id: '5a86c18f-f296-4bab-a848-8e5a101b69c5',
        payload: 'no_rls_test_' + Date.now()
      })
      .select();

    if (noRlsError) {
      console.error('❌ Insert failed even without RLS:', noRlsError.message);
    } else {
      console.log('✅ Insert succeeded without RLS:', noRlsInsert);
      console.log('This confirms the issue is with our RLS policy');
    }

    // Re-enable RLS
    console.log('Re-enabling RLS...');
    const { error: enableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE encrypted_locations ENABLE ROW LEVEL SECURITY'
    });

    if (enableError) {
      console.log('Note: Could not re-enable RLS via script (expected)');
    } else {
      console.log('✅ RLS re-enabled');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWithoutRLS();