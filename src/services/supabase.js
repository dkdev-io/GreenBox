import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get environment variables
const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable auto refresh for our hardcoded auth implementation
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test user configurations for hardcoded authentication
export const TEST_USERS = {
  userA: {
    id: 'c88a3793-ff60-4e00-9610-8ccb9fdcb9d6',
    email: 'dan@dkdev.io',
    privateKey: 'x2u1TllcWI_iB34b_9PnRCb5o6TulCH7rmHRjD_dyes',
  },
  userB: {
    id: '12d8f2cb-cc72-4f8d-a0dc-500d5766bc70',
    email: 'dpeterkelly@gmail.com',
    privateKey: 'Ew5xn3c0EakdfjpMkatRQCsf6DnJOIPfjgMV82Of9wg',
  },
};

/**
 * Hardcoded authentication function for Phase 0 testing
 * In production, this would be replaced with proper OAuth
 */
export async function authenticateTestUser(userType) {
  const user = TEST_USERS[userType];
  if (!user) {
    throw new Error(`Invalid user type: ${userType}`);
  }

  // Create a mock JWT session for the test user
  // In a real implementation, this would come from Supabase Auth
  const mockSession = {
    access_token: `mock_jwt_for_${user.id}`,
    refresh_token: `mock_refresh_for_${user.id}`,
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: user.id,
      email: user.email,
      aud: 'authenticated',
      role: 'authenticated',
    },
  };

  // Set the session in Supabase client
  const { data, error } = await supabase.auth.setSession({
    access_token: mockSession.access_token,
    refresh_token: mockSession.refresh_token,
  });

  if (error) {
    console.error('Authentication error:', error);
    throw error;
  }

  return {
    user: user,
    session: mockSession,
  };
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser() {
  return supabase.auth.getUser();
}

/**
 * Sign out the current user
 */
export async function signOut() {
  return await supabase.auth.signOut();
}

/**
 * Get friend's public key from the users table
 * @param {string} friendUserId - The user ID of the friend
 */
export async function getFriendPublicKey(friendUserId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('public_key, full_name')
      .eq('id', friendUserId)
      .single();

    if (error) {
      console.error('Error fetching friend public key:', error);
      throw error;
    }

    return {
      publicKey: data.public_key,
      name: data.full_name,
    };
  } catch (error) {
    console.error('Failed to get friend public key:', error);
    throw error;
  }
}

/**
 * Get the current user's public key from the users table
 * @param {string} userId - The current user's ID
 */
export async function getUserPublicKey(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('public_key')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user public key:', error);
      throw error;
    }

    return data.public_key;
  } catch (error) {
    console.error('Failed to get user public key:', error);
    throw error;
  }
}

/**
 * Get the friend user ID for the current user (for Phase 0 testing)
 * In Phase 0, User A's friend is User B and vice versa
 */
export function getFriendUserId(currentUserType) {
  if (currentUserType === 'userA') {
    return TEST_USERS.userB.id;
  } else {
    return TEST_USERS.userA.id;
  }
}

/**
 * Send encrypted location data to the encrypted_locations table
 * @param {string} senderId - User ID of the sender
 * @param {string} recipientId - User ID of the recipient
 * @param {string} encryptedPayload - Base64 encoded encrypted location data
 */
export async function sendEncryptedLocation(senderId, recipientId, encryptedPayload) {
  try {
    const { data, error } = await supabase
      .from('encrypted_locations')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        payload: encryptedPayload,
      });

    if (error) {
      console.error('Error sending encrypted location:', error);
      throw error;
    }

    console.log('Encrypted location sent successfully');
    return data;

  } catch (error) {
    console.error('Failed to send encrypted location:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time location updates for the current user
 * @param {string} userId - The current user's ID
 * @param {function} onLocationReceived - Callback function to handle new location data
 * @returns {object} Subscription object that can be used to unsubscribe
 */
export function subscribeToLocationUpdates(userId, onLocationReceived) {
  console.log('Setting up real-time subscription for user:', userId);

  const subscription = supabase
    .channel('encrypted_locations')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'encrypted_locations',
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => {
        console.log('Real-time location update received:', payload);
        onLocationReceived(payload.new);
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status);
    });

  return subscription;
}

/**
 * Unsubscribe from location updates
 * @param {object} subscription - The subscription object to unsubscribe from
 */
export function unsubscribeFromLocationUpdates(subscription) {
  if (subscription) {
    console.log('Unsubscribing from location updates');
    supabase.removeChannel(subscription);
  }
}

/**
 * Process an incoming encrypted location message
 * @param {object} encryptedLocationRow - Row from encrypted_locations table
 * @param {string} currentUserType - Current user type ('userA' or 'userB')
 * @returns {object} Decrypted location data with sender info
 */
export async function processIncomingLocation(encryptedLocationRow, currentUserType) {
  try {
    const { decryptLocationData } = await import('./encryptionService.js');
    const { getSecureValue } = await import('./secureStorage.js');

    // Get current user info
    const currentUser = TEST_USERS[currentUserType];
    if (!currentUser) {
      throw new Error(`Invalid user type: ${currentUserType}`);
    }

    // Get private key from secure storage
    const privateKey = await getSecureValue(`privateKey_${currentUser.id}`);
    if (!privateKey) {
      throw new Error('Private key not found in secure storage');
    }

    // Get current user's public key
    const publicKey = await getUserPublicKey(currentUser.id);

    // Decrypt the location data
    const decryptedLocation = await decryptLocationData(
      encryptedLocationRow.payload,
      privateKey,
      publicKey
    );

    // Get sender information
    const senderInfo = await getFriendPublicKey(encryptedLocationRow.sender_id);

    console.log('🔓 Successfully decrypted location from:', senderInfo.name);
    console.log('📍 Location data:', {
      lat: decryptedLocation.latitude,
      lon: decryptedLocation.longitude,
      accuracy: decryptedLocation.accuracy,
      timestamp: new Date(decryptedLocation.timestamp).toISOString(),
    });

    return {
      ...decryptedLocation,
      senderId: encryptedLocationRow.sender_id,
      senderName: senderInfo.name,
      receivedAt: encryptedLocationRow.created_at,
    };

  } catch (error) {
    console.error('❌ Failed to process incoming location:', error);
    throw error;
  }
}