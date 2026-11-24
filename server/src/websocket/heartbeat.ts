import type { WebSocket } from 'ws';

const PING_INTERVAL_MS = 30_000;
const PONG_TIMEOUT_MS = 10_000;

/**
 * Start a ping/pong heartbeat for one socket.
 * Terminates the socket if a ping is not answered within PONG_TIMEOUT_MS.
 * Timers are cleared automatically when the socket closes.
 *
 * @param socket - The WebSocket to monitor
 */
export const startHeartbeat = (socket: WebSocket): void => {
  let pongTimer: NodeJS.Timeout | undefined;

  const interval = setInterval(() => {
    if (socket.readyState !== socket.OPEN) return;
    socket.ping();
    pongTimer = setTimeout(() => socket.terminate(), PONG_TIMEOUT_MS);
  }, PING_INTERVAL_MS);

  socket.on('pong', () => {
    clearTimeout(pongTimer);
    pongTimer = undefined;
  });

  socket.once('close', () => {
    clearInterval(interval);
    clearTimeout(pongTimer);
  });
};