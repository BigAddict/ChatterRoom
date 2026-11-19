# Deployment

## Local Development

```bash
pnpm install
pnpm dev
```

- Web UI: `http://localhost:5173`
- Relay Server: `http://localhost:3001`
- Health check: `GET http://localhost:3001/health`

## Docker Deployment

Build and run both client and relay containers:

```bash
docker-compose up --build -d
```

## Production Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Fastify relay listening port | `3001` |
| `CLIENT_URL` | Allowed CORS origin for frontend | `http://localhost:5173` |
| `NODE_ENV` | Runtime environment (`development`/`production`) | `development` |
