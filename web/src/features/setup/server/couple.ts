import "server-only";
import { adminClient } from "@/shared/supabase/server";

export async function hasCouple(): Promise<boolean> {
  const { count, error } = await adminClient()
    .from("couples")
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(`couples count failed: ${error.message}`);
  return (count ?? 0) > 0;
}
