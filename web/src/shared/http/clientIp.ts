const UNKNOWN = "unknown";

// Rightmost XFF hop = added by our own proxy (Vercel, nginx append);
// hops to its left come from the client. Only a limiter key.
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  if (forwarded) return forwarded;
  return headers.get("x-real-ip")?.trim() || UNKNOWN;
}
