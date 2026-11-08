import { render, screen, within } from "@testing-library/react";
import { createTranslator, NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { envSchema } from "@/shared/env";
import fr from "@/shared/i18n/messages/fr.json";

import SetupPage from "./page";

const hasCouple = vi.fn();

vi.mock("@/features/setup/server/couple", () => ({ hasCouple: () => hasCouple() }));
vi.mock("@/features/setup/server/firstRun", () => ({ createFirstCouple: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`redirect:${to}`);
  },
}));
vi.mock("next-intl/server", () => ({
  getTranslations: async (namespace: "setup") =>
    createTranslator({ locale: "fr", messages: fr, namespace }),
}));

const validEnv: Record<string, string> = {
  SUPABASE_URL: "http://localhost:54321",
  SUPABASE_ANON_KEY: "anon",
  SUPABASE_SERVICE_ROLE_KEY: "service",
  NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  MESSAGE_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString("base64"),
};

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllEnvs());

test("renders with an empty environment", async () => {
  for (const key of Object.keys(envSchema.shape)) vi.stubEnv(key, "");

  render(
    <NextIntlClientProvider locale="fr" messages={fr}>
      {await SetupPage()}
    </NextIntlClientProvider>,
  );

  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(fr.setup.title);
  expect(screen.getAllByText(fr.setup.status.missing)).toHaveLength(
    Object.keys(envSchema.shape).length,
  );
  expect(screen.queryByText(fr.setup.firstRun.title)).toBeNull();
  expect(hasCouple).not.toHaveBeenCalled();
});

test("renders the Vercel and Supabase step guides in order", async () => {
  for (const key of Object.keys(envSchema.shape)) vi.stubEnv(key, "");

  const { container } = render(
    <NextIntlClientProvider locale="fr" messages={fr}>
      {await SetupPage()}
    </NextIntlClientProvider>,
  );

  expect(
    within(container)
      .getAllByRole("heading", { level: 2 })
      .map((h) => h.textContent),
  ).toEqual([
    fr.setup.steps.vercel.title,
    fr.setup.steps.supabase.title,
    fr.setup.steps.other.title,
  ]);
  for (const line of fr.setup.steps.vercel.instructions) {
    expect(container.textContent).toContain(line);
  }
  const checklist = within(container).getByRole("list", { name: fr.setup.checklistTitle });
  expect(within(checklist).getAllByRole("listitem")).toHaveLength(
    fr.setup.steps.supabase.checklist.length,
  );
});

test("env ok and a Couple exists -> redirect to /", async () => {
  for (const [k, v] of Object.entries(validEnv)) vi.stubEnv(k, v);
  hasCouple.mockResolvedValue(true);
  await expect(SetupPage()).rejects.toThrow("redirect:/");
});

test("env ok and no Couple -> checklist and first-run form", async () => {
  for (const [k, v] of Object.entries(validEnv)) vi.stubEnv(k, v);
  hasCouple.mockResolvedValue(false);
  render(
    <NextIntlClientProvider locale="fr" messages={fr}>
      {await SetupPage()}
    </NextIntlClientProvider>,
  );
  expect(screen.getByRole("heading", { name: fr.setup.firstRun.title })).toBeTruthy();
  expect(screen.getAllByText(fr.setup.status.ok)).toHaveLength(Object.keys(envSchema.shape).length);
});
