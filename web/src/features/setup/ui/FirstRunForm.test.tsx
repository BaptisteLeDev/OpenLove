import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, expect, test, vi } from "vitest";

import fr from "@/shared/i18n/messages/fr.json";

import { FirstRunForm } from "./FirstRunForm";

afterEach(cleanup);

function setup(action = vi.fn(async () => ({}))) {
  render(
    <NextIntlClientProvider locale="fr" messages={fr}>
      <FirstRunForm action={action} defaultSeed="#336699" />
    </NextIntlClientProvider>,
  );
}

test("every field has its label and the seed default", () => {
  setup();
  const f = fr.setup.firstRun;
  for (const label of [f.email, f.password, f.partnerAName, f.partnerBName, f.startDate]) {
    expect(screen.getByLabelText(label)).toBeTruthy();
  }
  expect((screen.getByLabelText(f.seed) as HTMLInputElement).value).toBe("#336699");
  expect(screen.getByRole("button", { name: f.submit })).toBeTruthy();
});

test("action error is shown in an alert", async () => {
  setup(vi.fn(async () => ({ error: "exists" as const })));
  fireEvent.submit(screen.getByRole("button").closest("form")!);
  expect((await screen.findByRole("alert")).textContent).toBe(fr.setup.firstRun.exists);
});
