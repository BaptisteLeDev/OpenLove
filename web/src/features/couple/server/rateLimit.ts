import "server-only";
import { adminClient } from "@/shared/supabase/server";

// Postgres fixed window: shared across instances. true = allowed.
export async function hitRateLimit(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await adminClient().rpc("hit_rate_limit", {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) throw error;
  return data === true;
}
