# Threat Model & Security Boundaries

## 1. System Assets
- **Message Plaintext**: High value. Must never be visible to the network or relay server.
- **Room Key**: High value. Derived from URL hash fragment (`#`). Never sent in HTTP requests.
- **Identity & Metadata**: Minimal value. Nicknames are ephemeral; no persistent user accounts.

## 2. Adversary Models

### A. Network Adversary (ISP, Wi-Fi eavesdropper, MITM)
- **Capability**: Can intercept network packets between client and relay server.
- **Mitigation**: WSS (TLS 1.3) protects transport. Payload is separately encrypted with AES-256-GCM. An attacker sees only ciphertext.

### B. Compromised Relay Server
- **Capability**: Full control over WebSocket server memory, routing, and logs.
- **Mitigation**: Server has zero decryption keys. Keys reside exclusively in client memory and the URL hash (`#`). Server cannot decrypt messages.

### C. Malicious Room Participant
- **Capability**: A legitimate member of the room possessing the room key.
- **Mitigation**: ChatterRoom does not protect against bad actors inside your private room. If an adversary has the link, they can read messages. Use out-of-band verification to share links.

## 3. Residual Risks & Non-Goals
- **Traffic Analysis**: Relay observes message count, payload sizes, and connection timestamps.
- **Endpoint Compromise**: If a user's machine/browser is compromised (malware, screen recording), plaintext in DOM is readable.
