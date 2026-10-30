import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, expect, test, vi } from "vitest";

import fr from "@/shared/i18n/messages/fr.json";

import { PairingPanel } from "./PairingPanel";

afterEach(cleanup);

const renderPanel = (action: Parameters<typeof PairingPanel>[0]["action"]) =>
  render(
    <NextIntlClientProvider locale="fr" messages={fr}>
      <PairingPanel action={action} />
    </NextIntlClientProvider>,
  );

test("click shows the QR image and its expiry", async () => {
  const action = vi.fn(async () => ({
    qr: "data:image/png;base64,AAAA",
    expiresAt: "2026-10-30T12:05:00.000Z",
  }));
  renderPanel(action);
  fireEvent.click(screen.getByRole("button", { name: fr.settings.pairing.show }));
  const img = await screen.findByRole("img", { name: fr.settings.pairing.qrAlt });
  expect(img.getAttribute("src")).toBe("data:image/png;base64,AAAA");
  expect(screen.getByText(/^Expire à /)).toBeTruthy();
  expect(action).toHaveBeenCalledTimes(1);
});

test("refused -> refused alert, no image", async () => {
  renderPanel(vi.fn(async () => ({ error: "refused" as const })));
  fireEvent.click(screen.getByRole("button", { name: fr.settings.pairing.show }));
  expect((await screen.findByRole("alert")).textContent).toBe(fr.settings.pairing.refused);
  expect(screen.queryByRole("img")).toBeNull();
});
