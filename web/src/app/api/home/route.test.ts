import { beforeEach, expect, test, vi } from "vitest";

import { getHome } from "@/features/home/server/getHome";
import { homeResponse } from "@/shared/contracts/home";
import { partnerOf, serverClient } from "@/shared/supabase/server";

import { GET } from "./route";

const sb = { tag: "sb" };
const member = {
  ok: true,
  partner: { userId: "u1", coupleId: "c1", role: "partner_a" },
};
const home = {
  milestone: { years: 0, months: 0, days: 0, totalDays: 0 },
  upcomingDate: null,
};

vi.mock("server-only", () => ({}));
vi.mock("@/shared/supabase/server", () => ({ serverClient: vi.fn(), partnerOf: vi.fn() }));
vi.mock("@/features/home/server/getHome", () => ({ getHome: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(serverClient).mockResolvedValue(sb as never);
  vi.mocked(getHome).mockResolvedValue(home);
});

test("no auth -> 401 unauthorized", async () => {
  vi.mocked(partnerOf).mockResolvedValue({ ok: false, code: "unauthorized" });
  const res = await GET(new Request("http://x/api/home"));
  expect(res.status).toBe(401);
  expect((await res.json()).error.code).toBe("unauthorized");
});

test("valid JWT without membership -> 403 not_couple_member", async () => {
  vi.mocked(partnerOf).mockResolvedValue({ ok: false, code: "not_couple_member" });
  const res = await GET(
    new Request("http://x/api/home", { headers: { Authorization: "Bearer t1" } }),
  );
  expect(res.status).toBe(403);
  expect((await res.json()).error.code).toBe("not_couple_member");
});

test("Bearer member -> 200 contract-valid home of their Couple", async () => {
  vi.mocked(partnerOf).mockResolvedValue(member as never);
  const res = await GET(
    new Request("http://x/api/home", { headers: { Authorization: "Bearer t1" } }),
  );
  expect(res.status).toBe(200);
  const { data } = await res.json();
  expect(homeResponse.safeParse(data).success).toBe(true);
  expect(serverClient).toHaveBeenCalledWith("t1");
  expect(getHome).toHaveBeenCalledWith(sb, "c1");
});
