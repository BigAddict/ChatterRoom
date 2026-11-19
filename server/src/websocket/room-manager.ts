import type { WebSocket } from 'ws';
import { logger } from '../utils/logger.js';

interface Room {
  id: string;
  clients: Set<WebSocket>;
  createdAt: number;
}

/**
 * In-memory manager for chat rooms.
 * Rooms are created on first join and destroyed when the last user leaves.
 */
export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  /**
   * Create a new room or return an existing one.
   *
   * @param roomId - Unique room identifier
   * @returns The created or existing Room
   */
  createRoom(roomId: string): Room {
    if (!this.rooms.has(roomId)) {
      const room: Room = {
        id: roomId,
        clients: new Set(),
        createdAt: Date.now(),
      };
      this.rooms.set(roomId, room);
      logger.info(`Room ${roomId} created`);
    }
    return this.rooms.get(roomId)!;
  }

  /**
   * Add a client to a room, creating it if necessary.
   *
   * @param roomId - The room to join
   * @param client - The WebSocket client
   */
  joinRoom(roomId: string, client: WebSocket): void {
    const room = this.createRoom(roomId);
    room.clients.add(client);
    logger.info(`Client joined room ${roomId} (${room.clients.size} users)`);

    // Notify everyone in the room about the updated user count
    this.broadcastRoomInfo(roomId);
  }

  /**
   * Remove a client from a room. Destroys the room if empty.
   *
   * @param roomId - The room to leave
   * @param client - The WebSocket client
   */
  leaveRoom(roomId: string, client: WebSocket): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.clients.delete(client);
    logger.info(`Client left room ${roomId} (${room.clients.size} users remaining)`);

    if (room.clients.size === 0) {
      this.destroyRoom(roomId);
    } else {
      this.broadcastRoomInfo(roomId);
    }
  }

  /**
   * Broadcast a message to all clients in a room, optionally excluding the sender.
   *
   * @param roomId - The room to broadcast in
   * @param message - The serialised message string
   * @param exclude - Optional WebSocket to exclude from the broadcast
   */
  broadcastToRoom(roomId: string, message: string, exclude?: WebSocket): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (const client of room.clients) {
      if (client !== exclude && client.readyState === 1 /* WebSocket.OPEN */) {
        client.send(message);
      }
    }
  }

  /**
   * Destroy a room and remove it from the registry.
   *
   * @param roomId - The room to destroy
   */
  destroyRoom(roomId: string): void {
    this.rooms.delete(roomId);
    logger.info(`Room ${roomId} destroyed`);
  }

  /**
   * Broadcast updated room info (e.g. user count) to all clients.
   *
   * @param roomId - The room to broadcast info for
   */
  private broadcastRoomInfo(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const info = JSON.stringify({
      type: 'room_info',
      data: { userCount: room.clients.size },
    });

    this.broadcastToRoom(roomId, info);
  }
}
