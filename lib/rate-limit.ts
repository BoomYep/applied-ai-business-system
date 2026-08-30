// Simple in-memory rate limiter for demo purposes
// Note: In-memory state resets on serverless cold starts
// Production deployments should use a shared store like Redis or Upstash

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const REQUESTS_PER_WINDOW = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

// Clean up expired entries to prevent unbounded memory growth
function cleanupExpired(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}

// Run cleanup periodically (every 5 minutes)
setInterval(cleanupExpired, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  secondsUntilReset: number;
}

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + WINDOW_MS;
    store.set(identifier, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      remaining: REQUESTS_PER_WINDOW - 1,
      resetAt,
      secondsUntilReset: Math.ceil(WINDOW_MS / 1000),
    };
  }

  if (entry.count >= REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      secondsUntilReset: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count++;
  store.set(identifier, entry);

  return {
    allowed: true,
    remaining: REQUESTS_PER_WINDOW - entry.count,
    resetAt: entry.resetAt,
    secondsUntilReset: Math.ceil((entry.resetAt - now) / 1000),
  };
}
