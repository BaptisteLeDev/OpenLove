import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { expect, test } from "vitest";

import { envSchema } from "@/shared/env";
import { checkEnv } from "@/shared/envChecklist";
import fr from "@/shared/i18n/messages/fr.json";

import { SetupChecklist } from "./SetupChecklist";

function renderItems(items: ReturnType<typeof checkEnv>) {
  return render(
    <NextIntlClientProvider locale="fr" messages={fr}>
      <SetupChecklist items={items} />
    </NextIntlClientProvider>,
  );
}

function rowOf(key: string) {
  return screen.getByText(key).closest("li") as HTMLElement;
}

test("shows each key with its status and never a value", () => {
  renderItems(checkEnv(envSchema, { SUPABASE_URL: "nope", SUPABASE_SERVICE_ROLE_KEY: "supersecretvalue1234" }));

  for (const key of Object.keys(envSchema.shape)) expect(screen.getByText(key)).toBeTruthy();
  expect(rowOf("SUPABASE_URL").textContent).toContain(fr.setup.status.invalid);
  expect(rowOf("SUPABASE_SERVICE_ROLE_KEY").textContent).toContain(fr.setup.status.ok);
  expect(rowOf("SUPABASE_ANON_KEY").textContent).toContain(fr.setup.status.missing);
  expect(document.body.textContent).not.toContain("supersecretvalue1234");
  expect(document.body.textContent).not.toContain("nope");
});

test("a var without message falls back to the generic how-to", () => {
  renderItems(checkEnv(envSchema.extend({ NEW_VAR: envSchema.shape.SUPABASE_ANON_KEY }), {}));

  expect(rowOf("NEW_VAR").textContent).toContain(fr.setup.genericHowTo);
});
