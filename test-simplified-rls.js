// Test the simplified RLS policies
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, anonKey);

async function testSimplifiedRLS() {
  try {
    // Sign in as dan@dkdev.io
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'dan@dkdev.io',
      password: 'testpass123'
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return;
    }

    console.log('✅ Authenticated as:', authData.user.email);
    console.log('User ID (auth.uid()):', authData.user.id);

    // Test the simplified insert
    console.log('\n--- Testing simplified RLS policy ---');

    const testPayload = 'simplified_test_' + Date.now();

    const { data: insertResult, error: insertError } = await supabase
      .from('encrypted_locations')
      .insert({
        sender_id: authData.user.id, // Should match auth.uid()
        recipient_id: '8e6b044e-1591-4d9e-a832-35d24b8eeb52', // User B ID
        payload: testPayload
      })
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      console.log('Full error:', insertError);
    } else {
      console.log('✅ Insert succeeded!', insertResult);
      console.log('\n🎉 RLS POLICY IS WORKING!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSimplifiedRLS();