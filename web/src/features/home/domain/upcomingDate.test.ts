import { expect, test } from "vitest";

import { upcomingDate } from "./upcomingDate";

const TODAY = "2026-10-30";

test("no dates gives null", () => {
  expect(upcomingDate([], TODAY)).toBeNull();
});

test("next occurrence this year", () => {
  expect(upcomingDate([{ label: "A", date: "2019-11-05" }], TODAY)).toEqual({
    label: "A",
    date: "2026-11-05",
    inDays: 6,
  });
});

test("rolls over to next year when already passed", () => {
  expect(upcomingDate([{ label: "A", date: "2000-01-05" }], "2026-12-20")).toEqual({
    label: "A",
    date: "2027-01-05",
    inDays: 16,
  });
});

test("today counts as inDays 0", () => {
  expect(upcomingDate([{ label: "A", date: "2010-10-30" }], TODAY)?.inDays).toBe(0);
});

test("window bounds are inclusive at 30 days and exclusive beyond", () => {
  expect(upcomingDate([{ label: "A", date: "2010-11-29" }], TODAY)?.inDays).toBe(30);
  expect(upcomingDate([{ label: "A", date: "2010-11-30" }], TODAY)).toBeNull();
});

test("Feb 29 falls back to Feb 28 in a non-leap year", () => {
  expect(upcomingDate([{ label: "A", date: "2024-02-29" }], "2027-02-20")).toEqual({
    label: "A",
    date: "2027-02-28",
    inDays: 8,
  });
});

test("smallest inDays wins", () => {
  const dates = [
    { label: "B", date: "2010-11-02" },
    { label: "A", date: "2010-11-02" },
    { label: "C", date: "2010-10-31" },
  ];
  expect(upcomingDate(dates, TODAY)?.label).toBe("C");
});

test("tie on inDays goes to label ascending", () => {
  const dates = [
    { label: "B", date: "2010-11-02" },
    { label: "A", date: "2010-11-02" },
  ];
  expect(upcomingDate(dates, TODAY)?.label).toBe("A");
});
