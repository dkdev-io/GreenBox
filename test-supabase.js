// Quick test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');

    // Test 1: Check if users table exists and has data
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
      return false;
    }

    console.log('✅ Users table accessible');
    console.log('Users count:', users?.length || 0);
    if (users?.length > 0) {
      console.log('Sample user:', users[0]);
    }

    // Test 2: Check encrypted_locations table
    const { data: locations, error: locationsError } = await supabase
      .from('encrypted_locations')
      .select('*')
      .limit(5);

    if (locationsError) {
      console.error('❌ Encrypted locations table error:', locationsError.message);
      return false;
    }

    console.log('✅ Encrypted_locations table accessible');
    console.log('Locations count:', locations?.length || 0);

    // Test 3: Try to insert a test record
    const testPayload = 'test_encrypted_payload_' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('encrypted_locations')
      .insert({
        sender_id: 'fb5aea38-4530-42d8-9c1f-6851791dcd8b',
        recipient_id: '5a86c18f-f296-4bab-a848-8e5a101b69c5',
        payload: testPayload
      })
      .select();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message);
      return false;
    }

    console.log('✅ Insert test successful');
    console.log('Inserted record:', insertData);

    return true;

  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Supabase connection verified successfully!');
  } else {
    console.log('\n💥 Supabase connection verification failed!');
  }
  process.exit(success ? 0 : 1);
});