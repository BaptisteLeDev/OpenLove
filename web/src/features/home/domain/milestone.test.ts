import { expect, test } from "vitest";

import { milestone, todayIn } from "./milestone";

test.each([
  ["2020-02-14", "2020-02-14", { years: 0, months: 0, days: 0, totalDays: 0 }],
  ["2020-02-14", "2026-10-19", { years: 6, months: 8, days: 5, totalDays: 2439 }],
  ["2024-01-31", "2024-02-29", { years: 0, months: 1, days: 0, totalDays: 29 }],
  ["2024-01-31", "2024-03-01", { years: 0, months: 1, days: 1, totalDays: 30 }],
  ["2020-02-29", "2021-02-28", { years: 1, months: 0, days: 0, totalDays: 365 }],
  ["2030-01-01", "2026-10-19", { years: 0, months: 0, days: 0, totalDays: 0 }],
])("milestone(%s, %s)", (start, today, expected) => {
  expect(milestone(start, today)).toEqual(expected);
});

test("todayIn uses the Couple time zone, not UTC", () => {
  expect(todayIn("Europe/Paris", new Date("2026-10-18T22:30:00Z"))).toBe("2026-10-19");
});
