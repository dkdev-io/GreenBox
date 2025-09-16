import * as SecureStore from 'expo-secure-store';

const PRIVATE_KEY_PREFIX = 'greenbox_private_key_';
const CURRENT_USER_KEY = 'greenbox_current_user';

/**
 * Store a user's private key securely in the device keychain
 */
export async function storePrivateKey(userId, privateKey) {
  try {
    const key = `${PRIVATE_KEY_PREFIX}${userId}`;
    await SecureStore.setItemAsync(key, privateKey);
    return true;
  } catch (error) {
    console.error('Error storing private key:', error);
    throw error;
  }
}

/**
 * Retrieve a user's private key from secure storage
 */
export async function getPrivateKey(userId) {
  try {
    const key = `${PRIVATE_KEY_PREFIX}${userId}`;
    const privateKey = await SecureStore.getItemAsync(key);
    return privateKey;
  } catch (error) {
    console.error('Error retrieving private key:', error);
    throw error;
  }
}

/**
 * Store the current authenticated user ID
 */
export async function storeCurrentUser(userId) {
  try {
    await SecureStore.setItemAsync(CURRENT_USER_KEY, userId);
    return true;
  } catch (error) {
    console.error('Error storing current user:', error);
    throw error;
  }
}

/**
 * Get the current authenticated user ID
 */
export async function getCurrentUserId() {
  try {
    const userId = await SecureStore.getItemAsync(CURRENT_USER_KEY);
    return userId;
  } catch (error) {
    console.error('Error retrieving current user:', error);
    throw error;
  }
}

/**
 * Clear all stored user data (for logout)
 */
export async function clearUserData() {
  try {
    // Get current user to know which keys to clear
    const userId = await getCurrentUserId();

    if (userId) {
      const privateKeyKey = `${PRIVATE_KEY_PREFIX}${userId}`;
      await SecureStore.deleteItemAsync(privateKeyKey);
    }

    await SecureStore.deleteItemAsync(CURRENT_USER_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
}

/**
 * Initialize test user private keys in secure storage
 * This is for Phase 0 hardcoded setup only
 */
export async function initializeTestUserKeys() {
  try {
    // User A
    await storePrivateKey(
      'fb5aea38-4530-42d8-9c1f-6851791dcd8b',
      'x2u1TllcWI_iB34b_9PnRCb5o6TulCH7rmHRjD_dyes'
    );

    // User B
    await storePrivateKey(
      '5a86c18f-f296-4bab-a848-8e5a101b69c5',
      'J4s8jnIrLM4FpGXutFB7DdErfN7vdZy8DdFaeuWAdKU'
    );

    console.log('Test user private keys initialized in secure storage');
    return true;
  } catch (error) {
    console.error('Error initializing test user keys:', error);
    throw error;
  }
}