import { beforeEach, expect, test, vi } from "vitest";
import { z } from "zod";

import { getPartner } from "@/shared/supabase/server";

import { withContract } from "./withContract";

vi.mock("@/shared/supabase/server", () => ({ getPartner: vi.fn() }));

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://x/api/t", { method: "POST", body: JSON.stringify(body), headers });

beforeEach(() => {
  vi.mocked(getPartner).mockReset();
  vi.stubEnv("CRON_SECRET", "s3cret-s3cret-s3cret");
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

test("partner without token -> 401 unauthorized", async () => {
  vi.mocked(getPartner).mockResolvedValue(null);
  const route = withContract({ output: z.object({}), auth: "partner" }, () => ({}));
  const res = await route(new Request("http://x/api/t"));
  expect(res.status).toBe(401);
  expect((await res.json()).error.code).toBe("unauthorized");
});

test("partner with valid token -> handler receives user", async () => {
  vi.mocked(getPartner).mockResolvedValue({ id: "u1" } as never);
  const route = withContract(
    { output: z.object({ id: z.string() }), auth: "partner" },
    (_in, { user }) => ({ id: user.id }),
  );
  const res = await route(
    new Request("http://x/api/t", { headers: { Authorization: "Bearer t" } }),
  );
  expect(await res.json()).toEqual({ data: { id: "u1" } });
  expect(getPartner).toHaveBeenCalledWith("t");
});

test("public handler ctx has no user", () => {
  withContract({ output: z.object({}), auth: "public" }, (_in, ctx) => {
    // @ts-expect-error ctx.user only exists for partner routes
    expect(ctx.user).toBeUndefined();
    return {};
  });
});

test("cron: wrong or missing secret -> 401, right secret -> 200", async () => {
  const route = withContract({ output: z.object({}), auth: "cron" }, () => ({}));
  const call = (h?: string) =>
    route(new Request("http://x/api/t", { headers: h ? { Authorization: h } : {} }));
  expect((await call()).status).toBe(401);
  expect((await call("Bearer short")).status).toBe(401);
  expect((await call("Bearer s3cret-s3cret-s3cret")).status).toBe(200);
});
