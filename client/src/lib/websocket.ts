/** WebSocket event types. */
export type WebSocketEvent = 'message' | 'user_joined' | 'user_left' | 'error' | 'room_info';

export interface WebSocketPayload {
  type: WebSocketEvent;
  data: unknown;
  timestamp: number;
}

/**
 * WebSocket client class for managing the connection to the ChatterRoom server.
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Map<WebSocketEvent, Array<(data: unknown) => void>> = new Map();

  /**
   * Create a new WebSocketClient.
   * @param url - The WebSocket server URL
   */
  constructor(url: string) {
    this.url = url;
  }

  /**
   * Open the WebSocket connection.
   */
  connect(): void {
    this.ws = new WebSocket(this.url);

    this.ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data as string) as WebSocketPayload;
        const handlers = this.listeners.get(payload.type);
        handlers?.forEach((handler) => handler(payload.data));
      } catch {
        // Ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      // TODO: implement reconnection logic
    };
  }

  /**
   * Send a payload over the WebSocket.
   * @param type - Event type
   * @param data - Payload data
   */
  send(type: WebSocketEvent, data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const payload: WebSocketPayload = { type, data, timestamp: Date.now() };
      this.ws.send(JSON.stringify(payload));
    }
  }

  /**
   * Register an event listener.
   * @param event - The event type to listen for
   * @param handler - Callback invoked with the event data
   */
  on(event: WebSocketEvent, handler: (data: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }

  /**
   * Close the WebSocket connection.
   */
  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }
}
