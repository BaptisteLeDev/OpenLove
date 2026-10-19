import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { expect, test } from "vitest";

import fr from "@/shared/i18n/messages/fr.json";

import { Milestone } from "./Milestone";

const renderValue = (value: Parameters<typeof Milestone>[0]["value"]) =>
  render(
    <NextIntlClientProvider locale="fr" messages={fr}>
      <Milestone value={value} />
    </NextIntlClientProvider>,
  );

test("renders total days and the years/months/days breakdown", () => {
  renderValue({ years: 6, months: 8, days: 5, totalDays: 2439 });
  expect(screen.getByText(fr.home.milestone.title)).toBeTruthy();
  expect(screen.getByText(/2\s439 jours/)).toBeTruthy();
  expect(screen.getByText(/6 ans/)).toBeTruthy();
  expect(screen.getByText(/8 mois/)).toBeTruthy();
  expect(screen.getByText(/5 jours/)).toBeTruthy();
});

test("uses the singular for one day", () => {
  renderValue({ years: 0, months: 0, days: 1, totalDays: 1 });
  expect(screen.getAllByText(/1 jour\b/).length).toBeGreaterThan(0);
});
