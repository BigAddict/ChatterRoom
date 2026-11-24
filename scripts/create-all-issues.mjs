import { execSync } from 'node:child_process';
import fs from 'node:fs';

const REPO = 'PiratesOfDevs/ChatterRoom';

// 1. Ensure labels exist
const labels = [
  { name: 'track:frontend', color: '1D76DB', desc: 'Frontend client UI tasks' },
  { name: 'track:backend', color: 'D93F0B', desc: 'Backend server & WebSocket tasks' },
  { name: 'track:crypto', color: 'B60205', desc: 'Cryptography & security tasks' },
  { name: 'track:qa-devops', color: 'FBCA04', desc: 'Testing, Docker & CI/CD tasks' },
  { name: 'track:docs', color: '5319E7', desc: 'Documentation & diagrams' },
  { name: 'priority:high', color: 'E11D48', desc: 'High priority blocker' },
  { name: 'priority:medium', color: 'EAB308', desc: 'Medium priority' },
  { name: 'priority:low', color: '6B7280', desc: 'Low priority / polish' },
  { name: 'good first issue', color: '7057ff', desc: 'Good for newcomers' },
];

console.log('🏷️ Ensuring labels in repository...');
for (const l of labels) {
  try {
    execSync(`gh label create "${l.name}" --color "${l.color}" --description "${l.desc}" -R ${REPO}`, { stdio: 'ignore' });
    console.log(`Created label: ${l.name}`);
  } catch {
    // Label might already exist, update it
    try {
      execSync(`gh label edit "${l.name}" --color "${l.color}" --description "${l.desc}" -R ${REPO}`, { stdio: 'ignore' });
    } catch {}
  }
}

