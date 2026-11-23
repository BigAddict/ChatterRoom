const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/** Maximum messages per window. */
const MAX_MESSAGES = 30;

/** Time window in milliseconds. */
const WINDOW_MS = 10_000;

/**
 * Simple per-IP rate limiter.
 * Returns true if the request is within limits, false if rate-limited.
 *
 * @param ip - The client IP address
 * @returns Whether the message is allowed
 */
export const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  entry.count++;
  if (entry.count > MAX_MESSAGES) {
    return false;
  }

  return true;
};

/**
 * Clean up stale entries from the rate limit map.
 * Should be called periodically to prevent memory leaks.
 */
export const cleanupRateLimits = (): void => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
};

// Clean up every 60 seconds without keeping the event loop alive on shutdown
setInterval(cleanupRateLimits, 60_000).unref();
