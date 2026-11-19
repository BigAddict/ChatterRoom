import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { handleWebSocketConnection } from './websocket/handler.js';
import { applySecurity } from './middleware/security.js';
import { logger } from './utils/logger.js';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';

/**
 * Bootstrap and start the Fastify server with WebSocket support.
 */
const start = async (): Promise<void> => {
  const app = Fastify({ logger: false });

  // Register CORS
  await app.register(cors, {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  });

  // Apply security headers
  applySecurity(app);

  // Register WebSocket plugin
  await app.register(websocket);

  // Health check endpoint
  app.get('/health', async () => {
    return { status: 'ok', timestamp: Date.now() };
  });

  // WebSocket route
  app.get('/ws', { websocket: true }, (socket, req) => {
    handleWebSocketConnection(socket, req);
  });

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`ChatterRoom server listening on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
