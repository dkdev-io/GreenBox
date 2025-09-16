import sodium from 'react-native-libsodium';
import { supabase } from './supabase';
import { storeSecurely, getSecurely } from './secureStorage';

// Initialize libsodium
let isReady = false;

export async function initializeEncryption() {
  if (!isReady) {
    await sodium.ready;
    isReady = true;
  }
}

/**
 * Encrypt location data for a specific friend using their public key
 * @param {object} locationData - Object containing lat, lon, ts, acc
 * @param {string} friendPublicKey - Base64 encoded public key of the friend
 * @returns {string} Base64 encoded encrypted payload
 */
export async function encryptLocationForFriend(locationData, friendPublicKey) {
  try {
    await initializeEncryption();

    // Create location JSON payload
    const locationPayload = {
      lat: locationData.latitude,
      lon: locationData.longitude,
      ts: Math.floor(locationData.timestamp / 1000), // Convert to seconds
      acc: locationData.accuracy || 0,
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(locationPayload);
    const message = sodium.from_string(jsonString);

    // Decode friend's public key from Base64
    const publicKey = sodium.from_base64(friendPublicKey);

    // Encrypt using crypto_box_seal (anonymous encryption)
    // This uses the friend's public key to encrypt, only they can decrypt with their private key
    const encryptedMessage = sodium.crypto_box_seal(message, publicKey);

    // Encode to Base64 for storage
    const base64Payload = sodium.to_base64(encryptedMessage);

    console.log('Location encrypted successfully for friend');
    return base64Payload;

  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt location data');
  }
}

/**
 * Decrypt location data using the user's private key
 * @param {string} encryptedPayload - Base64 encoded encrypted data
 * @param {string} privateKey - Base64 encoded private key
 * @param {string} publicKey - Base64 encoded public key (needed for decryption)
 * @returns {object} Decrypted location data
 */
export async function decryptLocationData(encryptedPayload, privateKey, publicKey) {
  try {
    await initializeEncryption();

    // Decode from Base64
    const encryptedMessage = sodium.from_base64(encryptedPayload);
    const userPrivateKey = sodium.from_base64(privateKey);
    const userPublicKey = sodium.from_base64(publicKey);

    // Create keypair for decryption
    const keypair = {
      publicKey: userPublicKey,
      privateKey: userPrivateKey,
    };

    // Decrypt using crypto_box_seal_open
    const decryptedMessage = sodium.crypto_box_seal_open(
      encryptedMessage,
      keypair.publicKey,
      keypair.privateKey
    );

    // Convert back to string and parse JSON
    const jsonString = sodium.to_string(decryptedMessage);
    const locationData = JSON.parse(jsonString);

    // Location decrypted successfully (removed console.log for security)
    return {
      latitude: locationData.lat,
      longitude: locationData.lon,
      timestamp: locationData.ts * 1000, // Convert back to milliseconds
      accuracy: locationData.acc,
    };

  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt location data');
  }
}

/**
 * Generate a new keypair for testing
 * @returns {object} Object with publicKey and privateKey as Base64 strings
 */
export async function generateKeyPair() {
  try {
    await initializeEncryption();

    const keypair = sodium.crypto_box_keypair();

    return {
      publicKey: sodium.to_base64(keypair.publicKey),
      privateKey: sodium.to_base64(keypair.privateKey),
    };

  } catch (error) {
    console.error('Key generation failed:', error);
    throw new Error('Failed to generate keypair');
  }
}

/**
 * Initialize user keys on first sign-in
 * Checks if user already has keys, if not generates and stores them
 * @param {object} user - Supabase user object
 */
export async function initializeUserKeys(user) {
  try {
    const userId = user.id;
    const keyName = `private_key_${userId}`;

    // Check if user already has a private key stored
    const existingPrivateKey = await getSecurely(keyName);

    if (existingPrivateKey) {
      console.log('User already has keys initialized');
      return;
    }

    // Check if user record exists in database
    const { data: existingUser } = await supabase
      .from('users')
      .select('public_key')
      .eq('id', userId)
      .single();

    if (existingUser?.public_key) {
      console.log('User has public key in database but no local private key');
      // This shouldn't happen in normal flow, but could happen if user reinstalled app
      throw new Error('Key mismatch: public key exists but private key missing');
    }

    // Generate new key pair
    console.log('Generating new key pair for user');
    const keyPair = await generateKeyPair();

    // Store private key securely on device
    await storeSecurely(keyName, keyPair.privateKey);

    // Create or update user record with public key and profile info
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        public_key: keyPair.publicKey,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
      });

    if (upsertError) {
      throw upsertError;
    }

    console.log('User keys initialized successfully');

  } catch (error) {
    console.error('Failed to initialize user keys:', error);
    throw new Error('Failed to initialize user keys');
  }
}