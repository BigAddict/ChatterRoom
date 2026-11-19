# Cryptographic & Security Specifications

## Primitives

- **Symmetric Cipher**: AES-256-GCM (`crypto.subtle`)
- **Key Derivation / Exchange**: ECDH using NIST curve P-256 / HKDF
- **IV Generation**: 12-byte cryptographically secure pseudorandom values per encryption operation (`crypto.getRandomValues`)

## Key Distribution Model

Room keys are appended to the URL fragment identifier (`https://host/room/<id>#<key>`). Browsers omit URI fragments when transmitting HTTP requests; keys never transit server logs, HTTP proxies, or intermediary TLS terminators.

## Security Guarantees & Limitations

| Threat | Protected | Mechanism |
|---|---|---|
| Server eavesdropping | Yes | End-to-end AES-256-GCM |
| Tampering in transit | Yes | GCM authentication tag validation |
| Historical log compromise | Yes | Zero server-side persistence |
| Traffic analysis / metadata | No | Server observes message sizes and timestamps |
| Malicious peer in room | No | Room members possess shared room key |
