# System Architecture

## Architecture Overview

ChatterRoom is a distributed client-server application optimized for zero persistence and zero-knowledge message relaying.

```
[Client A (Browser)] <== WebSocket (Encrypted Payloads) ==> [Relay Server] <== WebSocket ==> [Client B (Browser)]
   |                                                                                               |
Web Crypto (AES-GCM)                                                                          Web Crypto (AES-GCM)
Key from URL Hash (#)                                                                         Key from URL Hash (#)
```

## System Components

1. **Client (`/client`)**:
   - Single Page Application built on React, Vite, and Tailwind CSS.
   - Manages WebSocket lifecycle, local room state, and user interactions.
   - Extracts key from `window.location.hash`, keeping it isolated from network requests.
   - Encrypts messages with AES-256-GCM before transport; decrypts incoming payloads before UI rendering.

2. **Server (`/server`)**:
   - Fastify HTTP and WebSocket (`ws`) service.
   - In-memory `RoomManager` mapping `roomId -> Set<WebSocket>`.
   - Dispatches incoming encrypted payloads to active room peers.
   - Destroys room state instantly when member count reaches zero.

3. **Crypto Layer (`/packages/crypto`)**:
   - Standalone library wrapping standard Web Crypto API calls.
   - Key generation, ECDH P-256 derivation, and AES-256-GCM encryption/decryption routines.

## Threat Boundary

- **Trusted**: Local browser execution context.
- **Untrusted**: Network transport, WebSocket relay server, external proxies.
- **Data Protection**: Confidentiality and integrity guaranteed via AES-256-GCM authenticated encryption. The server has no visibility into message plaintext.
