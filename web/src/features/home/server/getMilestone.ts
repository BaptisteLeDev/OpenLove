import { serverClient } from "@/shared/supabase/server";

import { type Milestone, milestone, todayIn } from "../domain/milestone";

export async function getMilestone(coupleId: string, now = new Date()): Promise<Milestone> {
  const sb = await serverClient();
  const { data, error } = await sb
    .from("couples")
    .select("start_date, time_zone")
    .eq("id", coupleId)
    .single();
  if (error) throw error;
  return milestone(data.start_date, todayIn(data.time_zone, now));
}
