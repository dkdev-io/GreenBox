// Debug what auth context is available during RLS checks
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, anonKey);

async function debugAuthContext() {
  try {
    // Sign in first
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'dan@dkdev.io',
      password: 'testpass123'
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return;
    }

    console.log('✅ Authenticated as:', authData.user.email);
    console.log('Auth user ID:', authData.user.id);

    // Try to execute a simple RLS query that we know should work
    console.log('\n--- Testing RLS context ---');

    // Try to update our own user record (this should work)
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update({ full_name: 'Dan (Updated)' })
      .eq('id', authData.user.id)
      .select();

    if (updateError) {
      console.error('❌ Cannot update own user record (RLS failing):', updateError.message);
    } else {
      console.log('✅ Successfully updated own user record - RLS working for users table');
    }

    // Try to query with a custom function to see auth.uid()
    console.log('\n--- Testing direct auth context ---');

    // Create a simple test: insert into users table (which has working RLS)
    // to see if the auth context is properly established
    try {
      const { data: testInsert, error: testError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          full_name: 'Test Insert',
          public_key: 'test'
        })
        .select();

      if (testError && testError.message.includes('duplicate key')) {
        console.log('✅ Duplicate key error expected - auth context is working');
      } else if (testError) {
        console.error('❌ Unexpected error:', testError.message);
      } else {
        console.log('❌ Insert succeeded when it should have failed');
      }
    } catch (e) {
      console.log('Insert test error (expected):', e.message);
    }

    // Now try the problematic encrypted_locations insert again
    console.log('\n--- Testing encrypted_locations insert ---');

    console.log('Expected to work: sender_id =', authData.user.id);
    console.log('Recipient ID:', '99797256-8dd6-4b9a-b125-0973e1e8d6e4');

    const { data: locationResult, error: locationError } = await supabase
      .from('encrypted_locations')
      .insert({
        sender_id: authData.user.id,
        recipient_id: '99797256-8dd6-4b9a-b125-0973e1e8d6e4',
        payload: 'debug_test_' + Date.now()
      })
      .select();

    if (locationError) {
      console.error('❌ Encrypted locations insert failed:', locationError.message);

      // Let's see if there are any existing policies that might conflict
      console.log('\nLet me try a simple query to see if we can read from the table...');

      const { data: readTest, error: readError } = await supabase
        .from('encrypted_locations')
        .select('*')
        .limit(1);

      if (readError) {
        console.error('❌ Cannot even read from encrypted_locations:', readError.message);
      } else {
        console.log('✅ Can read from encrypted_locations:', readTest?.length || 0, 'records');
      }

    } else {
      console.log('✅ Encrypted locations insert succeeded!', locationResult);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugAuthContext();