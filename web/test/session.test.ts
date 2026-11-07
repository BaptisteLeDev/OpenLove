// @vitest-environment node
import { randomUUID } from "node:crypto";

import { beforeAll, describe, expect, test, vi } from "vitest";

import { GET as home } from "@/app/api/home/route";
import { POST as refresh } from "@/app/api/session/refresh/route";
import { POST as signIn } from "@/app/api/session/route";
import { sessionResponse } from "@/shared/contracts/session";

import { SEED, ensureUser, localAdmin, seed } from "../scripts/seed";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [], set: () => {} }),
}));

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
    "session tests skipped: local Supabase unreachable. Run: npx supabase start\n",
  );

// Random IP per call: the limiter counts per client and must not leak between tests.
const post = (POST: typeof signIn, body: unknown): Promise<Response> =>
  POST(
    new Request("http://x/api/session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": randomUUID(),
      },
      body: JSON.stringify(body),
    }),
  );
const login = (email: string, password: string) => post(signIn, { email, password });
const homeWith = (token: string) =>
  home(
    new Request("http://x/api/home", {
      headers: { authorization: `Bearer ${token}` },
    }),
  );

describe.skipIf(!up)("POST /api/session and /api/session/refresh", () => {
  beforeAll(async () => {
    const admin = localAdmin();
    await seed(admin);
    await ensureUser(admin, SEED.emails.stranger);
  });

  test("partner credentials -> session usable as Bearer", async () => {
    const res = await login(SEED.emails.a, SEED.password);
    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(sessionResponse.safeParse(data).success).toBe(true);
    expect((await homeWith(data.accessToken)).status).toBe(200);
  });

  test("wrong password -> 401 unauthorized", async () => {
    const res = await login(SEED.emails.a, "wrong-password");
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe("unauthorized");
  });

  test("account outside the couple -> 403, no session leaked", async () => {
    const res = await login(SEED.emails.stranger, SEED.password);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe("not_couple_member");
    expect(body.data).toBeUndefined();
  });

  test("refresh -> new session usable as Bearer", async () => {
    const { data } = await (await login(SEED.emails.a, SEED.password)).json();
    const res = await post(refresh, { refreshToken: data.refreshToken });
    expect(res.status).toBe(200);
    const next = (await res.json()).data;
    expect((await homeWith(next.accessToken)).status).toBe(200);
  });

  test("garbage refresh token -> 401", async () => {
    expect((await post(refresh, { refreshToken: "garbage" })).status).toBe(401);
  });
});
