import { beforeEach, expect, test, vi } from "vitest";

import { getPartner } from "./server";

const getUser = vi.fn();
const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));
const create = vi.fn(() => ({ auth: { getUser }, from }));

vi.mock("server-only", () => ({}));
vi.mock("@supabase/ssr", () => ({ createServerClient: (...a: unknown[]) => create(...(a as [])) }));
vi.mock("next/headers", () => ({ cookies: async () => ({ getAll: () => [], set: vi.fn() }) }));

beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
  maybeSingle.mockResolvedValue({ data: { couple_id: "c1", role: "partner_b" }, error: null });
  vi.stubEnv("SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("SUPABASE_ANON_KEY", "a");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "b");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "a");
});

test("member -> partner with couple and role", async () => {
  expect(await getPartner()).toEqual({
    ok: true,
    partner: { userId: "u1", coupleId: "c1", role: "partner_b" },
  });
  expect(from).toHaveBeenCalledWith("couple_members");
  expect(select).toHaveBeenCalledWith("couple_id, role");
  expect(eq).toHaveBeenCalledWith("user_id", "u1");
});

test("no membership row -> not_couple_member", async () => {
  maybeSingle.mockResolvedValue({ data: null, error: null });
  expect(await getPartner()).toEqual({ ok: false, code: "not_couple_member" });
});

test("getUser error -> unauthorized, no membership query", async () => {
  getUser.mockResolvedValue({ data: { user: null }, error: new Error("bad") });
  expect(await getPartner("t")).toEqual({ ok: false, code: "unauthorized" });
  expect(from).not.toHaveBeenCalled();
});

test("bearer -> client carries Authorization header and getUser(token)", async () => {
  await getPartner("t");
  expect(create).toHaveBeenCalledWith(
    "http://127.0.0.1:54321",
    "a",
    expect.objectContaining({ global: { headers: { Authorization: "Bearer t" } } }),
  );
  expect(getUser).toHaveBeenCalledWith("t");
});

test("no bearer -> cookie session, no Authorization header", async () => {
  await getPartner();
  expect(create).toHaveBeenCalledWith(
    "http://127.0.0.1:54321",
    "a",
    expect.not.objectContaining({ global: expect.anything() }),
  );
  expect(getUser).toHaveBeenCalledWith(undefined);
});
