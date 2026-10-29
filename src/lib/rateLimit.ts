/**
 * In-memory sliding window rate limiter & brute force security lockout.
 * Runs efficiently in Cloudflare Workers / Edge / Node.js runtimes.
 */

interface RateLimitRecord {
  count: number;
  firstRequest: number;
  lockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired records every 5 minutes to prevent memory growth
let lastCleanup = Date.now();
function cleanupStore() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.lockedUntil && record.lockedUntil < now) {
      rateLimitStore.delete(key);
    } else if (now - record.firstRequest > 30 * 60 * 1000) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  lockoutMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
  lockedUntil?: number;
  error?: string;
}

/**
 * Standard sliding-window rate limit checker.
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  cleanupStore();

  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (record) {
    // Check if key is currently locked out
    if (record.lockedUntil && record.lockedUntil > now) {
      const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds,
        lockedUntil: record.lockedUntil,
        error: `Security lockout active: Too many requests. Please wait ${retryAfterSeconds} seconds before retrying.`,
      };
    }

    // If window expired, reset
    if (now - record.firstRequest > options.windowMs) {
      rateLimitStore.set(key, { count: 1, firstRequest: now });
      return { allowed: true, remaining: options.maxRequests - 1 };
    }

    // Increment count
    record.count += 1;

    if (record.count > options.maxRequests) {
      const lockoutMs = options.lockoutMs || options.windowMs;
      record.lockedUntil = now + lockoutMs;
      const retryAfterSeconds = Math.ceil(lockoutMs / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds,
        lockedUntil: record.lockedUntil,
        error: `Security lockout active: Request limit exceeded. Suspended for ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
      };
    }

    return { allowed: true, remaining: options.maxRequests - record.count };
  }

  // First request
  rateLimitStore.set(key, { count: 1, firstRequest: now });
  return { allowed: true, remaining: options.maxRequests - 1 };
}

/**
 * Specifically tracks failed authentication / brute-force attempts.
 * Max 5 failed attempts per 15 minutes before triggering a 15-minute security lockout.
 */
export function recordFailedAuth(
  key: string,
  maxFailures = 5,
  windowMs = 15 * 60 * 1000,
  lockoutMs = 15 * 60 * 1000
): { locked: boolean; remaining: number; retryAfterSeconds?: number; error?: string } {
  cleanupStore();
  const now = Date.now();
  const record = rateLimitStore.get(`auth_fail:${key}`);

  if (record) {
    if (record.lockedUntil && record.lockedUntil > now) {
      const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return {
        locked: true,
        remaining: 0,
        retryAfterSeconds,
        error: `Security lockout: Account login suspended for ${Math.ceil(retryAfterSeconds / 60)} minute(s) due to multiple failed attempts.`,
      };
    }

    if (now - record.firstRequest > windowMs) {
      rateLimitStore.set(`auth_fail:${key}`, { count: 1, firstRequest: now });
      return { locked: false, remaining: maxFailures - 1 };
    }

    record.count += 1;
    if (record.count >= maxFailures) {
      record.lockedUntil = now + lockoutMs;
      const retryAfterSeconds = Math.ceil(lockoutMs / 1000);
      return {
        locked: true,
        remaining: 0,
        retryAfterSeconds,
        error: `Security lockout triggered: 5 consecutive failed login attempts detected. Access suspended for ${Math.ceil(retryAfterSeconds / 60)} minutes to protect your account.`,
      };
    }

    return { locked: false, remaining: maxFailures - record.count };
  }

  rateLimitStore.set(`auth_fail:${key}`, { count: 1, firstRequest: now });
  return { locked: false, remaining: maxFailures - 1 };
}

/**
 * Checks if an auth key is currently locked out.
 */
export function isAuthLocked(key: string): { locked: boolean; retryAfterSeconds?: number; error?: string } {
  const now = Date.now();
  const record = rateLimitStore.get(`auth_fail:${key}`);
  if (record?.lockedUntil && record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      locked: true,
      retryAfterSeconds,
      error: `Security lockout active: Too many failed attempts. Try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
    };
  }
  return { locked: false };
}

/**
 * Clears failed attempts upon successful authentication.
 */
export function clearFailedAuth(key: string): void {
  rateLimitStore.delete(`auth_fail:${key}`);
}
