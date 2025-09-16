// Test the complete location sharing flow with RLS disabled
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, anonKey);

async function testCompleteFlow() {
  try {
    console.log('🧪 Testing complete location sharing flow\n');

    // 1. Sign in as User A (Dan)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'dan@dkdev.io',
      password: 'testpass123'
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return;
    }

    console.log('✅ Authenticated as:', authData.user.email);
    console.log('User ID:', authData.user.id);

    // 2. Get friend's public key
    const friendId = '12d8f2cb-cc72-4f8d-a0dc-500d5766bc70'; // User B
    const { data: friendData, error: friendError } = await supabase
      .from('users')
      .select('public_key, full_name')
      .eq('id', friendId)
      .single();

    if (friendError) {
      console.error('❌ Failed to get friend data:', friendError.message);
      return;
    }

    console.log('✅ Got friend data:', friendData.full_name);
    console.log('Friend public key:', friendData.public_key);

    // 3. Test encrypted location insert (should work now with RLS disabled)
    const testLocation = {
      latitude: 37.7749,
      longitude: -122.4194,
      timestamp: Date.now(),
      accuracy: 10
    };

    const encryptedPayload = 'encrypted_' + JSON.stringify(testLocation);

    console.log('\n--- Testing encrypted location insert ---');
    const { data: locationResult, error: locationError } = await supabase
      .from('encrypted_locations')
      .insert({
        sender_id: authData.user.id,
        recipient_id: friendId,
        payload: encryptedPayload
      })
      .select();

    if (locationError) {
      console.error('❌ Location insert failed:', locationError.message);
    } else {
      console.log('✅ Location insert succeeded!');
      console.log('Inserted record:', locationResult[0]);
    }

    // 4. Test reading location as recipient
    console.log('\n--- Testing location retrieval as recipient ---');

    // Sign in as User B
    const { data: userBAuth, error: userBAuthError } = await supabase.auth.signInWithPassword({
      email: 'test-user-b@dkdev.io',
      password: 'testpass123'
    });

    if (userBAuthError) {
      console.error('❌ User B authentication failed:', userBAuthError.message);
    } else {
      console.log('✅ Authenticated as User B:', userBAuth.user.email);

      // Try to read the location
      const { data: receivedLocation, error: readError } = await supabase
        .from('encrypted_locations')
        .select('*')
        .eq('recipient_id', userBAuth.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (readError) {
        console.error('❌ Failed to read location:', readError.message);
      } else if (receivedLocation && receivedLocation.length > 0) {
        console.log('✅ Successfully received location!');
        console.log('Received payload:', receivedLocation[0].payload);
      } else {
        console.log('⚠️ No location found for recipient');
      }
    }

    console.log('\n🎉 COMPLETE FLOW TEST FINISHED!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCompleteFlow();