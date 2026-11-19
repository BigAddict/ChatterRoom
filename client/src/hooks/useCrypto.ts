import { useEffect, useState, useCallback } from 'react';
import { deriveRoomKeyFromHash, aesEncrypt, aesDecrypt, type AESEncryptedPayload } from '@chatterroom/crypto';

export interface UseCryptoReturn {
  /** The derived CryptoKey, or null if not yet ready. */
  keys: CryptoKey | null;
  /** Encrypt a plaintext string; returns a JSON-serialised encrypted payload. */
  encrypt: (plaintext: string) => Promise<string>;
  /** Decrypt a JSON-serialised encrypted payload back to plaintext. */
  decrypt: (payload: string) => Promise<string>;
  /** Whether the crypto module has initialised successfully. */
  isReady: boolean;
}

/**
 * Custom hook for encrypting and decrypting chat messages using
 * a room key derived from the URL hash fragment.
 *
 * @param hashKey - The hex-encoded key from the URL hash
 * @returns Crypto utilities and readiness state
 */
export const useCrypto = (hashKey: string): UseCryptoReturn => {
  const [keys, setKeys] = useState<CryptoKey | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!hashKey) return;

    const init = async () => {
      try {
        const roomKey = await deriveRoomKeyFromHash(hashKey);
        setKeys(roomKey);
        setIsReady(true);
      } catch (err) {
        console.error('Failed to derive room key:', err);
      }
    };

    void init();
  }, [hashKey]);

  const encrypt = useCallback(
    async (plaintext: string): Promise<string> => {
      if (!keys) throw new Error('Crypto not ready');
      const encoded = new TextEncoder().encode(plaintext);
      const encrypted = await aesEncrypt(keys, encoded);
      return JSON.stringify(encrypted);
    },
    [keys],
  );

  const decrypt = useCallback(
    async (payload: string): Promise<string> => {
      if (!keys) throw new Error('Crypto not ready');
      const parsed = JSON.parse(payload) as AESEncryptedPayload;
      const decrypted = await aesDecrypt(keys, parsed);
      return new TextDecoder().decode(decrypted);
    },
    [keys],
  );

  return { keys, encrypt, decrypt, isReady };
};
