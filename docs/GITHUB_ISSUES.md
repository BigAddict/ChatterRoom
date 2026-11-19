# ChatterRoom — Starter GitHub Issues 🏴‍☠️

Create these as GitHub Issues after pushing the repo. Copy each block as a separate issue.
Labels are listed in brackets.

---

## 🔐 TRACK: CRYPTO / SECURITY

### Issue #1: Implement ECDH Key Pair Generation
**Labels:** `track:crypto`, `good first issue`, `priority:high`

**Description:**
Implement the `generateKeyPair()` function in `packages/crypto/src/ecdh.ts` using the Web Crypto API.

**Acceptance Criteria:**
- Uses `crypto.subtle.generateKey` with ECDH P-256 curve
- Returns both public and private keys in exportable format
- Public key can be exported to raw/JWK for sharing over WebSocket
- Unit tests pass

**References:**
- [Web Crypto API — ECDH](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey#ecdh)
- [Darkwire crypto implementation](https://github.com/darkwire/darkwire.io)

---

### Issue #2: Implement ECDH Shared Secret Derivation
**Labels:** `track:crypto`, `priority:high`

**Description:**
Implement `deriveSharedSecret()` in `packages/crypto/src/ecdh.ts`. Given your private key and another user's public key, derive a shared AES-256-GCM key.

**Acceptance Criteria:**
- Uses `crypto.subtle.deriveKey` with ECDH
- Derived key is an AES-GCM 256-bit CryptoKey
- Two users deriving with each other's public keys produce the same shared key
- Unit tests verify bidirectional key agreement

---

### Issue #3: Implement AES-256-GCM Encrypt/Decrypt
**Labels:** `track:crypto`, `good first issue`, `priority:high`

**Description:**
Implement `encrypt()` and `decrypt()` functions in `packages/crypto/src/aes.ts`.

**Acceptance Criteria:**
- Uses `crypto.subtle.encrypt` / `crypto.subtle.decrypt` with AES-GCM
- Generates a random 12-byte IV per message
- Returns ciphertext + IV (both needed for decryption)
- Roundtrip test: encrypt → decrypt produces original plaintext
- Handles UTF-8 text properly

---

### Issue #4: Implement Room Key Generation from URL Hash
**Labels:** `track:crypto`, `priority:high`

**Description:**
Implement `generateRoomKey()` and `importRoomKey()` in `packages/crypto/src/keys.ts`.

**Acceptance Criteria:**
- Generates a random 256-bit key
- Exports key to base64url string (for use in URL hash)
- Imports key from base64url string back to CryptoKey
- Key is usable for AES-GCM operations

---

### Issue #5: Write Threat Model Document
**Labels:** `track:crypto`, `track:docs`, `priority:medium`

**Description:**
Expand the threat model in `docs/SECURITY.md`. Document what attackers can and cannot do.

**Acceptance Criteria:**
- Covers: passive network attacker, compromised server, compromised room member
- Lists what IS protected and what IS NOT
- Documents trust assumptions
- Peer-reviewed by at least 2 contributors

---

## ⚡ TRACK: BACKEND

### Issue #6: Set Up Fastify Server with WebSocket Support
**Labels:** `track:backend`, `good first issue`, `priority:high`

**Description:**
Set up the Fastify server in `server/src/index.ts` with WebSocket upgrade handling using the `ws` library.

**Acceptance Criteria:**
- Fastify server starts on configurable port (env `PORT`, default 3001)
- Handles WebSocket upgrade requests at `/ws/:roomId`
- CORS configured for client origin
- Health check endpoint at `GET /health`
- Graceful shutdown on SIGTERM/SIGINT

---

### Issue #7: Implement Room Manager (In-Memory)
**Labels:** `track:backend`, `priority:high`

**Description:**
Implement the `RoomManager` class in `server/src/websocket/room-manager.ts`.

**Acceptance Criteria:**
- Rooms stored in a `Map<string, Set<WebSocket>>`
- `createOrJoin(roomId, ws)` — adds user to room, creates if needed
- `leave(roomId, ws)` — removes user, destroys room if empty
- `broadcast(roomId, message, sender)` — sends to all room members except sender
- `getRoomSize(roomId)` — returns number of users
- Room is auto-destroyed when last user disconnects
- Unit tests for all methods

---

### Issue #8: Implement WebSocket Message Handler
**Labels:** `track:backend`, `priority:high`

**Description:**
Implement the WebSocket handler in `server/src/websocket/handler.ts`.

**Acceptance Criteria:**
- Handles incoming WebSocket connections
- Routes messages by type: `join`, `message`, `key-exchange`, `leave`
- Validates message format (JSON with `type` field)
- Broadcasts encrypted messages to room members
- Handles disconnection/cleanup
- Logs connections and disconnections

---

### Issue #9: Implement Rate Limiter
**Labels:** `track:backend`, `priority:medium`

**Description:**
Implement per-IP and per-connection rate limiting in `server/src/middleware/rate-limiter.ts`.

**Acceptance Criteria:**
- Max 30 messages per 10 seconds per connection
- Max 5 room creations per minute per IP
- Returns error message to client when rate limited
- Sliding window or token bucket algorithm
- Configurable limits via environment variables

---

### Issue #10: Add Security Headers
**Labels:** `track:backend`, `priority:medium`

**Description:**
Add security headers middleware in `server/src/middleware/security.ts`.

**Acceptance Criteria:**
- Sets `X-Content-Type-Options: nosniff`
- Sets `X-Frame-Options: DENY`
- Sets `Strict-Transport-Security` header
- Sets `Content-Security-Policy` for the app
- Removes `X-Powered-By` header

---

## 🎨 TRACK: FRONTEND

### Issue #11: Create Landing Page (Home)
**Labels:** `track:frontend`, `good first issue`, `priority:high`

**Description:**
Build the landing page at `client/src/pages/Home.tsx`.

**Acceptance Criteria:**
- ChatterRoom logo/title
- Brief description of what the app does
- "Create Room" button that generates a room with a random key in the URL hash
- Clean, responsive design with Tailwind CSS
- Dark mode by default (pirate theme 🏴‍☠️)
- Mobile responsive

---

### Issue #12: Build Chat Window Component
**Labels:** `track:frontend`, `priority:high`

**Description:**
Build the main chat message display in `client/src/components/ChatWindow.tsx`.

**Acceptance Criteria:**
- Displays messages in a scrollable container
- Auto-scrolls to latest message
- Shows sender name, message text, timestamp
- Differentiates own messages (right-aligned) from others (left-aligned)
- Shows system messages (user joined/left) in center
- Handles empty state ("No messages yet")

---

### Issue #13: Build Message Input Component
**Labels:** `track:frontend`, `good first issue`, `priority:high`

**Description:**
Build the message input bar in `client/src/components/MessageInput.tsx`.

**Acceptance Criteria:**
- Text input with send button
- Send on Enter key press
- Shift+Enter for new line
- Disable send when input is empty
- Character limit indicator (optional)
- Shows encryption lock icon 🔒

---

### Issue #14: Build Room Header Component
**Labels:** `track:frontend`, `priority:medium`

**Description:**
Build the room header in `client/src/components/RoomHeader.tsx`.

**Acceptance Criteria:**
- Shows room name/ID
- Shows number of connected users
- "Copy Link" button to share room URL
- "Leave Room" button
- Encryption status indicator (🔒 E2E Encrypted)

---

### Issue #15: Implement useWebSocket Hook
**Labels:** `track:frontend`, `priority:high`

**Description:**
Implement the `useWebSocket` custom hook in `client/src/hooks/useWebSocket.ts`.

**Acceptance Criteria:**
- Connects to WebSocket server at `/ws/:roomId`
- Handles connection, disconnection, reconnection
- Exposes: `sendMessage()`, `isConnected`, `messages[]`
- Auto-reconnect with exponential backoff
- Cleans up on component unmount

---

### Issue #16: Implement useCrypto Hook
**Labels:** `track:frontend`, `track:crypto`, `priority:high`

**Description:**
Implement the `useCrypto` hook in `client/src/hooks/useCrypto.ts`.

**Acceptance Criteria:**
- Generates ECDH key pair on mount
- Derives shared key from room key in URL hash
- Provides `encryptMessage(plaintext)` and `decryptMessage(ciphertext)` functions
- Uses `@chatterroom/crypto` package

---

### Issue #17: Add Dark Mode / Pirate Theme
**Labels:** `track:frontend`, `good first issue`, `priority:low`

**Description:**
Design a dark pirate-themed UI for ChatterRoom.

**Acceptance Criteria:**
- Dark background with accent colors
- Pirate-themed UI elements (optional skull, anchor icons)
- Tailwind dark mode classes
- Smooth transitions
- Accessible contrast ratios (WCAG AA)

---

## 🧪 TRACK: QA / DEVOPS

### Issue #18: Set Up GitHub Actions CI Pipeline
**Labels:** `track:qa-devops`, `good first issue`, `priority:high`

**Description:**
Set up CI in `.github/workflows/ci.yml`.

**Acceptance Criteria:**
- Runs on push to `main` and all PRs
- Installs pnpm, Node 18
- Runs `pnpm lint`, `pnpm test`, `pnpm build`
- Fails PR if any check fails
- Caches pnpm store for faster runs

---

### Issue #19: Write Unit Tests for Crypto Package
**Labels:** `track:qa-devops`, `track:crypto`, `priority:high`

**Description:**
Write comprehensive unit tests for `packages/crypto/`.

**Acceptance Criteria:**
- Tests for key pair generation
- Tests for ECDH shared secret derivation (bidirectional)
- Tests for AES-GCM encrypt/decrypt roundtrip
- Tests for key export/import
- Tests for edge cases (empty string, large message, unicode)
- Uses Vitest

---

### Issue #20: Set Up Docker + Docker Compose
**Labels:** `track:qa-devops`, `priority:medium`

**Description:**
Create production Docker setup.

**Acceptance Criteria:**
- Multi-stage Dockerfile (build + production)
- `docker-compose.yml` for local dev
- Both client and server containerized
- Production image is under 100MB
- Health check configured

---

### Issue #21: Add E2E Tests for Chat Flow
**Labels:** `track:qa-devops`, `priority:medium`

**Description:**
Write end-to-end tests for the core chat flow.

**Acceptance Criteria:**
- Test: Create room → Open in two tabs → Send message → Received by other tab
- Test: User leaves → Room user count updates
- Test: Last user leaves → Room is destroyed
- Uses Playwright or Cypress

---

## 📚 TRACK: DOCS

### Issue #22: Write Setup Guide for New Contributors
**Labels:** `track:docs`, `good first issue`, `priority:high`

**Description:**
Write a step-by-step guide for new contributors to get the project running locally.

**Acceptance Criteria:**
- Covers: Windows, macOS, Linux
- Prerequisites: Node.js, pnpm, Git
- Screenshots of the app running
- Common troubleshooting section
- Links to relevant docs

---

### Issue #23: Create Architecture Diagrams
**Labels:** `track:docs`, `priority:medium`

**Description:**
Create visual diagrams for the architecture document.

**Acceptance Criteria:**
- System overview diagram
- Encryption flow diagram
- WebSocket message flow
- Room lifecycle state diagram
- Use Mermaid or Excalidraw

---

### Issue #24: Design Logo and Branding
**Labels:** `track:docs`, `priority:low`

**Description:**
Design a logo and visual brand for ChatterRoom.

**Acceptance Criteria:**
- Logo (SVG format)
- Color palette
- Favicon
- Social preview image (1280x640 for GitHub)
- Pirate theme is encouraged! 🏴‍☠️

---

### Issue #25: Create Landing/Marketing Page
**Labels:** `track:docs`, `track:frontend`, `priority:low`

**Description:**
Build a simple landing page to showcase ChatterRoom.

**Acceptance Criteria:**
- Hero section with app description
- Feature highlights with icons
- "Try it" button linking to the app
- Tech stack section
- Contributor credits
- Can be a separate `docs/` site or in the client app

---

