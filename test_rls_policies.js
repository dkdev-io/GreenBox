#!/usr/bin/env node

/**
 * Test script to verify RLS policies on encrypted_locations table
 * This ensures User A cannot read User B's incoming messages
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Test user IDs
const userAId = 'fb5aea38-4530-42d8-9c1f-6851791dcd8b';
const userBId = '5a86c18f-f296-4bab-a848-8e5a101b69c5';

async function testRLSPolicies() {
  console.log('🔒 Testing RLS policies for encrypted_locations table\n');

  // Create two client instances for different users
  const supabaseUserA = createClient(supabaseUrl, supabaseAnonKey);
  const supabaseUserB = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Simulate authentication for User A
    await supabaseUserA.auth.setSession({
      access_token: 'fake-jwt-for-user-a',
      refresh_token: 'fake-refresh-token'
    });

    // Simulate authentication for User B
    await supabaseUserB.auth.setSession({
      access_token: 'fake-jwt-for-user-b',
      refresh_token: 'fake-refresh-token'
    });

    console.log('1. Testing INSERT policy - User A sending to User B...');

    // User A sends encrypted location to User B
    const { data: insertData, error: insertError } = await supabaseUserA
      .from('encrypted_locations')
      .insert({
        sender_id: userAId,
        recipient_id: userBId,
        payload: 'encrypted_test_payload_from_A_to_B'
      });

    if (insertError) {
      console.log('❌ INSERT failed (this might be expected):', insertError.message);
    } else {
      console.log('✅ INSERT successful - User A can send to User B');
    }

    console.log('\n2. Testing SELECT policy - User B reading their messages...');

    // User B tries to read messages sent to them
    const { data: userBMessages, error: userBError } = await supabaseUserB
      .from('encrypted_locations')
      .select('*')
      .eq('recipient_id', userBId);

    if (userBError) {
      console.log('❌ User B cannot read their own messages:', userBError.message);
    } else {
      console.log('✅ User B can read messages sent to them:', userBMessages?.length || 0, 'messages');
    }

    console.log('\n3. Testing RLS violation - User A trying to read User B\'s messages...');

    // User A tries to read messages sent to User B (should fail)
    const { data: unauthorizedData, error: unauthorizedError } = await supabaseUserA
      .from('encrypted_locations')
      .select('*')
      .eq('recipient_id', userBId);

    if (unauthorizedError) {
      console.log('✅ RLS working correctly - User A cannot read User B\'s messages:', unauthorizedError.message);
    } else {
      console.log('❌ RLS VIOLATION - User A can read User B\'s messages:', unauthorizedData?.length || 0, 'messages');
    }

    console.log('\n4. Testing cross-user message reading...');

    // User A tries to read ALL messages (should only see their own)
    const { data: allMessages, error: allError } = await supabaseUserA
      .from('encrypted_locations')
      .select('*');

    if (allError) {
      console.log('❌ User A cannot read any messages:', allError.message);
    } else {
      console.log('✅ User A can only see messages sent to them:', allMessages?.length || 0, 'messages');
      if (allMessages && allMessages.length > 0) {
        console.log('   Message recipients:', allMessages.map(m => m.recipient_id));
        const hasOtherUsersMessages = allMessages.some(m => m.recipient_id !== userAId);
        if (hasOtherUsersMessages) {
          console.log('❌ RLS VIOLATION - User A can see other users\' messages!');
        } else {
          console.log('✅ RLS working correctly - User A only sees their own messages');
        }
      }
    }

  } catch (error) {
    console.error('Test error:', error);
  }

  console.log('\n🔒 RLS Policy Test Complete');
}

// Run the test
testRLSPolicies().catch(console.error);