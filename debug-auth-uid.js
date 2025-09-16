// Debug what auth.uid() returns
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, anonKey);

async function debugAuthUid() {
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
    console.log('Auth user ID:', authData.user.id);
    console.log('Expected DB user ID: fb5aea38-4530-42d8-9c1f-6851791dcd8b');
    console.log('IDs match:', authData.user.id === 'fb5aea38-4530-42d8-9c1f-6851791dcd8b');

    // Test what auth.uid() returns in a query
    const { data: uidTest, error: uidError } = await supabase
      .rpc('get_auth_uid');

    if (uidError) {
      console.log('UID function not available, that\'s expected');
    } else {
      console.log('auth.uid() returns:', uidTest);
    }

    // Test a query to see if we can insert with matching ID
    console.log('\nTesting RLS policy...');

    const testPayload = 'debug_test_' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('encrypted_locations')
      .insert({
        sender_id: authData.user.id, // Use the actual auth ID
        recipient_id: '5a86c18f-f296-4bab-a848-8e5a101b69c5',
        payload: testPayload
      })
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      console.error('Full error:', insertError);
    } else {
      console.log('✅ Insert successful:', insertData);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugAuthUid();