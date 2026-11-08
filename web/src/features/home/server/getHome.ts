import type { SupabaseClient } from "@supabase/supabase-js";

import { type Milestone, milestone, todayIn } from "../domain/milestone";
import { type UpcomingDate, upcomingDate } from "../domain/upcomingDate";

export type Home = { milestone: Milestone; upcomingDate: UpcomingDate | null };

// RLS hides other partner's private dates, not filtered here.
export async function getHome(
  sb: SupabaseClient,
  coupleId: string,
  now = new Date(),
): Promise<Home> {
  const couple = await sb
    .from("couples")
    .select("start_date, time_zone")
    .eq("id", coupleId)
    .single();
  if (couple.error) throw couple.error;
  const dates = await sb.from("special_dates").select("label, date").eq("couple_id", coupleId);
  if (dates.error) throw dates.error;
  const today = todayIn(couple.data.time_zone, now);
  return {
    milestone: milestone(couple.data.start_date, today),
    upcomingDate: upcomingDate(dates.data, today),
  };
}

export async function getPartnerNames(
  sb: SupabaseClient,
  coupleId: string,
): Promise<{ a: string; b: string }> {
  const { data, error } = await sb
    .from("couples")
    .select("partner_a_name, partner_b_name")
    .eq("id", coupleId)
    .single();
  if (error) throw error;
  return { a: data.partner_a_name, b: data.partner_b_name };
}
