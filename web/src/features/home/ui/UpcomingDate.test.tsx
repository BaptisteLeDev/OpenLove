import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { expect, test } from "vitest";

import fr from "@/shared/i18n/messages/fr.json";

import { UpcomingDate } from "./UpcomingDate";

const renderValue = (value: Parameters<typeof UpcomingDate>[0]["value"]) =>
  render(
    <NextIntlClientProvider locale="fr" messages={fr}>
      <UpcomingDate value={value} />
    </NextIntlClientProvider>,
  );

test("no upcoming date -> none message", () => {
  renderValue(null);
  expect(screen.getByText(fr.home.upcomingDate.title)).toBeTruthy();
  expect(screen.getByText(fr.home.upcomingDate.none)).toBeTruthy();
});

test("shows label and days remaining", () => {
  renderValue({ label: "Anniversaire", date: "2026-11-05", inDays: 6 });
  expect(screen.getByText("Anniversaire")).toBeTruthy();
  expect(screen.getByText("dans 6 jours")).toBeTruthy();
});

test("today -> aujourd'hui", () => {
  renderValue({ label: "Anniversaire", date: "2026-11-05", inDays: 0 });
  expect(screen.getByText("aujourd'hui")).toBeTruthy();
});
