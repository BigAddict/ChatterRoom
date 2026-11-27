import { describe, expect, it } from 'vitest';
import {
  decryptMessageWithKey,
  encryptMessageWithKey,
  initializeCryptoSession,
} from '../src/hooks/useCrypto.js';

describe('useCrypto helpers (#21)', () => {
  const sampleHash = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  it('generates an ECDH P-256 key pair, exports JWK, and derives the room key', async () => {
    const session = await initializeCryptoSession(sampleHash);

    expect(session.keyPair.publicKey.type).toBe('public');
    expect(session.keyPair.privateKey.type).toBe('private');
    expect(session.keyPair.publicKey.algorithm).toMatchObject({
      name: 'ECDH',
      namedCurve: 'P-256',
    });

    expect(session.publicKeyJwk.kty).toBe('EC');
    expect(session.publicKeyJwk.crv).toBe('P-256');
    expect(session.publicKeyJwk.d).toBeUndefined();

    expect(session.roomKey.algorithm).toMatchObject({
      name: 'AES-GCM',
      length: 256,
    });
  });

  it('encrypts and decrypts messages using the derived room key', async () => {
    const alice = await initializeCryptoSession(sampleHash);
    const bob = await initializeCryptoSession(sampleHash);

    const plaintext = 'Hello from ChatterRoom 🔐';
    const ciphertext = await encryptMessageWithKey(alice.roomKey, plaintext);
    const decrypted = await decryptMessageWithKey(bob.roomKey, ciphertext);

    expect(decrypted).toBe(plaintext);
  });

  it('fails to decrypt with a different room hash key', async () => {
    const alice = await initializeCryptoSession(sampleHash);
    const other = await initializeCryptoSession(
      'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
    );

    const ciphertext = await encryptMessageWithKey(alice.roomKey, 'secret');
    await expect(decryptMessageWithKey(other.roomKey, ciphertext)).rejects.toThrow();
  });
});
