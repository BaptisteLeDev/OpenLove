import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, expect, test, vi } from "vitest";

import { envSchema } from "@/shared/env";
import fr from "@/shared/i18n/messages/fr.json";

import SetupPage from "./page";

afterEach(() => vi.unstubAllEnvs());

test("renders with an empty environment", () => {
  for (const key of Object.keys(envSchema.shape)) vi.stubEnv(key, "");

  render(
    <NextIntlClientProvider locale="fr" messages={fr}>
      <SetupPage />
    </NextIntlClientProvider>,
  );

  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(fr.setup.title);
  expect(screen.getAllByText(fr.setup.status.missing)).toHaveLength(
    Object.keys(envSchema.shape).length,
  );
});
