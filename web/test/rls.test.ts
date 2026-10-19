// @vitest-environment node
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, test } from "vitest";

import { ensureUser, localAdmin, SEED, seed } from "../scripts/seed";

const url = process.env.SUPABASE_URL ?? "";
const anonKey = process.env.SUPABASE_ANON_KEY ?? "";
const OTHER = "other@example.com";

const up =
  !!url &&
  !!anonKey &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
  (await fetch(`${url}/auth/v1/health`, { headers: { apikey: anonKey } }).then(
    (r) => r.ok,
    () => false,
  ));
// vitest drops console output of fully skipped files.
if (!up)
  process.stderr.write("RLS tests skipped: local Supabase unreachable. Run: npx supabase start\n");

const anon = () => createClient(url, anonKey, { auth: { persistSession: false } });

async function signedIn(email: string): Promise<SupabaseClient> {
  const client = anon();
  const { error } = await client.auth.signInWithPassword({ email, password: SEED.password });
  if (error) throw error;
  return client;
}

async function otherCouple(admin: SupabaseClient): Promise<string> {
  const userId = await ensureUser(admin, OTHER);
  const member = await admin.from("couple_members").select("couple_id").eq("user_id", userId);
  if (member.data?.[0]) return member.data[0].couple_id;
  const couple = await admin.from("couples").insert({ start_date: "2021-06-01" }).select().single();
  if (couple.error) throw couple.error;
  const ins = await admin
    .from("couple_members")
    .insert({ user_id: userId, couple_id: couple.data.id, role: "partner_a" });
  if (ins.error) throw ins.error;
  return couple.data.id;
}

describe.skipIf(!up)("couple RLS", () => {
  let otherCoupleId = "";

  beforeAll(async () => {
    const admin = localAdmin();
    await seed(admin);
    otherCoupleId = await otherCouple(admin);
  });

  test("partner_a sees only their couple", async () => {
    const a = await signedIn(SEED.emails.a);
    const { data } = await a.from("couples").select();
    expect(data).toHaveLength(1);
    expect(data?.[0].start_date).toBe(SEED.startDate);
  });

  test("partner_a reading another couple by id gets empty, not error", async () => {
    const a = await signedIn(SEED.emails.a);
    expect((await a.from("couples").select().eq("id", otherCoupleId)).data).toEqual([]);
    const members = await a.from("couple_members").select().eq("couple_id", otherCoupleId);
    expect(members.data).toEqual([]);
    expect((await a.from("couple_members").select()).data).toHaveLength(2);
  });

  test("stranger sees nothing", async () => {
    const s = await signedIn(SEED.emails.stranger);
    expect((await s.from("couples").select()).data).toEqual([]);
    expect((await s.from("couple_members").select()).data).toEqual([]);
  });

  test("anon never gets rows", async () => {
    const { data } = await anon().from("couples").select();
    expect(data ?? []).toEqual([]);
  });

  test("partner_a cannot insert a couple", async () => {
    const a = await signedIn(SEED.emails.a);
    const { error } = await a.from("couples").insert({ start_date: "2022-01-01" });
    expect(error).not.toBeNull();
  });
});
