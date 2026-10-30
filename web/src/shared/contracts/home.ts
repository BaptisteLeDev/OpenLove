import { z } from "zod";

const milestone = z.strictObject({
  years: z.int().nonnegative(),
  months: z.int().nonnegative(),
  days: z.int().nonnegative(),
  totalDays: z.int().nonnegative(),
});

const upcomingDate = z.strictObject({
  label: z.string().min(1),
  date: z.iso.date(),
  inDays: z.int().min(0).max(30),
});

export const homeResponse = z.strictObject({
  milestone,
  upcomingDate: upcomingDate.nullable(),
});

export const examples = {
  valid: [
    {
      milestone: { years: 1, months: 2, days: 3, totalDays: 430 },
      upcomingDate: { label: "Anniversaire", date: "2026-11-05", inDays: 6 },
    },
    {
      milestone: { years: 0, months: 0, days: 0, totalDays: 0 },
      upcomingDate: null,
    },
  ],
  invalid: [
    { milestone: { years: 0, months: 0, days: 0, totalDays: 0 } },
    {
      milestone: { years: 1, months: 2, days: 3, totalDays: 430 },
      upcomingDate: { label: "Anniversaire", date: "2026-11-05", inDays: 31 },
    },
    {
      milestone: { years: 1, months: 2, days: 3, totalDays: 430 },
      upcomingDate: { label: "Anniversaire", date: "05/11/2026", inDays: 6 },
    },
    {
      milestone: { years: 1, months: 2, days: 3, totalDays: -1 },
      upcomingDate: null,
    },
  ],
};
