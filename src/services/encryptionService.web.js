// Web-compatible encryption service
// Uses a simplified implementation for web browsers during Phase 0

/**
 * Encrypt location data for a specific friend (web version)
 */
export async function encryptLocationForFriend(locationData, friendPublicKey) {
  try {
    // For web testing, we'll use a simple encoding
    // In production, this would use Web Crypto API
    const jsonString = JSON.stringify({
      lat: locationData.latitude,
      lon: locationData.longitude,
      ts: Math.floor(locationData.timestamp / 1000),
      acc: locationData.accuracy || 5.0
    });

    // Simple Base64 encoding for Phase 0 web testing
    const encoded = btoa(jsonString + '_encrypted_for_' + friendPublicKey.slice(0, 8));

    console.log('Location encrypted successfully for friend (web)');
    return encoded;
  } catch (error) {
    console.error('Encryption failed (web):', error);
    throw error;
  }
}

/**
 * Decrypt location data from a friend (web version)
 */
export async function decryptLocationFromFriend(encryptedPayload, privateKey) {
  try {
    // Simple Base64 decoding for Phase 0 web testing
    const decoded = atob(encryptedPayload);
    const jsonString = decoded.split('_encrypted_for_')[0];
    const locationData = JSON.parse(jsonString);

    // Location decrypted successfully (removed console.log for security)
    return {
      latitude: locationData.lat,
      longitude: locationData.lon,
      timestamp: locationData.ts * 1000, // Convert back to milliseconds
      accuracy: locationData.acc
    };
  } catch (error) {
    console.error('Decryption failed (web):', error);
    throw error;
  }
}

/**
 * Generate a new public/private key pair (web version)
 */
export async function generateKeyPair() {
  try {
    // For Phase 0 web testing, generate simple keys
    const privateKey = 'web_private_key_' + Math.random().toString(36).substring(2, 15);
    const publicKey = 'web_public_key_' + Math.random().toString(36).substring(2, 15);

    return {
      publicKey,
      privateKey
    };
  } catch (error) {
    console.error('Key generation failed (web):', error);
    throw error;
  }
}