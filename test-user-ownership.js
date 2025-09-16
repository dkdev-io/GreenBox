// Test if authenticated user can access their own user record
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, anonKey);

async function testUserOwnership() {
  try {
    // Sign in as User A
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'dan@dkdev.io',
      password: 'testpass123'
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return;
    }

    console.log('✅ Authenticated as:', authData.user.email);
    console.log('Auth ID:', authData.user.id);

    // Try to update own user record (should work if ownership is correct)
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ full_name: 'Dan (Test User A) - Updated' })
      .eq('id', authData.user.id)
      .select();

    if (updateError) {
      console.error('❌ Cannot update own user record:', updateError.message);
      console.log('This means the auth user doesn\'t properly own the database user record');
    } else {
      console.log('✅ Successfully updated own user record:', updateData);
    }

    // Try to select own user record specifically
    const { data: ownRecord, error: ownError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (ownError) {
      console.error('❌ Cannot read own user record:', ownError.message);
    } else {
      console.log('✅ Can read own user record:', ownRecord);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUserOwnership();