const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// Simple in-memory store. This is per-instance and best-effort only,
// which is acceptable for basic abuse protection on this small site.
const requestLog = new Map<string, { count: number; windowStart: number }>();

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export function checkRateLimitForKey(key: string): RateLimitResult {
  const now = Date.now();
  const existing = requestLog.get(key);

  if (!existing) {
    requestLog.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  const { count, windowStart } = existing;

  if (now - windowStart > WINDOW_MS) {
    // New window
    requestLog.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterMs = WINDOW_MS - (now - windowStart);
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  requestLog.set(key, { count: count + 1, windowStart });
  return { allowed: true };
}
