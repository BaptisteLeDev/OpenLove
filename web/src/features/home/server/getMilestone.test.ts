import { expect, test, vi } from "vitest";

import { getMilestone } from "./getMilestone";

const single = vi.fn(async () => ({
  data: { start_date: "2020-02-14", time_zone: "Europe/Paris" },
  error: null,
}));
const eq = vi.fn(() => ({ single }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));

vi.mock("@/shared/supabase/server", () => ({ serverClient: async () => ({ from }) }));

test("reads the Couple row and counts in its time zone", async () => {
  const value = await getMilestone("c1", new Date("2026-10-18T22:30:00Z"));
  expect(from).toHaveBeenCalledWith("couples");
  expect(select).toHaveBeenCalledWith("start_date, time_zone");
  expect(eq).toHaveBeenCalledWith("id", "c1");
  expect(value.totalDays).toBe(2439);
});
