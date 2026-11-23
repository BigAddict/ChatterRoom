import { pathToFileURL } from 'node:url';
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { handleWebSocketConnection } from './websocket/handler.js';
import { applySecurity } from './middleware/security.js';
import { logger } from './utils/logger.js';

const DEFAULT_PORT = 3001;

/**
 * Parse and validate a TCP port number, falling back to the default port.
 */
export const parsePort = (rawPort: string | undefined): number => {
  const parsed = Number.parseInt(rawPort ?? String(DEFAULT_PORT), 10);
  if (Number.isFinite(parsed) && parsed > 0 && parsed <= 65535) {
    return parsed;
  }
  return DEFAULT_PORT;
};

export interface ServerOptions {
  clientUrl?: string;
}

/**
 * Create and configure the Fastify server with CORS, security headers,
 * health check, and WebSocket upgrade routes.
 */
export const buildServer = async (options: ServerOptions = {}): Promise<FastifyInstance> => {
  const clientUrl = options.clientUrl ?? process.env.CLIENT_URL ?? 'http://localhost:5173';
  const app = Fastify({ logger: false });

  // Register CORS
  await app.register(cors, {
    origin: clientUrl,
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

  // WebSocket routes (/ws/:roomId per spec, plus /ws?room=... for backward compatibility)
  app.get('/ws/:roomId', { websocket: true }, (connection, req) => {
    handleWebSocketConnection(connection.socket, req);
  });

  app.get('/ws', { websocket: true }, (connection, req) => {
    handleWebSocketConnection(connection.socket, req);
  });

  return app;
};

/**
 * Register SIGTERM and SIGINT handlers for graceful server shutdown.
 */
const registerShutdownHandlers = (app: FastifyInstance): void => {
  let isShuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await app.close();
      logger.info('Server closed cleanly');
      process.exit(0);
    } catch (err) {
      logger.error('Error during graceful shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
};

/**
 * Bootstrap and start the Fastify server with WebSocket support.
 */
const start = async (): Promise<void> => {
  const port = parsePort(process.env.PORT);
  const app = await buildServer();
  registerShutdownHandlers(app);

  try {
    await app.listen({ port, host: '0.0.0.0' });
    logger.info(`ChatterRoom server listening on port ${port}`);
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

const isMainModule =
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  void start();
}
