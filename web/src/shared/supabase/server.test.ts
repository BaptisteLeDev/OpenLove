import { beforeEach, expect, test, vi } from "vitest";

import { getPartner } from "./server";

const getUser = vi.fn();
const create = vi.fn(() => ({ auth: { getUser } }));

vi.mock("server-only", () => ({}));
vi.mock("@supabase/ssr", () => ({ createServerClient: (...a: unknown[]) => create(...(a as [])) }));
vi.mock("next/headers", () => ({ cookies: async () => ({ getAll: () => [], set: vi.fn() }) }));

beforeEach(() => {
  getUser.mockReset();
  create.mockClear();
  vi.stubEnv("SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("SUPABASE_ANON_KEY", "a");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "b");
  vi.stubEnv("CRON_SECRET", "s3cret-s3cret-s3cret");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "a");
});

test("bearer token is validated with getUser(token)", async () => {
  getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
  expect(await getPartner("t")).toEqual({ id: "u1" });
  expect(getUser).toHaveBeenCalledWith("t");
});

test("no token falls back to the cookie session", async () => {
  getUser.mockResolvedValue({ data: { user: { id: "u2" } }, error: null });
  expect(await getPartner(undefined)).toEqual({ id: "u2" });
  expect(getUser).toHaveBeenCalledWith(undefined);
});

test("auth error -> null", async () => {
  getUser.mockResolvedValue({ data: { user: null }, error: new Error("bad") });
  expect(await getPartner("t")).toBeNull();
});
