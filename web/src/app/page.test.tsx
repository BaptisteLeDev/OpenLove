import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { expect, test } from "vitest";

import fr from "@/shared/i18n/messages/fr.json";

import HomePage from "./page";

test("home renders the app name from fr messages", () => {
  render(
    <NextIntlClientProvider locale="fr" messages={fr}>
      <HomePage />
    </NextIntlClientProvider>,
  );
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(fr.app.name);
});
