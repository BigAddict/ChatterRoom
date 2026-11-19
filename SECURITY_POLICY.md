# Security Policy

## Core Tenets

1. **Client-Side Cryptography**: Encryption and decryption execute solely inside the client's browser using `crypto.subtle`.
2. **Zero Plaintext Transmission**: Only encrypted payloads and routing identifiers cross the network boundary.
3. **Zero Persistence**: The WebSocket server maintains ephemeral room state in memory. No database, logs, or disk caches store messages.
4. **URL Hash Secrecy**: Shared room keys are conveyed in URL hash fragments (`#...`), which are never dispatched to HTTP servers.

## Reporting Vulnerabilities

Do not open public GitHub issues for security vulnerabilities. Report disclosures directly to project maintainers via GitHub Private Vulnerability Reporting or repository contacts.
