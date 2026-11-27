import { useEffect, useState, useCallback } from 'react';
import {
  aesDecrypt,
  aesEncrypt,
  deriveRoomKeyFromHash,
  exportPublicKey,
  generateECDHKeyPair,
  type AESEncryptedPayload,
  type KeyPair,
} from '@chatterroom/crypto';

export interface CryptoSession {
  keyPair: KeyPair;
  publicKeyJwk: JsonWebKey;
  roomKey: CryptoKey;
}

export interface UseCryptoReturn {
  /** The derived room CryptoKey, or null if not yet ready. */
  keys: CryptoKey | null;
  /** The ephemeral ECDH key pair generated on mount, or null if not yet ready. */
  keyPair: KeyPair | null;
  /** The local ECDH public key exported as JWK for peer key exchange. */
  publicKeyJwk: JsonWebKey | null;
  /** Encrypt a plaintext string; returns a JSON-serialised encrypted payload. */
  encryptMessage: (plaintext: string) => Promise<string>;
  /** Decrypt a JSON-serialised encrypted payload back to plaintext. */
  decryptMessage: (ciphertext: string) => Promise<string>;
  /** Alias for {@link encryptMessage}. */
  encrypt: (plaintext: string) => Promise<string>;
  /** Alias for {@link decryptMessage}. */
  decrypt: (payload: string) => Promise<string>;
  /** Whether both the ECDH key pair and derived room key are ready. */
  isReady: boolean;
  /** Error message if key generation or derivation failed. */
  error: string | null;
}

/**
 * Initialise an ECDH key pair and derive the room AES-GCM key from the URL hash.
 */
export const initializeCryptoSession = async (hashKey: string): Promise<CryptoSession> => {
  const [keyPair, roomKey] = await Promise.all([
    generateECDHKeyPair(),
    deriveRoomKeyFromHash(hashKey),
  ]);
  const publicKeyJwk = await exportPublicKey(keyPair.publicKey);
  return { keyPair, publicKeyJwk, roomKey };
};

/**
 * Encrypt a plaintext string using an AES-256-GCM CryptoKey.
 */
export const encryptMessageWithKey = async (
  key: CryptoKey,
  plaintext: string,
): Promise<string> => {
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await aesEncrypt(key, encoded);
  return JSON.stringify(encrypted);
};

/**
 * Decrypt a JSON-serialised AES-256-GCM payload back to plaintext.
 */
export const decryptMessageWithKey = async (
  key: CryptoKey,
  ciphertext: string,
): Promise<string> => {
  const parsed = JSON.parse(ciphertext) as AESEncryptedPayload;
  const decrypted = await aesDecrypt(key, parsed);
  return new TextDecoder().decode(decrypted);
};

/**
 * Custom hook for encrypting and decrypting chat messages using
 * an ECDH key pair generated on mount and a room key derived from
 * the URL hash fragment.
 *
 * @param hashKey - The hex-encoded key from the URL hash
 * @returns Crypto utilities, key pair state, and readiness status
 */
export const useCrypto = (hashKey: string): UseCryptoReturn => {
  const [keys, setKeys] = useState<CryptoKey | null>(null);
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [publicKeyJwk, setPublicKeyJwk] = useState<JsonWebKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate an ECDH key pair once on mount
  useEffect(() => {
    let cancelled = false;

    const initKeyPair = async () => {
      try {
        const pair = await generateECDHKeyPair();
        const jwk = await exportPublicKey(pair.publicKey);
        if (!cancelled) {
          setKeyPair(pair);
          setPublicKeyJwk(jwk);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to generate ECDH key pair';
          setError(message);
          console.error('Failed to generate ECDH key pair:', err);
        }
      }
    };

    void initKeyPair();

    return () => {
      cancelled = true;
    };
  }, []);

  // Derive the shared room key from the URL hash fragment
  useEffect(() => {
    let cancelled = false;

    if (!hashKey) {
      setKeys(null);
      return;
    }

    const initRoomKey = async () => {
      try {
        const roomKey = await deriveRoomKeyFromHash(hashKey);
        if (!cancelled) {
          setKeys(roomKey);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to derive room key';
          setKeys(null);
          setError(message);
          console.error('Failed to derive room key:', err);
        }
      }
    };

    void initRoomKey();

    return () => {
      cancelled = true;
    };
  }, [hashKey]);

  const encryptMessage = useCallback(
    async (plaintext: string): Promise<string> => {
      if (!keys) throw new Error('Crypto not ready');
      return encryptMessageWithKey(keys, plaintext);
    },
    [keys],
  );

  const decryptMessage = useCallback(
    async (ciphertext: string): Promise<string> => {
      if (!keys) throw new Error('Crypto not ready');
      return decryptMessageWithKey(keys, ciphertext);
    },
    [keys],
  );

  const isReady = Boolean(keys && keyPair);

  return {
    keys,
    keyPair,
    publicKeyJwk,
    encryptMessage,
    decryptMessage,
    encrypt: encryptMessage,
    decrypt: decryptMessage,
    isReady,
    error,
  };
};
