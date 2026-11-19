/**
 * @chatterroom/crypto
 *
 * End-to-end encryption utilities for ChatterRoom.
 * Uses the Web Crypto API (crypto.subtle) exclusively — no npm crypto libraries.
 *
 * @packageDocumentation
 */

export { generateECDHKeyPair, deriveSharedSecret } from './ecdh.js';
export { aesEncrypt, aesDecrypt, type AESEncryptedPayload } from './aes.js';
export { deriveKey, deriveRoomKeyFromHash, exportPublicKey, importPublicKey } from './keys.js';
export type { EncryptedMessage, KeyPair, RoomKey, SerializedKeyPair } from './types.js';
