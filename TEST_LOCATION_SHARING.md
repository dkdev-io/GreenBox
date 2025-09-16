# Testing Location Sharing - Step by Step Guide

## Quick Test Setup

### 1. Open Two Browser Windows
- **Window 1**: http://localhost:3010 (User A)
- **Window 2**: http://localhost:3010 (User B)

### 2. Navigate to Test Mode
**Both windows:**
1. Click "Get Started" or "Log In"
2. Click "Development Mode"
3. Select different users:
   - **Window 1**: Click "Login as User A"
   - **Window 2**: Click "Login as User B"

### 3. Grant Location Permissions
**Both windows will show permission prompts:**
- Click "Grant Location Access" when prompted
- Allow location access in browser popup

### 4. Verify Location Sharing
**You should see:**
- **Each window shows a map placeholder** with current coordinates
- **Blue marker**: Your own location
- **Red marker**: Friend's location (appears when other user shares)
- **Real-time updates**: Markers update as locations change

## What to Look For

### ✅ Success Indicators
- Map shows "Lat: [coordinates], Lng: [coordinates]"
- "Markers: 2" (both users visible)
- User A sees their blue marker + User B's red marker
- User B sees their blue marker + User A's red marker
- Connection status shows green dot (🟢)

### ❌ Troubleshooting
- **No map**: Refresh browser
- **No markers**: Check location permissions granted
- **Red connection**: Check Supabase is running (`npx supabase start`)
- **No friend marker**: Ensure both users logged in to different accounts

## Advanced Testing

### Test Real-time Updates
1. Open browser dev tools → Application → Local Storage
2. Manually change coordinates in one window
3. Verify other window updates automatically

### Test Encryption
1. Open browser dev tools → Network tab
2. Watch for POST requests to `/rest/v1/encrypted_locations`
3. Verify payload is encrypted Base64 (no readable coordinates)

### Test Database
1. Go to http://127.0.0.1:54323 (Supabase Studio)
2. Check `encrypted_locations` table
3. Verify all location data is encrypted

## Expected Flow
1. **User A shares location** → Encrypted and sent to database
2. **User B receives notification** → Decrypts and shows on map
3. **Both users see each other** → Real-time bidirectional sharing
4. **Locations update automatically** → Every 10-15 seconds

The system is fully functional for testing the core E2EE location sharing concept!