# Contributing Guide

This project follows a strict **Fork and Pull Request** workflow. Direct pushes to `main` are restricted.

## Workflow

1. **Fork** the repository to your personal GitHub account.
2. **Claim an Issue**: Do not write code without an assigned issue. Comment `I'd like to claim this` on the issue.
3. **Branch**: Create a branch off `main` following the naming convention:
   - `feat/<feature-name>`
   - `fix/<bug-name>`
   - `docs/<topic>`
4. **Develop & Test**:
   ```bash
   pnpm install
   pnpm lint
   pnpm test
   ```
5. **Commit**: Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
6. **Pull Request**: Open a PR back to `PiratesOfDevs/ChatterRoom:main`. Reference the issue (e.g., `Closes #12`).

## Claim Policy

- An assigned issue must have a Draft PR within **72 hours**.
- Inactive claims after 72 hours are unassigned and reopened for other contributors.

## PR Acceptance Criteria

- Code passes TypeScript compilation and linting (`pnpm lint`).
- Unit tests pass (`pnpm test`).
- No extraneous dependencies.
- Changes align strictly with the issue scope.
