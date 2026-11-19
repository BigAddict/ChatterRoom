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

/**
 * Custom hook that manages a WebSocket connection to a chat room.
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

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?room=${roomId}`;

    setConnectionStatus('connecting');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setConnectionStatus('connected');
    ws.onmessage = (event) => setLastMessage(event.data as string);
    ws.onerror = () => setConnectionStatus('error');
    ws.onclose = () => setConnectionStatus('disconnected');

    return () => {
      ws.close();
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
