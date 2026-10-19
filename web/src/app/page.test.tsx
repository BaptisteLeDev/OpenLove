import { render, screen } from "@testing-library/react";
import { createTranslator, NextIntlClientProvider } from "next-intl";
import { beforeEach, expect, test, vi } from "vitest";

import fr from "@/shared/i18n/messages/fr.json";

import HomePage from "./page";

const getPartner = vi.fn();
const getMilestone = vi.fn();

vi.mock("@/shared/supabase/server", () => ({ getPartner: () => getPartner() }));
vi.mock("@/features/home/server/getMilestone", () => ({
  getMilestone: (id: string) => getMilestone(id),
}));
vi.mock("@/features/couple/server/auth", () => ({ signOut: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`redirect:${to}`);
  },
}));
vi.mock("next-intl/server", () => ({
  getTranslations: async (namespace: "home") =>
    createTranslator({ locale: "fr", messages: fr, namespace }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  getMilestone.mockResolvedValue({ years: 6, months: 8, days: 5, totalDays: 2439 });
});

test("not a couple member -> redirect to /login", async () => {
  getPartner.mockResolvedValue({ ok: false, code: "not_couple_member" });
  await expect(HomePage()).rejects.toThrow("redirect:/login");
  expect(getMilestone).not.toHaveBeenCalled();
});

test("member -> Compteur of their Couple and logout button", async () => {
  getPartner.mockResolvedValue({
    ok: true,
    partner: { userId: "u", coupleId: "c1", role: "partner_a" },
  });
  render(
    <NextIntlClientProvider locale="fr" messages={fr}>
      {await HomePage()}
    </NextIntlClientProvider>,
  );
  expect(getMilestone).toHaveBeenCalledWith("c1");
  expect(screen.getByText(fr.home.milestone.title)).toBeTruthy();
  expect(screen.getByRole("button", { name: fr.home.logout })).toBeTruthy();
});
