import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test, vi } from "vitest";

import { getHome } from "./getHome";

const couple = vi.fn(async () => ({
  data: { start_date: "2020-02-14", time_zone: "Europe/Paris" },
  error: null,
}));
const dates = vi.fn(async () => ({
  data: [{ label: "Anniversaire", date: "2019-10-25" }],
  error: null,
}));
const from = vi.fn((table: string) =>
  table === "couples"
    ? { select: () => ({ eq: () => ({ single: couple }) }) }
    : { select: () => ({ eq: dates }) },
);
const sb = { from } as unknown as SupabaseClient;

test("reads Couple and special dates, counts in the Couple time zone", async () => {
  const home = await getHome(sb, "c1", new Date("2026-10-18T22:30:00Z"));
  expect(from).toHaveBeenCalledWith("couples");
  expect(from).toHaveBeenCalledWith("special_dates");
  expect(home.milestone.totalDays).toBe(2439);
  expect(home.upcomingDate).toEqual({ label: "Anniversaire", date: "2026-10-25", inDays: 6 });
});

test("special_dates error -> rejects", async () => {
  dates.mockResolvedValueOnce({ data: null, error: new Error("db down") } as never);
  await expect(getHome(sb, "c1")).rejects.toThrow("db down");
});
