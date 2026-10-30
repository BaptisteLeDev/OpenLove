const UNKNOWN = "unknown";

// Behind a proxy the first x-forwarded-for hop is the client; spoofable, so only a limiter key.
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  return headers.get("x-real-ip")?.trim() || UNKNOWN;
}
