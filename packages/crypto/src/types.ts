/** A WebCrypto ECDH key pair. */
export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

/** A serialized key pair with the public key exported as a JWK. */
export interface SerializedKeyPair {
  publicKey: JsonWebKey;
  privateKey: CryptoKey;
}

/** A derived room encryption key with metadata. */
export interface RoomKey {
  key: CryptoKey;
  roomId: string;
  createdAt: number;
}

/** An encrypted chat message payload. */
export interface EncryptedMessage {
  /** The AES-GCM ciphertext as a base64 string. */
  ciphertext: string;
  /** The random initialization vector as a base64 string. */
  iv: string;
  /** Sender's public key as JWK for key agreement. */
  senderPublicKey?: JsonWebKey;
  /** Timestamp of encryption. */
  timestamp: number;
}
