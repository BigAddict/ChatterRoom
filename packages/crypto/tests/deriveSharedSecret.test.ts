import { webcrypto } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  aesDecrypt,
  aesEncrypt,
  deriveSharedSecret,
  generateECDHKeyPair,
} from '../src/index.js';

if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto });
}

describe('deriveSharedSecret (#6)', () => {
  it('derives a non-extractable AES-GCM 256-bit secret key', async () => {
    const alice = await generateECDHKeyPair();
    const bob = await generateECDHKeyPair();

    const shared = await deriveSharedSecret(alice.privateKey, bob.publicKey);

    expect(shared.type).toBe('secret');
    expect(shared.extractable).toBe(false);
    expect(shared.algorithm).toMatchObject({ name: 'AES-GCM', length: 256 });
    expect(shared.usages).toEqual(expect.arrayContaining(['encrypt', 'decrypt']));
  });

  it('produces matching shared keys for bidirectional encryption and decryption', async () => {
    const alice = await generateECDHKeyPair();
    const bob = await generateECDHKeyPair();

    const aliceShared = await deriveSharedSecret(alice.privateKey, bob.publicKey);
    const bobShared = await deriveSharedSecret(bob.privateKey, alice.publicKey);

    const enc = new TextEncoder();
    const dec = new TextDecoder();

    const fromAlice = await aesEncrypt(aliceShared, enc.encode('hello bob'));
    expect(dec.decode(await aesDecrypt(bobShared, fromAlice))).toBe('hello bob');

    const fromBob = await aesEncrypt(bobShared, enc.encode('hello alice'));
    expect(dec.decode(await aesDecrypt(aliceShared, fromBob))).toBe('hello alice');
  });

  it('rejects invalid key roles (e.g., passing a public key as privateKey)', async () => {
    const alice = await generateECDHKeyPair();
    const bob = await generateECDHKeyPair();

    await expect(deriveSharedSecret(alice.publicKey, bob.publicKey)).rejects.toThrow();
    await expect(deriveSharedSecret(alice.privateKey, bob.privateKey)).rejects.toThrow();
  });
});
