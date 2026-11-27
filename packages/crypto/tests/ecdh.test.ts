import { describe, expect, it } from 'vitest';
import { generateECDHKeyPair, generateKeyPair } from '../src/ecdh.js';

describe('ECDH Key Pair Generation', () => {
  it('generateKeyPair is exported and matches generateECDHKeyPair', () => {
    expect(generateKeyPair).toBe(generateECDHKeyPair);
  });

  it('generates an extractable ECDH P-256 key pair', async () => {
    const { publicKey, privateKey } = await generateKeyPair();

    expect(publicKey).toBeInstanceOf(CryptoKey);
    expect(privateKey).toBeInstanceOf(CryptoKey);

    expect(publicKey.type).toBe('public');
    expect(privateKey.type).toBe('private');

    expect(publicKey.extractable).toBe(true);
    expect(privateKey.extractable).toBe(true);

    expect(publicKey.algorithm).toMatchObject({ name: 'ECDH', namedCurve: 'P-256' });
    expect(privateKey.algorithm).toMatchObject({ name: 'ECDH', namedCurve: 'P-256' });

    expect(privateKey.usages).toEqual(expect.arrayContaining(['deriveKey', 'deriveBits']));
  });

  it('allows exporting the public key to JWK and raw formats for WebSocket sharing', async () => {
    const { publicKey } = await generateKeyPair();

    const jwk = await crypto.subtle.exportKey('jwk', publicKey);
    expect(jwk.kty).toBe('EC');
    expect(jwk.crv).toBe('P-256');
    expect(typeof jwk.x).toBe('string');
    expect(typeof jwk.y).toBe('string');

    const raw = await crypto.subtle.exportKey('raw', publicKey);
    expect(raw.byteLength).toBe(65); // Uncompressed P-256 point: 0x04 || x (32B) || y (32B)
  });

  it('allows exporting the private key in JWK and PKCS8 formats', async () => {
    const { privateKey } = await generateKeyPair();

    const jwk = await crypto.subtle.exportKey('jwk', privateKey);
    expect(jwk.kty).toBe('EC');
    expect(jwk.crv).toBe('P-256');
    expect(typeof jwk.d).toBe('string');

    const pkcs8 = await crypto.subtle.exportKey('pkcs8', privateKey);
    expect(pkcs8.byteLength).toBeGreaterThan(0);
  });

  it('generates unique key pairs on subsequent calls', async () => {
    const pairA = await generateKeyPair();
    const pairB = await generateKeyPair();

    const jwkA = await crypto.subtle.exportKey('jwk', pairA.publicKey);
    const jwkB = await crypto.subtle.exportKey('jwk', pairB.publicKey);

    expect(jwkA.x).not.toBe(jwkB.x);
    expect(jwkA.y).not.toBe(jwkB.y);
  });
});
