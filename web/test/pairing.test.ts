// @vitest-environment node
import { createHash, randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { POST } from "@/app/api/pairing/route";
import { createPairingCode } from "@/features/couple/server/pairing";
import { sessionResponse } from "@/shared/contracts/session";
import type { Partner } from "@/shared/supabase/server";

import { ensureUser, localAdmin, SEED, seed } from "../scripts/seed";

vi.mock("server-only", () => ({}));

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
// vitest drops console output of fully skipped files.
if (!up)
  process.stderr.write(
    "pairing tests skipped: local Supabase unreachable. Run: npx supabase start\n",
  );

const sha256 = (code: string) => createHash("sha256").update(code).digest("hex");

// Random IP per call: the limiter counts per client and must not leak between tests.
function exchange(code: string, ip = randomUUID()): Promise<Response> {
  return POST(
    new Request("http://x/api/pairing", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify({ code }),
    }),
  );
}

describe.skipIf(!up)("POST /api/pairing", () => {
  let partner: Partner;
  let strangerId: string;

  beforeAll(async () => {
    const admin = localAdmin();
    const { coupleId } = await seed(admin);
    partner = { userId: await ensureUser(admin, SEED.emails.a), coupleId, role: "partner_a" };
    strangerId = await ensureUser(admin, SEED.emails.stranger);
  });

  test("valid code -> 200 with a session for the partner", async () => {
    const { code } = await createPairingCode(partner);
    const res = await exchange(code);
    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(sessionResponse.safeParse(data).success).toBe(true);
    const anon = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: user } = await anon.auth.getUser(data.accessToken);
    expect(user.user?.email).toBe(SEED.emails.a);
  });

  test("reused code -> 401 unauthorized", async () => {
    const { code } = await createPairingCode(partner);
    expect((await exchange(code)).status).toBe(200);
    const res = await exchange(code);
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe("unauthorized");
  });

  test("expired code -> 401", async () => {
    const { code } = await createPairingCode(partner);
    const admin = localAdmin();
    const past = new Date(Date.now() - 60_000).toISOString();
    const upd = await admin
      .from("pairing_codes")
      .update({ expires_at: past })
      .eq("code_hash", sha256(code));
    expect(upd.error).toBeNull();
    expect((await exchange(code)).status).toBe(401);
  });

  test("two concurrent exchanges of one code -> exactly one session", async () => {
    const { code } = await createPairingCode(partner);
    const results = await Promise.all([exchange(code), exchange(code)]);
    expect(results.map((r) => r.status).sort((a, b) => a - b)).toEqual([200, 401]);
  });

  test("code for a user no longer in couple_members -> 401", async () => {
    const admin = localAdmin();
    const code = randomUUID() + randomUUID();
    const { error } = await admin.from("pairing_codes").insert({
      code_hash: sha256(code),
      user_id: strangerId,
      expires_at: new Date(Date.now() + 60_000).toISOString(),
    });
    expect(error).toBeNull();
    expect((await exchange(code)).status).toBe(401);
  });

  test("new code for a partner invalidates the previous one", async () => {
    const first = await createPairingCode(partner);
    await createPairingCode(partner);
    expect((await exchange(first.code)).status).toBe(401);
  });

  test("11 attempts from one IP -> 429 rate_limited", async () => {
    const ip = randomUUID();
    let last: Response = new Response();
    for (let i = 0; i < 11; i++) last = await exchange(`bad-code-${i}-xxxxxxxx`, ip);
    expect(last.status).toBe(429);
    expect((await last.json()).error.code).toBe("rate_limited");
  });
});
