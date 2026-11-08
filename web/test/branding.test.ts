// @vitest-environment node
import { createClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, test } from "vitest";

import { ensureUser, localAdmin, SEED, seed } from "../scripts/seed";

const url = process.env.SUPABASE_URL ?? "";
const anonKey = process.env.SUPABASE_ANON_KEY ?? "";

const up =
  !!url &&
  !!anonKey &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
  (await fetch(`${url}/auth/v1/health`, { headers: { apikey: anonKey } }).then(
    (r) => r.ok,
    () => false,
  ));
if (!up)
  process.stderr.write(
    "Branding tests skipped: local Supabase unreachable. Run: npx supabase start\n",
  );

const anon = () => createClient(url, anonKey, { auth: { persistSession: false } });
const args = (userId: string) => ({
  p_user_id: userId,
  p_partner_a_name: "Alex",
  p_partner_b_name: "Sam",
  p_start_date: "2022-01-01",
  p_seed: "#8f3f5a",
});

describe.skipIf(!up)("branding", () => {
  const admin = up ? localAdmin() : (undefined as never);
  let coupleId = "";

  beforeAll(async () => {
    coupleId = (await seed(admin)).coupleId;
  });

  test("create_couple refuses when a Couple exists", async () => {
    const userId = await ensureUser(admin, "branding@example.com");
    const { data, error } = await admin.rpc("create_couple", args(userId));
    expect(error).toBeNull();
    expect(data).toBeNull();
    const rows = await admin.from("couple_members").select().eq("user_id", userId);
    expect(rows.data).toEqual([]);
  });

  test("anon and partner cannot call create_couple", async () => {
    const userId = await ensureUser(admin, "branding@example.com");
    expect((await anon().rpc("create_couple", args(userId))).error).not.toBeNull();
    const partner = anon();
    const login = await partner.auth.signInWithPassword({
      email: SEED.emails.a,
      password: SEED.password,
    });
    expect(login.error).toBeNull();
    expect((await partner.rpc("create_couple", args(userId))).error).not.toBeNull();
  });

  test("uppercase seed rejected by DB", async () => {
    const { error } = await admin.from("couples").update({ seed: "#AABBCC" }).eq("id", coupleId);
    expect(error).not.toBeNull();
  });

  test("seed couple carries names and seed", async () => {
    const partner = anon();
    await partner.auth.signInWithPassword({ email: SEED.emails.a, password: SEED.password });
    const { data } = await partner.from("couples").select("partner_a_name, partner_b_name, seed");
    expect(data).toEqual([
      { partner_a_name: SEED.names.a, partner_b_name: SEED.names.b, seed: SEED.seed },
    ]);
  });
});
