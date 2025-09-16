// Test script with proper authentication
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, anonKey);

async function testWithAuthentication() {
  try {
    console.log('Testing authenticated Supabase operations...');

    // Sign in as User A
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'dan@dkdev.io',
      password: 'testpass123'
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return false;
    }

    console.log('✅ Authenticated as:', authData.user.email);

    // Test fetching users (should work for authenticated users)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('❌ Users query failed:', usersError.message);
      return false;
    }

    console.log('✅ Users table accessible');
    console.log('Users found:', users.length);
    users.forEach(user => {
      console.log(`  - ${user.full_name} (${user.id.substring(0, 8)}...)`);
    });

    // Test fetching friend's public key
    const friendId = '5a86c18f-f296-4bab-a848-8e5a101b69c5'; // User B
    const { data: friend, error: friendError } = await supabase
      .from('users')
      .select('public_key, full_name')
      .eq('id', friendId)
      .single();

    if (friendError) {
      console.error('❌ Friend query failed:', friendError.message);
      return false;
    }

    console.log('✅ Friend public key retrieved');
    console.log('Friend:', friend.full_name);
    console.log('Public key:', friend.public_key.substring(0, 20) + '...');

    // Test inserting encrypted location (with proper sender_id)
    const testPayload = 'test_encrypted_payload_' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('encrypted_locations')
      .insert({
        sender_id: authData.user.id, // Use actual authenticated user ID
        recipient_id: friendId,
        payload: testPayload
      })
      .select();

    if (insertError) {
      console.error('❌ Encrypted location insert failed:', insertError.message);
      return false;
    }

    console.log('✅ Encrypted location inserted successfully');
    console.log('Inserted record:', insertData[0]);

    // Test querying encrypted locations as recipient
    // First sign in as User B to test receiving
    await supabase.auth.signOut();

    const { data: userBAuth, error: userBError } = await supabase.auth.signInWithPassword({
      email: 'test-user-b@dkdev.io',
      password: 'testpass123'
    });

    if (userBError) {
      console.error('❌ User B authentication failed:', userBError.message);
      return false;
    }

    console.log('✅ Authenticated as User B:', userBAuth.user.email);

    // Test receiving encrypted locations
    const { data: receivedLocations, error: receiveError } = await supabase
      .from('encrypted_locations')
      .select('*')
      .eq('recipient_id', userBAuth.user.id);

    if (receiveError) {
      console.error('❌ Receive locations failed:', receiveError.message);
      return false;
    }

    console.log('✅ Encrypted locations received');
    console.log('Received count:', receivedLocations.length);

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

testWithAuthentication().then(success => {
  if (success) {
    console.log('\n🎉 Authenticated Supabase operations verified successfully!');
    console.log('The app should now work end-to-end.');
  } else {
    console.log('\n💥 Authenticated test failed!');
  }
  process.exit(success ? 0 : 1);
});