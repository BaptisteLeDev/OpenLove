import { render, screen, within } from "@testing-library/react";
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

test("renders the Vercel and Supabase step guides in order", () => {
  for (const key of Object.keys(envSchema.shape)) vi.stubEnv(key, "");

  const { container } = render(
    <NextIntlClientProvider locale="fr" messages={fr}>
      <SetupPage />
    </NextIntlClientProvider>,
  );

  expect(
    within(container)
      .getAllByRole("heading", { level: 2 })
      .map((h) => h.textContent),
  ).toEqual([fr.setup.steps.vercel.title, fr.setup.steps.supabase.title]);
  for (const line of fr.setup.steps.vercel.instructions) {
    expect(container.textContent).toContain(line);
  }
  const checklist = within(container).getByRole("list", { name: fr.setup.checklistTitle });
  expect(within(checklist).getAllByRole("listitem")).toHaveLength(
    fr.setup.steps.supabase.checklist.length,
  );
});
