import { describe, expect, it } from 'vitest';
import {
  aesDecrypt,
  aesEncrypt,
  deriveKey,
  deriveRoomKeyFromHash,
  deriveSharedSecret,
  exportPublicKey,
  generateECDHKeyPair,
  importPublicKey,
} from '../src/index.js';

const encode = (text: string): Uint8Array => new TextEncoder().encode(text);
const decode = (bytes: Uint8Array): string => new TextDecoder().decode(bytes);

describe('@chatterroom/crypto (#28)', () => {
  describe('ECDH Key Pair Generation', () => {
    it('generates valid P-256 ECDH key pairs', async () => {
      const pair = await generateECDHKeyPair();

      expect(pair.publicKey.type).toBe('public');
      expect(pair.privateKey.type).toBe('private');
      expect(pair.publicKey.algorithm.name).toBe('ECDH');
      expect(pair.privateKey.algorithm.name).toBe('ECDH');
      expect(pair.publicKey.extractable).toBe(true);
    });

    it('generates distinct key pairs on each call', async () => {
      const pairA = await generateECDHKeyPair();
      const pairB = await generateECDHKeyPair();

      const jwkA = await exportPublicKey(pairA.publicKey);
      const jwkB = await exportPublicKey(pairB.publicKey);

      expect(jwkA.x).not.toBe(jwkB.x);
      expect(jwkA.y).not.toBe(jwkB.y);
    });
  });

  describe('Key Export & Import', () => {
    it('exports a public key to JWK and imports it back for key agreement', async () => {
      const alice = await generateECDHKeyPair();
      const bob = await generateECDHKeyPair();

      const bobJwk = await exportPublicKey(bob.publicKey);
      expect(bobJwk.kty).toBe('EC');
      expect(bobJwk.crv).toBe('P-256');
      expect(bobJwk.d).toBeUndefined();

      const importedBobPublic = await importPublicKey(bobJwk);
      const aliceShared = await deriveSharedSecret(alice.privateKey, importedBobPublic);
      const bobShared = await deriveSharedSecret(bob.privateKey, alice.publicKey);

      const encrypted = await aesEncrypt(aliceShared, encode('verified via JWK'));
      const decrypted = await aesDecrypt(bobShared, encrypted);
      expect(decode(decrypted)).toBe('verified via JWK');
    });
  });

  describe('ECDH Shared Secret Derivation', () => {
    it('derives equivalent shared secrets bidirectionally', async () => {
      const alice = await generateECDHKeyPair();
      const bob = await generateECDHKeyPair();

      const aliceShared = await deriveSharedSecret(alice.privateKey, bob.publicKey);
      const bobShared = await deriveSharedSecret(bob.privateKey, alice.publicKey);

      expect(aliceShared.extractable).toBe(false);
      expect(bobShared.extractable).toBe(false);

      const fromAlice = await aesEncrypt(aliceShared, encode('ping'));
      expect(decode(await aesDecrypt(bobShared, fromAlice))).toBe('ping');

      const fromBob = await aesEncrypt(bobShared, encode('pong'));
      expect(decode(await aesDecrypt(aliceShared, fromBob))).toBe('pong');
    });

    it('prevents a third party from decrypting messages between two peers', async () => {
      const alice = await generateECDHKeyPair();
      const bob = await generateECDHKeyPair();
      const charlie = await generateECDHKeyPair();

      const aliceBobKey = await deriveSharedSecret(alice.privateKey, bob.publicKey);
      const charlieAliceKey = await deriveSharedSecret(charlie.privateKey, alice.publicKey);

      const encrypted = await aesEncrypt(aliceBobKey, encode('secret'));
      await expect(aesDecrypt(charlieAliceKey, encrypted)).rejects.toThrow();
    });
  });

  describe('HKDF Key Derivation', () => {
    it('derives deterministic room keys from the same URL hash', async () => {
      const hash = 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90';
      const key1 = await deriveRoomKeyFromHash(hash);
      const key2 = await deriveRoomKeyFromHash(hash);

      const payload = await aesEncrypt(key1, encode('room message'));
      expect(decode(await aesDecrypt(key2, payload))).toBe('room message');
    });

    it('derives different keys for different hashes or HKDF contexts', async () => {
      const keyA = await deriveKey(encode('secret-material'), new Uint8Array(0), 'ctx-a');
      const keyB = await deriveKey(encode('secret-material'), new Uint8Array(0), 'ctx-b');

      const payload = await aesEncrypt(keyA, encode('isolated'));
      await expect(aesDecrypt(keyB, payload)).rejects.toThrow();
    });
  });

  describe('AES-256-GCM Encrypt/Decrypt & Edge Cases', () => {
    it('generates a unique IV for every encryption of identical plaintext', async () => {
      const key = await deriveRoomKeyFromHash('00112233445566778899aabbccddeeff');
      const first = await aesEncrypt(key, encode('same text'));
      const second = await aesEncrypt(key, encode('same text'));

      expect(first.iv).not.toBe(second.iv);
      expect(first.ciphertext).not.toBe(second.ciphertext);
    });

    it('rejects tampered ciphertext', async () => {
      const key = await deriveRoomKeyFromHash('00112233445566778899aabbccddeeff');
      const payload = await aesEncrypt(key, encode('integrity check'));

      const tampered = {
        ...payload,
        ciphertext:
          payload.ciphertext.slice(0, -2) +
          (payload.ciphertext.endsWith('AA') ? 'BB' : 'AA'),
      };

      await expect(aesDecrypt(key, tampered)).rejects.toThrow();
    });

    it('roundtrips an empty string', async () => {
      const key = await deriveRoomKeyFromHash('ffeeddccbbaa99887766554433221100');
      const encrypted = await aesEncrypt(key, encode(''));
      const decrypted = await aesDecrypt(key, encrypted);

      expect(decode(decrypted)).toBe('');
    });

    it('roundtrips unicode and emoji content', async () => {
      const key = await deriveRoomKeyFromHash('ffeeddccbbaa99887766554433221100');
      const message = '🏴‍☠️ ChatterRoom — こんにちは世界 🔐 café';
      const encrypted = await aesEncrypt(key, encode(message));
      const decrypted = await aesDecrypt(key, encrypted);

      expect(decode(decrypted)).toBe(message);
    });

    it('roundtrips a large message (64 KB)', async () => {
      const key = await deriveRoomKeyFromHash('ffeeddccbbaa99887766554433221100');
      const largeMessage = 'A'.repeat(65_536);
      const encrypted = await aesEncrypt(key, encode(largeMessage));
      const decrypted = await aesDecrypt(key, encrypted);

      expect(decode(decrypted)).toBe(largeMessage);
    });
  });
});
