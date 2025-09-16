import sodium from 'react-native-libsodium';

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