import type { WebSocket } from 'ws';
import type { FastifyRequest } from 'fastify';
import { RoomManager } from './room-manager.js';
import { checkRateLimit } from '../middleware/rate-limiter.js';
import { logger } from '../utils/logger.js';

const roomManager = new RoomManager();

interface IncomingMessage {
  type: string;
  roomId?: string;
  data?: unknown;
}

/**
 * Handle a new WebSocket connection.
 *
 * @param socket - The WebSocket connection
 * @param req - The originating Fastify request
 */
export const handleWebSocketConnection = (socket: WebSocket, req: FastifyRequest): void => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const roomId = url.searchParams.get('room');
  const clientIp = req.ip;

  if (!roomId) {
    socket.close(4000, 'Missing room ID');
    return;
  }

  logger.info(`Client connected to room ${roomId} from ${clientIp}`);
  roomManager.joinRoom(roomId, socket);

  socket.on('message', (raw: Buffer) => {
    // Rate limiting
    if (!checkRateLimit(clientIp)) {
      socket.send(JSON.stringify({ type: 'error', data: 'Rate limit exceeded' }));
      return;
    }

    try {
      const message = JSON.parse(raw.toString()) as IncomingMessage;
      onMessage(roomId, socket, message);
    } catch {
      logger.warn(`Malformed message from ${clientIp}`);
    }
  });

  socket.on('close', () => {
    onClose(roomId, socket);
  });

  socket.on('error', (err) => {
    logger.error(`WebSocket error in room ${roomId}:`, err);
  });
};

/**
 * Handle an incoming message from a client.
 *
 * @param roomId - The room the message was sent in
 * @param sender - The sending WebSocket
 * @param message - The parsed message payload
 */
const onMessage = (roomId: string, sender: WebSocket, message: IncomingMessage): void => {
  switch (message.type) {
    case 'chat':
      // Broadcast encrypted message to all other participants
      roomManager.broadcastToRoom(roomId, JSON.stringify(message), sender);
      break;
    default:
      logger.warn(`Unknown message type: ${message.type}`);
  }
};

/**
 * Handle a client disconnecting from a room.
 *
 * @param roomId - The room the client was in
 * @param socket - The disconnecting WebSocket
 */
const onClose = (roomId: string, socket: WebSocket): void => {
  logger.info(`Client disconnected from room ${roomId}`);
  roomManager.leaveRoom(roomId, socket);
};
