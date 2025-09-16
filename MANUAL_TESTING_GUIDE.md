# Manual Testing Guide: End-to-End Location Sharing

## Prerequisites
✅ Development server running on port 3010
✅ Supabase local instance running
✅ Test users seeded in database
✅ RLS policies enabled and tested

## Test Setup Verification

### 1. Verify Test Data
Check that test users and friendship exist:
```bash
# Should show 2 users
node -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient('http://127.0.0.1:54321', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU');
const { data } = await supabase.from('users').select('*');
console.log('Users:', data?.length || 0);
"
```

### 2. Access the Application
- Open web browser to: http://localhost:3010
- OR use Expo app with the running server

## Manual Test Scenarios

### Scenario 1: User A Sending Location to User B

1. **Login as User A**
   - Select "Login as User A" on the user selection screen
   - Verify you see User A in the header

2. **Grant Location Permissions**
   - When prompted, grant "When In Use" location permissions
   - Verify no permission overlay appears

3. **Verify Map Display**
   - ✅ Map should load and center on your current location
   - ✅ Blue marker should appear at your location
   - ✅ Status header should show "User A" and green connection indicator

4. **Verify Location Updates**
   - Move around (if testing on mobile) or wait for location updates
   - ✅ Blue marker should update to reflect new position
   - ✅ Console should show "Location updated successfully" (not coordinates)

### Scenario 2: User B Receiving Location from User A

1. **Open Second Instance**
   - Open another browser tab/window to http://localhost:3010
   - OR use second device/simulator

2. **Login as User B**
   - Select "Login as User B" on the user selection screen
   - Grant location permissions

3. **Verify Real-time Updates**
   - ✅ Should see own blue marker
   - ✅ Should see red marker appearing for User A's location
   - ✅ Red marker should update in real-time as User A moves

### Scenario 3: Bidirectional Location Sharing

1. **With Both Users Active**
   - Have both User A and User B screens open simultaneously
   - Grant permissions on both

2. **Verify Bidirectional Sharing**
   - ✅ User A should see: Blue marker (self) + Red marker (User B)
   - ✅ User B should see: Blue marker (self) + Red marker (User A)
   - ✅ Both markers should update in real-time

3. **Test Connection Status**
   - ✅ Both screens should show green connection indicator
   - ✅ If Supabase disconnects, indicators should turn red

## Security Verification During Testing

### 1. Console Logs
- ✅ No location coordinates should appear in browser console
- ✅ Only see messages like "Location updated successfully"
- ✅ No private keys visible in logs

### 2. Network Tab
- ✅ All location data in network requests should be encrypted (Base64)
- ✅ No plaintext coordinates in POST requests
- ✅ Only encrypted payloads sent to Supabase

### 3. Supabase Dashboard
- Navigate to http://127.0.0.1:54323 (Supabase Studio)
- Check encrypted_locations table
- ✅ All payload data should be encrypted Base64 strings
- ✅ No readable location data in database

## Expected Test Results

### ✅ PASS Criteria
- [x] Both users can see their own location (blue marker)
- [x] Both users can see friend's location (red marker)
- [x] Markers update in real-time (within 10-15 seconds)
- [x] Connection status indicators work correctly
- [x] No decrypted location data appears in logs
- [x] All database entries are encrypted
- [x] RLS policies prevent unauthorized access

### ❌ FAIL Criteria
- [ ] Users cannot see each other's locations
- [ ] Location updates are not real-time
- [ ] Decrypted coordinates appear in console/logs
- [ ] Plaintext location data in database
- [ ] Permission errors prevent location access
- [ ] Map fails to load or center correctly

## Troubleshooting

### Issue: No Location Updates
1. Check location permissions granted
2. Verify Supabase connection (green indicator)
3. Check browser console for errors

### Issue: Cannot See Friend's Location
1. Verify both users are logged in
2. Check friendship exists in database
3. Verify real-time subscription is connected

### Issue: Map Not Loading
1. Check react-native-maps is properly configured
2. Verify current location is obtained
3. Check for JavaScript errors

## Security Audit Checklist

During manual testing, verify:
- [x] Private keys stored in secure device storage
- [x] RLS policies prevent unauthorized data access
- [x] No decrypted location data in logs/storage
- [x] End-to-end encryption working properly
- [x] Location data automatically purged after 10 minutes

## Test Completion

After completing all scenarios successfully:
✅ Phase 0 Critical Vertical Slice is complete
✅ E2EE location sharing proven to work end-to-end
✅ Security audit passed
✅ Ready to proceed to Phase 1