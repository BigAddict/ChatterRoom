import { useEffect, useRef, useState, useCallback } from 'react';

/** WebSocket connection status. */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface UseWebSocketReturn {
  /** Send a string message over the WebSocket. */
  sendMessage: (data: string) => void;
  /** Current connection status. */
  connectionStatus: ConnectionStatus;
  /** The last message received from the server. */
  lastMessage: string | null;
}

const MAX_RECONNECT_DELAY_MS = 30_000;
const BASE_RECONNECT_DELAY_MS = 1_000;

/**
 * Build the WebSocket URL for a given room ID and browser location.
 */
export const buildWebSocketUrl = (
  roomId: string,
  location: Pick<Location, 'protocol' | 'host'>,
): string => {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${location.host}/ws/${encodeURIComponent(roomId)}`;
};

/**
 * Compute exponential backoff delay in milliseconds for reconnection attempts.
 */
export const getReconnectDelay = (attempt: number): number => {
  return Math.min(BASE_RECONNECT_DELAY_MS * 2 ** Math.max(0, attempt), MAX_RECONNECT_DELAY_MS);
};

/**
 * Custom hook that manages a WebSocket connection to a chat room
 * with automatic exponential-backoff reconnection.
 *
 * @param roomId - The room identifier to connect to
 * @returns WebSocket controls and state
 */
export const useWebSocket = (roomId: string): UseWebSocketReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    let isUnmounted = false;
    let attempt = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      if (isUnmounted) return;
      const wsUrl = buildWebSocketUrl(roomId, window.location);

      setConnectionStatus('connecting');
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        attempt = 0;
        setConnectionStatus('connected');
      };
      ws.onmessage = (event) => setLastMessage(event.data as string);
      ws.onerror = () => setConnectionStatus('error');
      ws.onclose = () => {
        if (isUnmounted) {
          setConnectionStatus('disconnected');
          return;
        }
        setConnectionStatus('disconnected');
        const delay = getReconnectDelay(attempt++);
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimer !== undefined) {
        clearTimeout(reconnectTimer);
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [roomId]);

  const sendMessage = useCallback((data: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

  return { sendMessage, connectionStatus, lastMessage };
};
