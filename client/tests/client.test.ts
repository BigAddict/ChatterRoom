import { describe, expect, it, vi } from 'vitest';
import { buildWebSocketUrl, getReconnectDelay } from '../src/hooks/useWebSocket.js';
import { WebSocketClient } from '../src/lib/websocket.js';

describe('Client WebSocket utilities (#20)', () => {
  describe('buildWebSocketUrl', () => {
    it('uses ws: for http: and encodes the roomId in /ws/:roomId', () => {
      expect(
        buildWebSocketUrl('room 1/test', { protocol: 'http:', host: 'localhost:5173' }),
      ).toBe('ws://localhost:5173/ws/room%201%2Ftest');
    });

    it('uses wss: for https:', () => {
      expect(
        buildWebSocketUrl('abc123', { protocol: 'https:', host: 'chat.example.com' }),
      ).toBe('wss://chat.example.com/ws/abc123');
    });
  });

  describe('getReconnectDelay', () => {
    it('backs off exponentially and caps at 30 seconds', () => {
      expect(getReconnectDelay(0)).toBe(1000);
      expect(getReconnectDelay(1)).toBe(2000);
      expect(getReconnectDelay(2)).toBe(4000);
      expect(getReconnectDelay(10)).toBe(30_000);
    });
  });

  describe('WebSocketClient', () => {
    it('dispatches parsed messages to registered event listeners', () => {
      let instance: { onmessage: ((ev: { data: string }) => void) | null; send: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn>; readyState: number } | undefined;

      class MockWebSocket {
        static OPEN = 1;
        readyState = 1;
        onmessage: ((ev: { data: string }) => void) | null = null;
        onclose: (() => void) | null = null;
        send = vi.fn();
        close = vi.fn();
        constructor(public url: string) {
          instance = this;
        }
      }

      vi.stubGlobal('WebSocket', MockWebSocket);

      const client = new WebSocketClient('ws://localhost:3001/ws/test');
      const handler = vi.fn();
      client.on('room_info', handler);
      client.connect();

      instance?.onmessage?.({
        data: JSON.stringify({ type: 'room_info', data: { userCount: 2 }, timestamp: 1 }),
      });

      expect(handler).toHaveBeenCalledWith({ userCount: 2 });

      client.send('message', { text: 'hi' });
      expect(instance?.send).toHaveBeenCalledTimes(1);

      client.disconnect();
      expect(instance?.close).toHaveBeenCalledTimes(1);

      vi.unstubAllGlobals();
    });
  });
});
