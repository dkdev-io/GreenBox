const _sodium = require('libsodium-wrappers');

async function generateKeysForUsers() {
  await _sodium.ready;
  const sodium = _sodium;

  // User A: dan@dkdev.io (ID: fb5aea38-4530-42d8-9c1f-6851791dcd8b)
  const userAKeys = sodium.crypto_box_keypair();
  const userAPublicKey = sodium.to_base64(userAKeys.publicKey);
  const userAPrivateKey = sodium.to_base64(userAKeys.privateKey);

  // User B: test-user-b@dkdev.io (ID: 5a86c18f-f296-4bab-a848-8e5a101b69c5)
  const userBKeys = sodium.crypto_box_keypair();
  const userBPublicKey = sodium.to_base64(userBKeys.publicKey);
  const userBPrivateKey = sodium.to_base64(userBKeys.privateKey);

  console.log('=== USER A (dan@dkdev.io) ===');
  console.log('ID:', 'fb5aea38-4530-42d8-9c1f-6851791dcd8b');
  console.log('Public Key:', userAPublicKey);
  console.log('Private Key:', userAPrivateKey);
  console.log('');

  console.log('=== USER B (test-user-b@dkdev.io) ===');
  console.log('ID:', '5a86c18f-f296-4bab-a848-8e5a101b69c5');
  console.log('Public Key:', userBPublicKey);
  console.log('Private Key:', userBPrivateKey);
  console.log('');

  // Return keys for database insertion
  return {
    userA: {
      id: 'fb5aea38-4530-42d8-9c1f-6851791dcd8b',
      publicKey: userAPublicKey,
      privateKey: userAPrivateKey
    },
    userB: {
      id: '5a86c18f-f296-4bab-a848-8e5a101b69c5',
      publicKey: userBPublicKey,
      privateKey: userBPrivateKey
    }
  };
}

// Generate and display keys
generateKeysForUsers()
  .then(keys => {
    console.log('Keys generated successfully!');
    console.log('Next: Store private keys securely and upload public keys to Supabase users table');
  })
  .catch(err => {
    console.error('Error generating keys:', err);
  });