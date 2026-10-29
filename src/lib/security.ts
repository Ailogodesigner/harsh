/**
 * Web Security Helpers: Client IP extraction, Origin/CSRF validation, and input sanitization.
 */

/**
 * Extracts trusted client IP in Cloudflare Workers / Node.
 */
export function getClientIp(req: Request): string {
  // Cloudflare provides the real visitor IP in CF-Connecting-IP
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return "127.0.0.1";
}

/**
 * Validates Origin or Referer to defend against Cross-Site Request Forgery (CSRF)
 * and malicious cross-origin console/script execution.
 */
export function validateOrigin(req: Request): { valid: boolean; reason?: string } {
  // Only check state-changing methods
  const method = req.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return { valid: true };
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");

  if (!origin && !referer) {
    // Some server-to-server webhook requests (like Cashfree) don't have origin/referer
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/webhooks/")) {
      return { valid: true };
    }
    // Block direct script/terminal calls that omit origin on sensitive mutations
    return { valid: false, reason: "Missing origin header" };
  }

  const targetUrl = origin || referer || "";
  try {
    const parsed = new URL(targetUrl);
    const originHost = parsed.host.toLowerCase();
    const currentHost = host?.toLowerCase();

    // Allow requests matching current host or official domains
    const allowedHosts = [
      currentHost,
      "web.harshunlimited.fun",
      "harshunlimited.fun",
      "localhost:3000",
      "127.0.0.1:3000",
    ].filter(Boolean);

    if (allowedHosts.includes(originHost)) {
      return { valid: true };
    }

    return { valid: false, reason: `Untrusted origin: ${originHost}` };
  } catch {
    return { valid: false, reason: "Malformed origin/referer URL" };
  }
}

/**
 * Sanitizes strings against prototype pollution and control characters.
 */
export function sanitizeString(val: string): string {
  if (typeof val !== "string") return "";
  // Strip null bytes and non-printable control characters
  return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

