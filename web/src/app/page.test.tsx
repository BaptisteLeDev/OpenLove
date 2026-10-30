import { render, screen } from "@testing-library/react";
import { createTranslator, NextIntlClientProvider } from "next-intl";
import { beforeEach, expect, test, vi } from "vitest";

import fr from "@/shared/i18n/messages/fr.json";

import HomePage from "./page";

const sb = { tag: "sb" };
const partnerOf = vi.fn();
const getHome = vi.fn();

vi.mock("@/shared/supabase/server", () => ({
  serverClient: async () => sb,
  partnerOf: () => partnerOf(),
}));
vi.mock("@/features/home/server/getHome", () => ({
  getHome: (...a: unknown[]) => getHome(...a),
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
  getHome.mockResolvedValue({
    milestone: { years: 6, months: 8, days: 5, totalDays: 2439 },
    upcomingDate: null,
  });
});

test("not a couple member -> redirect to /login", async () => {
  partnerOf.mockResolvedValue({ ok: false, code: "not_couple_member" });
  await expect(HomePage()).rejects.toThrow("redirect:/login");
  expect(getHome).not.toHaveBeenCalled();
});

test("member -> Compteur, Prochaine date and logout button", async () => {
  partnerOf.mockResolvedValue({
    ok: true,
    partner: { userId: "u", coupleId: "c1", role: "partner_a" },
  });
  render(
    <NextIntlClientProvider locale="fr" messages={fr}>
      {await HomePage()}
    </NextIntlClientProvider>,
  );
  expect(getHome).toHaveBeenCalledWith(sb, "c1");
  expect(screen.getByText(fr.home.milestone.title)).toBeTruthy();
  expect(screen.getByText(fr.home.upcomingDate.title)).toBeTruthy();
  expect(screen.getByRole("button", { name: fr.home.logout })).toBeTruthy();
});
