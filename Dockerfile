# ---- Build Stage ----
FROM node:18-alpine AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY packages/ ./packages/
COPY server/ ./server/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @chatterroom/crypto build
RUN pnpm --filter server build

# ---- Production Stage ----
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/package.json ./server/
COPY --from=build /app/packages/crypto/dist ./packages/crypto/dist
COPY --from=build /app/packages/crypto/package.json ./packages/crypto/
COPY --from=build /app/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "server/dist/index.js"]
