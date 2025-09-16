#!/usr/bin/env node

/**
 * Direct database test for RLS policies using service role
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const userAId = 'fb5aea38-4530-42d8-9c1f-6851791dcd8b';
const userBId = '5a86c18f-f296-4bab-a848-8e5a101b69c5';

async function testRLSDirectly() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log('🔒 Testing RLS policies with service role access\n');

  try {
    // First, insert test data as service role (bypasses RLS)
    console.log('1. Inserting test data...');

    const { data: insertData, error: insertError } = await supabase
      .from('encrypted_locations')
      .insert([
        {
          sender_id: userAId,
          recipient_id: userBId,
          payload: 'test_message_from_A_to_B'
        },
        {
          sender_id: userBId,
          recipient_id: userAId,
          payload: 'test_message_from_B_to_A'
        }
      ]);

    if (insertError) {
      console.log('❌ Failed to insert test data:', insertError);
      return;
    }

    console.log('✅ Test data inserted successfully');

    // Check that RLS is enabled
    console.log('\n2. Checking if RLS is enabled...');

    const { data: tableInfo, error: infoError } = await supabase
      .rpc('exec_sql', {
        sql: `SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'encrypted_locations';`
      });

    if (infoError) {
      console.log('❌ Error checking RLS status:', infoError);
    } else {
      console.log('Table info:', tableInfo);
    }

    // Check policies exist
    console.log('\n3. Checking RLS policies...');

    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql: `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE tablename = 'encrypted_locations';`
      });

    if (policiesError) {
      console.log('❌ Error checking policies:', policiesError);
    } else {
      console.log('✅ RLS Policies found:', policies?.length || 0);
      policies?.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd} for ${policy.roles?.join(', ')}`);
      });
    }

    // Test reading all data (service role should see everything)
    console.log('\n4. Reading all encrypted_locations data...');

    const { data: allData, error: readError } = await supabase
      .from('encrypted_locations')
      .select('*');

    if (readError) {
      console.log('❌ Error reading data:', readError);
    } else {
      console.log('✅ Service role can read all data:', allData?.length || 0, 'rows');
      allData?.forEach(row => {
        console.log(`   ${row.sender_id.slice(0, 8)}... → ${row.recipient_id.slice(0, 8)}...`);
      });
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testRLSDirectly().catch(console.error);