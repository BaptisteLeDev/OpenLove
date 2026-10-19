import { expect, test, type Page } from "@playwright/test";

import { localAdmin, SEED, seed } from "../scripts/seed";
import fr from "../src/shared/i18n/messages/fr.json" with { type: "json" };

const url = process.env.SUPABASE_URL ?? "";
const anonKey = process.env.SUPABASE_ANON_KEY ?? "";

test.beforeAll(async () => {
  const up =
    !!url &&
    !!anonKey &&
    (await fetch(`${url}/auth/v1/health`, { headers: { apikey: anonKey } }).then(
      (r) => r.ok,
      () => false,
    ));
  test.skip(!up, "e2e skipped: local Supabase unreachable. Run: npx supabase start");
  await seed(localAdmin());
});

async function logIn(page: Page, email: string, password: string = SEED.password) {
  await page.goto("/login");
  await page.getByLabel(fr.login.email).fill(email);
  await page.getByLabel(fr.login.password).fill(password);
  await page.getByRole("button", { name: fr.login.submit }).click();
}

test("Partenaire logs in on web", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await logIn(page, SEED.emails.a);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(fr.home.milestone.title)).toBeVisible();
  await expect(page.getByText(/\d jours/).first()).toBeVisible();
  await page.getByRole("button", { name: fr.home.logout }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("Stranger cannot enter", async ({ page }) => {
  await logIn(page, SEED.emails.stranger);
  await expect(page.getByRole("alert")).toHaveText(fr.login.refused);
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText(fr.home.milestone.title)).toHaveCount(0);
});

test("wrong password is invalid", async ({ page }) => {
  await logIn(page, SEED.emails.a, "not-the-password");
  await expect(page.getByRole("alert")).toHaveText(fr.login.invalid);
  await expect(page).toHaveURL(/\/login$/);
});
