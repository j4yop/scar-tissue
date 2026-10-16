/**
 * Minimal in-memory IP rate limiter for the open capture endpoint.
 * Instance-local (per serverless instance) — deliberately simple for v1;
 * it stops casual abuse, not a determined attacker. Owner writes are
 * token-gated separately.
 */

const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 8;

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfterSec: 0 };
  }

  entry.count += 1;
  if (entry.count > MAX_PER_WINDOW) {
    return { ok: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSec: 0 };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
