# ChatterRoom

End-to-end encrypted, zero-storage, ephemeral WebSocket chat application.

## Overview

ChatterRoom uses client-side encryption via the Web Crypto API. Encryption keys are stored exclusively in the URL hash fragment (`#`), ensuring keys are never transmitted to the server. The backend functions strictly as an in-memory WebSocket relay without databases or message logging. All room data is discarded when participants disconnect.

## Architecture

- **Client (`client/`)**: React 18, Vite, TypeScript, Tailwind CSS. Handles key generation, message encryption, and UI.
- **Server (`server/`)**: Node.js, Fastify, WebSocket (`ws`). In-memory connection relay and room state.
- **Crypto Package (`packages/crypto/`)**: ECDH P-256 key agreement and AES-256-GCM encryption utilities via native Web Crypto API.

## Technical Specifications

- **Key Exchange**: ECDH (P-256 curve)
- **Encryption**: AES-256-GCM with a unique 12-byte initialization vector (IV) per payload
- **Key Distribution**: 256-bit room secret passed via URL hash
- **Storage**: None. Zero server persistence.

## Quick Start

### Requirements
- Node.js >= 18
- pnpm >= 8

### Setup

```bash
pnpm install
pnpm dev
```

- Client: `http://localhost:5173`
- Server: `http://localhost:3001`

### Docker

```bash
docker-compose up --build
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch strategy, issue assignment, and PR guidelines.

## License

[MIT](LICENSE)
