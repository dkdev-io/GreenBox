// Final test to isolate the encrypted_locations insert issue
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, anonKey);

async function testFinalInsert() {
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
    console.log('Sender ID (auth.uid()):', authData.user.id);

    // Check that User B exists in users table
    const { data: userB, error: userBError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('id', '99797256-8dd6-4b9a-b125-0973e1e8d6e4')
      .single();

    if (userBError) {
      console.error('❌ User B not found in users table:', userBError.message);
      return;
    }

    console.log('✅ Recipient exists:', userB.full_name);
    console.log('Recipient ID:', userB.id);

    // Test different scenarios to isolate the issue
    console.log('\n--- Testing different insert scenarios ---');

    // Scenario 1: Insert where sender_id = auth.uid() (should work per RLS policy)
    const testPayload1 = 'test_scenario_1_' + Date.now();

    console.log('\nScenario 1: sender_id = auth.uid()');
    const { data: result1, error: error1 } = await supabase
      .from('encrypted_locations')
      .insert({
        sender_id: authData.user.id, // This should match auth.uid()
        recipient_id: '99797256-8dd6-4b9a-b125-0973e1e8d6e4',
        payload: testPayload1
      })
      .select();

    if (error1) {
      console.error('❌ Scenario 1 failed:', error1.message);
      console.log('Full error:', error1);
    } else {
      console.log('✅ Scenario 1 success:', result1);
    }

    // Scenario 2: Check what happens if we try wrong sender_id (should fail)
    console.log('\nScenario 2: sender_id != auth.uid() (should fail)');
    const { data: result2, error: error2 } = await supabase
      .from('encrypted_locations')
      .insert({
        sender_id: '99797256-8dd6-4b9a-b125-0973e1e8d6e4', // Wrong sender
        recipient_id: authData.user.id,
        payload: 'should_fail'
      })
      .select();

    if (error2) {
      console.log('✅ Scenario 2 correctly failed (as expected):', error2.message);
    } else {
      console.error('❌ Scenario 2 should have failed but succeeded:', result2);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFinalInsert();