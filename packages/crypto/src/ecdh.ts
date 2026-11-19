import type { KeyPair } from './types.js';

/**
 * Generate an ECDH key pair using the P-256 curve.
 *
 * The key pair can be used for Diffie-Hellman key agreement to establish
 * a shared secret between two parties without transmitting the secret.
 *
 * @returns A promise that resolves to an ECDH key pair
 *
 * @example
 * ```ts
 * const { publicKey, privateKey } = await generateECDHKeyPair();
 * ```
 */
export const generateECDHKeyPair = async (): Promise<KeyPair> => {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true, // extractable — needed to export the public key
    ['deriveKey', 'deriveBits'],
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
};

/**
 * Derive a shared AES-256-GCM secret key from a local ECDH private key
 * and a remote ECDH public key.
 *
 * Both parties independently call this function with their own private key
 * and the other party's public key. The result is the same shared secret.
 *
 * @param privateKey - The local ECDH private key
 * @param publicKey - The remote party's ECDH public key
 * @returns A promise that resolves to a shared AES-GCM CryptoKey
 *
 * @example
 * ```ts
 * const alice = await generateECDHKeyPair();
 * const bob = await generateECDHKeyPair();
 *
 * const aliceShared = await deriveSharedSecret(alice.privateKey, bob.publicKey);
 * const bobShared = await deriveSharedSecret(bob.privateKey, alice.publicKey);
 * // aliceShared and bobShared are equivalent keys
 * ```
 */
export const deriveSharedSecret = async (
  privateKey: CryptoKey,
  publicKey: CryptoKey,
): Promise<CryptoKey> => {
  const sharedKey = await crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: publicKey,
    },
    privateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false, // non-extractable for security
    ['encrypt', 'decrypt'],
  );

  return sharedKey;
};
