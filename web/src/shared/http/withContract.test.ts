import { beforeEach, expect, test, vi } from "vitest";
import { z } from "zod";

import { getPartner } from "@/shared/supabase/server";

import { withContract } from "./withContract";

vi.mock("@/shared/supabase/server", () => ({ getPartner: vi.fn() }));

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://x/api/t", { method: "POST", body: JSON.stringify(body), headers });

beforeEach(() => {
  vi.mocked(getPartner).mockReset();
  vi.stubEnv("SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("SUPABASE_ANON_KEY", "a");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "b");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "a");
});

test("invalid body -> 400 validation_failed", async () => {
  const route = withContract(
    { input: z.object({ n: z.number() }), output: z.object({}), auth: "public" },
    () => ({}),
  );
  const res = await route(post({ n: "x" }));
  expect(res.status).toBe(400);
  expect((await res.json()).error.code).toBe("validation_failed");
});

test("GET parses search params as input", async () => {
  const route = withContract(
    { input: z.object({ q: z.string() }), output: z.object({ q: z.string() }), auth: "public" },
    ({ q }) => ({ q }),
  );
  const res = await route(new Request("http://x/api/t?q=a"));
  expect(await res.json()).toEqual({ data: { q: "a" } });
});

test("output mismatch -> 500 internal without handler data", async () => {
  const route = withContract({ output: z.object({ a: z.string() }), auth: "public" }, () => ({
    a: 1 as never,
    leak: "TOPSECRET",
  }));
  const res = await route(new Request("http://x/api/t"));
  expect(res.status).toBe(500);
  const text = await res.text();
  expect(text).not.toContain("TOPSECRET");
  expect(JSON.parse(text).error.code).toBe("internal");
});

test("thrown error -> 500 internal, no stack", async () => {
  const route = withContract({ output: z.object({}), auth: "public" }, () => {
    throw new Error("boom");
  });
  const res = await route(new Request("http://x/api/t"));
  expect(res.status).toBe(500);
  expect(await res.text()).not.toContain("boom");
});

const partner = { userId: "u1", coupleId: "c1", role: "partner_a" as const };
const member = { ok: true as const, partner };
const okRoute = () => withContract({ output: z.object({}), auth: "partner" }, () => ({}));

test("partner without token -> 401 unauthorized", async () => {
  vi.mocked(getPartner).mockResolvedValue({ ok: false, code: "unauthorized" });
  const res = await okRoute()(new Request("http://x/api/t"));
  expect(res.status).toBe(401);
  expect((await res.json()).error.code).toBe("unauthorized");
});

test("valid JWT without membership -> 403 not_couple_member", async () => {
  vi.mocked(getPartner).mockResolvedValue({ ok: false, code: "not_couple_member" });
  const res = await okRoute()(
    new Request("http://x/api/t", { headers: { Authorization: "Bearer t" } }),
  );
  expect(res.status).toBe(403);
  expect((await res.json()).error.code).toBe("not_couple_member");
});

test("partner ctx -> handler receives { partner }", async () => {
  vi.mocked(getPartner).mockResolvedValue(member);
  const route = withContract(
    { output: z.object({ coupleId: z.string() }), auth: "partner" },
    (_in, ctx) => ({ coupleId: ctx.partner.coupleId }),
  );
  const res = await route(
    new Request("http://x/api/t", { headers: { Authorization: "Bearer t" } }),
  );
  expect(await res.json()).toEqual({ data: { coupleId: "c1" } });
  expect(getPartner).toHaveBeenCalledWith("t");
});

test("cookie POST with foreign Origin -> 403 forbidden, nothing called", async () => {
  const handler = vi.fn(() => ({}));
  const route = withContract({ output: z.object({}), auth: "partner" }, handler);
  const res = await route(post({}, { Origin: "https://evil.example", Host: "x" }));
  expect(res.status).toBe(403);
  expect(await res.json()).toEqual({ error: { code: "forbidden", message: "origin mismatch" } });
  expect(handler).not.toHaveBeenCalled();
  expect(getPartner).not.toHaveBeenCalled();
});

test("cookie POST without Origin -> 403 forbidden", async () => {
  const res = await okRoute()(post({}, { Host: "x" }));
  expect(res.status).toBe(403);
  expect((await res.json()).error.code).toBe("forbidden");
});

test("cookie POST with same Origin -> 200", async () => {
  vi.mocked(getPartner).mockResolvedValue(member);
  expect((await okRoute()(post({}, { Origin: "http://x", Host: "x" }))).status).toBe(200);
});

test("x-forwarded-host wins over host", async () => {
  vi.mocked(getPartner).mockResolvedValue(member);
  const headers = {
    Origin: "https://app.example",
    Host: "localhost:3000",
    "X-Forwarded-Host": "app.example",
  };
  expect((await okRoute()(post({}, headers))).status).toBe(200);
});

test("Bearer POST without Origin -> 200 (S13 exempt)", async () => {
  vi.mocked(getPartner).mockResolvedValue(member);
  expect((await okRoute()(post({}, { Authorization: "Bearer t" }))).status).toBe(200);
});

test("cookie GET without Origin -> 200", async () => {
  vi.mocked(getPartner).mockResolvedValue(member);
  expect((await okRoute()(new Request("http://x/api/t"))).status).toBe(200);
});

test("public POST with foreign Origin -> 200", async () => {
  const route = withContract({ output: z.object({}), auth: "public" }, () => ({}));
  expect((await route(post({}, { Origin: "https://evil.example", Host: "x" }))).status).toBe(200);
});

test("public handler ctx has no user", () => {
  withContract({ output: z.object({}), auth: "public" }, (_in, ctx) => {
    // @ts-expect-error ctx.partner only exists for partner routes
    expect(ctx.partner).toBeUndefined();
    return {};
  });
});
