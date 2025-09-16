#!/usr/bin/env node

/**
 * Set up test users in the database for RLS testing
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const userAId = 'fb5aea38-4530-42d8-9c1f-6851791dcd8b';
const userBId = '5a86c18f-f296-4bab-a848-8e5a101b69c5';

async function setupTestUsers() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log('👥 Setting up test users for RLS testing\n');

  try {
    // First create auth users using SQL
    console.log('1. Creating auth.users entries...');

    const { data: authData, error: authError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at, confirmed_at, email_confirmed_at)
        VALUES
          ('${userAId}', 'test-user-a@test.com', 'fake_password_hash', now(), now(), now(), now()),
          ('${userBId}', 'test-user-b@test.com', 'fake_password_hash', now(), now(), now(), now())
        ON CONFLICT (id) DO NOTHING;
      `
    });

    if (authError) {
      console.log('❌ Failed to create auth users:', authError);
      return;
    }

    console.log('✅ Auth users created');

    // Insert test users in public.users
    console.log('\n2. Creating public.users entries...');

    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert([
        {
          id: userAId,
          full_name: 'Test User A',
          public_key: 'test_public_key_A'
        },
        {
          id: userBId,
          full_name: 'Test User B',
          public_key: 'test_public_key_B'
        }
      ]);

    if (userError) {
      console.log('❌ Failed to create test users:', userError);
      return;
    }

    console.log('✅ Test users created successfully');

    // Verify users exist
    console.log('\n2. Verifying users exist...');

    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('*')
      .in('id', [userAId, userBId]);

    if (selectError) {
      console.log('❌ Error verifying users:', selectError);
    } else {
      console.log('✅ Users verified:', users?.length || 0);
      users?.forEach(user => {
        console.log(`   - ${user.full_name} (${user.id.slice(0, 8)}...)`);
      });
    }

    // Test RLS by inserting encrypted location data
    console.log('\n3. Testing encrypted_locations insert...');

    const { data: locationData, error: locationError } = await supabase
      .from('encrypted_locations')
      .insert([
        {
          sender_id: userAId,
          recipient_id: userBId,
          payload: 'encrypted_test_payload_A_to_B'
        },
        {
          sender_id: userBId,
          recipient_id: userAId,
          payload: 'encrypted_test_payload_B_to_A'
        }
      ]);

    if (locationError) {
      console.log('❌ Failed to insert encrypted locations:', locationError);
    } else {
      console.log('✅ Encrypted location data inserted successfully');
    }

    // Check what data exists
    console.log('\n4. Checking encrypted_locations data...');

    const { data: allLocations, error: allError } = await supabase
      .from('encrypted_locations')
      .select('*');

    if (allError) {
      console.log('❌ Error reading encrypted_locations:', allError);
    } else {
      console.log('✅ Total encrypted_locations rows:', allLocations?.length || 0);
      allLocations?.forEach(loc => {
        console.log(`   ${loc.sender_id.slice(0, 8)}... → ${loc.recipient_id.slice(0, 8)}... (${loc.payload.slice(0, 20)}...)`);
      });
    }

  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupTestUsers().catch(console.error);