// 2. All issues list
const allIssues = [
  // CRYPTO
  {
    title: 'Implement ECDH Key Pair Generation',
    labels: ['track:crypto', 'good first issue', 'priority:high'],
    body: `### Description
Implement the \`generateKeyPair()\` function in \`packages/crypto/src/ecdh.ts\` using the Web Crypto API.

### Acceptance Criteria
- Uses \`crypto.subtle.generateKey\` with ECDH P-256 curve
- Returns both public and private keys in exportable format
- Public key can be exported to raw/JWK for sharing over WebSocket
- Unit tests pass

### References
- [Web Crypto API — ECDH](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey#ecdh)
- [Darkwire crypto implementation](https://github.com/darkwire/darkwire.io)`
  },
  {
    title: 'Implement ECDH Shared Secret Derivation',
    labels: ['track:crypto', 'priority:high'],
    body: `### Description
Implement \`deriveSharedSecret()\` in \`packages/crypto/src/ecdh.ts\`. Given your private key and another user's public key, derive a shared AES-256-GCM key.

### Acceptance Criteria
- Uses \`crypto.subtle.deriveKey\` with ECDH
- Derived key is an AES-GCM 256-bit CryptoKey
- Two users deriving with each other's public keys produce the same shared key
- Unit tests verify bidirectional key agreement`
  },
  {
    title: 'Implement AES-256-GCM Encrypt/Decrypt',
    labels: ['track:crypto', 'good first issue', 'priority:high'],
    body: `### Description
Implement \`encrypt()\` and \`decrypt()\` functions in \`packages/crypto/src/aes.ts\`.

### Acceptance Criteria
- Uses \`crypto.subtle.encrypt\` / \`crypto.subtle.decrypt\` with AES-GCM
- Generates a random 12-byte IV per message
- Returns ciphertext + IV (both needed for decryption)
- Roundtrip test: encrypt → decrypt produces original plaintext
- Handles UTF-8 text properly`
  },
  {
    title: 'Implement Room Key Generation from URL Hash',
    labels: ['track:crypto', 'priority:high'],
    body: `### Description
Implement \`generateRoomKey()\` and \`importRoomKey()\` in \`packages/crypto/src/keys.ts\`.

### Acceptance Criteria
- Generates a random 256-bit key
- Exports key to base64url string (for use in URL hash)
- Imports key from base64url string back to CryptoKey
- Key is usable for AES-GCM operations`
  },
  {
    title: 'Write Threat Model Document',
    labels: ['track:crypto', 'track:docs', 'priority:medium'],
    body: `### Description
Expand the threat model in \`docs/SECURITY.md\` and \`docs/THREAT_MODEL.md\`. Document what attackers can and cannot do.

### Acceptance Criteria
- Covers: passive network attacker, compromised server, compromised room member
- Lists what IS protected and what IS NOT
- Documents trust assumptions
- Peer-reviewed by at least 2 contributors`
  },

  // BACKEND
  {
    title: 'Set Up Fastify Server with WebSocket Support',
    labels: ['track:backend', 'good first issue', 'priority:high'],
    body: `### Description
Set up the Fastify server in \`server/src/index.ts\` with WebSocket upgrade handling using the \`ws\` library.

### Acceptance Criteria
- Fastify server starts on configurable port (env \`PORT\`, default 3001)
- Handles WebSocket upgrade requests at \`/ws/:roomId\`
- CORS configured for client origin
- Health check endpoint at \`GET /health\`
- Graceful shutdown on SIGTERM/SIGINT`
  },
  {
    title: 'Implement Room Manager (In-Memory)',
    labels: ['track:backend', 'priority:high'],
    body: `### Description
Implement the \`RoomManager\` class in \`server/src/websocket/room-manager.ts\`.

### Acceptance Criteria
- Rooms stored in a \`Map<string, Set<WebSocket>>\`
- \`createOrJoin(roomId, ws)\` — adds user to room, creates if needed
- \`leave(roomId, ws)\` — removes user, destroys room if empty
- \`broadcast(roomId, message, sender)\` — sends to all room members except sender
- \`getRoomSize(roomId)\` — returns number of users
- Room is auto-destroyed when last user disconnects
- Unit tests for all methods`
  },
  {
    title: 'Implement WebSocket Message Handler',
    labels: ['track:backend', 'priority:high'],
    body: `### Description
Implement the WebSocket handler in \`server/src/websocket/handler.ts\`.

### Acceptance Criteria
- Handles incoming WebSocket connections
- Routes messages by type: \`join\`, \`message\`, \`key-exchange\`, \`leave\`
- Validates message format (JSON with \`type\` field)
- Broadcasts encrypted messages to room members
- Handles disconnection/cleanup
- Logs connections and disconnections`
  },
  {
    title: 'Implement Rate Limiter Middleware',
    labels: ['track:backend', 'priority:medium'],
    body: `### Description
Implement per-IP and per-connection rate limiting in \`server/src/middleware/rate-limiter.ts\`.

### Acceptance Criteria
- Max 30 messages per 10 seconds per connection
- Max 5 room creations per minute per IP
- Returns error message to client when rate limited
- Sliding window or token bucket algorithm
- Configurable limits via environment variables`
  },
  {
    title: 'Add Security Headers Middleware',
    labels: ['track:backend', 'priority:medium'],
    body: `### Description
Add security headers middleware in \`server/src/middleware/security.ts\`.

### Acceptance Criteria
- Sets \`X-Content-Type-Options: nosniff\`
- Sets \`X-Frame-Options: DENY\`
- Sets \`Strict-Transport-Security\` header
- Sets \`Content-Security-Policy\` for the app
- Removes \`X-Powered-By\` header`
  },
  {
    title: 'Implement WebSocket Heartbeat (Ping/Pong) & Dead Connection Reaping',
    labels: ['track:backend', 'priority:high'],
    body: `### Description
Implement automatic ping/pong heartbeats to detect and disconnect dead/stale WebSocket clients.

### Acceptance Criteria
- Server sends periodic ping (every 30 seconds)
- If client fails to reply with pong within 10 seconds, terminate socket
- Cleans up client from RoomManager immediately upon socket termination
- Avoids memory leaks from dangling connections`
  },
  {
    title: 'Implement WebSocket Payload Schema Validator',
    labels: ['track:backend', 'good first issue', 'priority:medium'],
    body: `### Description
Add strict runtime JSON schema validation on all incoming WebSocket messages.

### Acceptance Criteria
- Validates incoming message shapes (\`join\`, \`message\`, \`key-exchange\`)
- Drops invalid or oversized payloads immediately before broadcasting
- Returns structured error frame to sender without crashing the relay`
  },

  // FRONTEND
  {
    title: 'Create Landing Page (Home)',
    labels: ['track:frontend', 'good first issue', 'priority:high'],
    body: `### Description
Build the landing page at \`client/src/pages/Home.tsx\`.

### Acceptance Criteria
- ChatterRoom logo/title
- Brief description of what the app does
- "Create Room" button that generates a room with a random key in the URL hash
- Clean, responsive design with Tailwind CSS
- Dark mode by default (pirate theme 🏴‍☠️)
- Mobile responsive`
  },
  {
    title: 'Build Chat Window Component',
    labels: ['track:frontend', 'priority:high'],
    body: `### Description
Build the main chat message display in \`client/src/components/ChatWindow.tsx\`.

### Acceptance Criteria
- Displays messages in a scrollable container
- Auto-scrolls to latest message
- Shows sender name, message text, timestamp
- Differentiates own messages (right-aligned) from others (left-aligned)
- Shows system messages (user joined/left) in center
- Handles empty state ("No messages yet")`
  },
  {
    title: 'Build Message Input Component',
    labels: ['track:frontend', 'good first issue', 'priority:high'],
    body: `### Description
Build the message input bar in \`client/src/components/MessageInput.tsx\`.

### Acceptance Criteria
- Text input with send button
- Send on Enter key press
- Shift+Enter for new line
- Disable send when input is empty
- Character limit indicator (optional)
- Shows encryption lock icon 🔒`
  },
  {
    title: 'Build Room Header Component',
    labels: ['track:frontend', 'priority:medium'],
    body: `### Description
Build the room header in \`client/src/components/RoomHeader.tsx\`.

### Acceptance Criteria
- Shows room name/ID
- Shows number of connected users
- "Copy Link" button to share room URL
- "Leave Room" button
- Encryption status indicator (🔒 E2E Encrypted)`
  },
  {
    title: 'Implement useWebSocket Custom Hook',
    labels: ['track:frontend', 'priority:high'],
    body: `### Description
Implement the \`useWebSocket\` custom hook in \`client/src/hooks/useWebSocket.ts\`.

### Acceptance Criteria
- Connects to WebSocket server at \`/ws/:roomId\`
- Handles connection, disconnection, reconnection
- Exposes: \`sendMessage()\`, \`isConnected\`, \`messages[]\`
- Auto-reconnect with exponential backoff
- Cleans up on component unmount`
  },
  {
    title: 'Implement useCrypto Custom Hook',
    labels: ['track:frontend', 'track:crypto', 'priority:high'],
    body: `### Description
Implement the \`useCrypto\` hook in \`client/src/hooks/useCrypto.ts\`.

### Acceptance Criteria
- Generates ECDH key pair on mount
- Derives shared key from room key in URL hash
- Provides \`encryptMessage(plaintext)\` and \`decryptMessage(ciphertext)\` functions
- Uses \`@chatterroom/crypto\` package`
  },
  {
    title: 'Add Dark Mode / Pirate Theme Styling',
    labels: ['track:frontend', 'good first issue', 'priority:low'],
    body: `### Description
Design a dark pirate-themed UI for ChatterRoom.

### Acceptance Criteria
- Dark background with accent colors
- Pirate-themed UI elements (optional skull, anchor icons)
- Tailwind dark mode classes
- Smooth transitions
- Accessible contrast ratios (WCAG AA)`
  },
  {
    title: 'Mobile Layout Optimization & Touch Navigation',
    labels: ['track:frontend', 'good first issue', 'priority:medium'],
    body: `### Description
Optimize the chat room layout specifically for mobile screens (iOS & Android browsers).

### Acceptance Criteria
- Keyboard opening doesn't break fixed message input
- 100vh viewport height fix for mobile Safari / Chrome
- Compact room header on smaller screens
- Smooth touch scrolling for message feed`
  },
  {
    title: 'Accessibility (a11y) & Keyboard Shortcuts',
    labels: ['track:frontend', 'good first issue', 'priority:medium'],
    body: `### Description
Add full accessibility support and keyboard navigation to ChatterRoom.

### Acceptance Criteria
- ARIA live region for incoming new chat messages
- Focus trap and Escape key handling for room leaving / modal dialogues
- Full tab-index navigation across input, send button, and copy link`
  },
  {
    title: 'Multi-language Localization (English & Swahili Support)',
    labels: ['track:frontend', 'good first issue', 'priority:low'],
    body: `### Description
Add localization support starting with English and Swahili (Kiswahili) UI labels.

### Acceptance Criteria
- JSON translation dictionary for UI labels ("Tengeneza Chumba", "Tuma Ujumbe", "Imeingia")
- Language selector toggle in header
- Persistent language choice in localStorage`
  },
  {
    title: 'Audio Feedback for Sent & Received Messages',
    labels: ['track:frontend', 'good first issue', 'priority:low'],
    body: `### Description
Add subtle audio chimes when a message is sent or received.

### Acceptance Criteria
- Lightweight synthesized audio or small sound assets
- Toggle switch in header to mute/unmute sounds
- Default state is unmuted or respects system preferences`
  },

  // QA & DEVOPS
  {
    title: 'Set Up GitHub Actions CI Pipeline',
    labels: ['track:qa-devops', 'good first issue', 'priority:high'],
    body: `### Description
Verify and expand CI in \`.github/workflows/ci.yml\`.

### Acceptance Criteria
- Runs on push to \`main\` and all PRs
- Installs pnpm, Node 18
- Runs \`pnpm lint\`, \`pnpm test\`, \`pnpm build\`
- Fails PR if any check fails
- Caches pnpm store for faster runs`
  },
  {
    title: 'Write Unit Tests for Crypto Package',
    labels: ['track:qa-devops', 'track:crypto', 'priority:high'],
    body: `### Description
Write comprehensive unit tests for \`packages/crypto/\`.

### Acceptance Criteria
- Tests for key pair generation
- Tests for ECDH shared secret derivation (bidirectional)
- Tests for AES-GCM encrypt/decrypt roundtrip
- Tests for key export/import
- Tests for edge cases (empty string, large message, unicode)
- Uses Vitest`
  },
  {
    title: 'Set Up Production Docker & Docker Compose',
    labels: ['track:qa-devops', 'priority:medium'],
    body: `### Description
Harden production Docker setup.

### Acceptance Criteria
- Multi-stage Dockerfile (build + production)
- \`docker-compose.yml\` for local dev
- Both client and server containerized
- Production image is under 100MB
- Health check configured`
  },
  {
    title: 'Add Automated E2E Tests for Chat Flow',
    labels: ['track:qa-devops', 'priority:medium'],
    body: `### Description
Write end-to-end tests for the core chat flow.

### Acceptance Criteria
- Test: Create room → Open in two tabs → Send message → Received by other tab
- Test: User leaves → Room user count updates
- Test: Last user leaves → Room is destroyed
- Uses Playwright`
  },
  {
    title: 'WebSocket Concurrency & Load Benchmark',
    labels: ['track:qa-devops', 'track:backend', 'priority:medium'],
    body: `### Description
Create a load testing script to test how many concurrent WebSocket connections the relay can support.

### Acceptance Criteria
- Simulates 50, 100, and 500 concurrent WebSocket connections across 20 rooms
- Measures message latency and CPU/RAM usage
- Documents benchmarks in \`docs/PERFORMANCE.md\``
  },

  // DOCS
  {
    title: 'Write Setup Guide for New Contributors',
    labels: ['track:docs', 'good first issue', 'priority:high'],
    body: `### Description
Write a step-by-step guide for new contributors to get the project running locally.

### Acceptance Criteria
- Covers: Windows, macOS, Linux
- Prerequisites: Node.js, pnpm, Git
- Screenshots of the app running
- Common troubleshooting section
- Links to relevant docs`
  },
  {
    title: 'Create Architecture Diagrams',
    labels: ['track:docs', 'priority:medium'],
    body: `### Description
Create visual diagrams for the architecture document.

### Acceptance Criteria
- System overview diagram
- Encryption flow diagram
- WebSocket message flow
- Room lifecycle state diagram
- Use Mermaid format in docs`
  },
  {
    title: 'Design Logo, Favicon and Branding Assets',
    labels: ['track:docs', 'priority:low'],
    body: `### Description
Design a logo and visual brand for ChatterRoom.

### Acceptance Criteria
- Logo (SVG format)
- Color palette definition
- Favicon
- Social preview image (1280x640 for GitHub)
- Pirate theme is encouraged! 🏴‍☠️`
  },
  {
    title: 'Create Project Landing / Documentation Page',
    labels: ['track:docs', 'track:frontend', 'priority:low'],
    body: `### Description
Build a documentation/showcase page for ChatterRoom.

### Acceptance Criteria
- Hero section with app description
- Feature highlights with icons
- "Try it" button linking to the app
- Tech stack section
- Contributor credits`
  }
];

console.log(`\n🚀 Creating ${allIssues.length} issues on ${REPO}...`);

let createdCount = 0;
for (const issue of allIssues) {
  const tempFile = 'temp_issue_body.txt';
  fs.writeFileSync(tempFile, issue.body, 'utf8');

  const labelArgs = issue.labels.map(l => `--label "${l}"`).join(' ');
  const cmd = `gh issue create -R ${REPO} --title "${issue.title}" --body-file "${tempFile}" ${labelArgs}`;

  try {
    const out = execSync(cmd).toString().trim();
    console.log(`✅ [${++createdCount}/${allIssues.length}] ${issue.title} -> ${out}`);
  } catch (err) {
    console.error(`❌ Failed on "${issue.title}":`, err.message);
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
}

console.log(`\n🎉 Successfully published ${createdCount} issues on GitHub!`);
