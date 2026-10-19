import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, expect, test, vi } from "vitest";

import fr from "@/shared/i18n/messages/fr.json";

import { LoginForm } from "./LoginForm";

afterEach(cleanup);

const renderForm = (action: Parameters<typeof LoginForm>[0]["action"]) =>
  render(
    <NextIntlClientProvider locale="fr" messages={fr}>
      <LoginForm action={action} />
    </NextIntlClientProvider>,
  );

test("renders labelled fields from fr messages, no alert", () => {
  renderForm(vi.fn());
  expect(screen.getByLabelText(fr.login.email)).toBeTruthy();
  expect(screen.getByLabelText(fr.login.password)).toBeTruthy();
  expect(screen.getByRole("button", { name: fr.login.submit })).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
});

test("refused state shows the refused alert", async () => {
  const action = vi.fn(async () => ({ error: "refused" as const }));
  renderForm(action);
  fireEvent.change(screen.getByLabelText(fr.login.email), {
    target: { value: "x@example.com" },
  });
  fireEvent.change(screen.getByLabelText(fr.login.password), { target: { value: "pw" } });
  fireEvent.click(screen.getByRole("button", { name: fr.login.submit }));
  expect((await screen.findByRole("alert")).textContent).toBe(fr.login.refused);
  expect(action).toHaveBeenCalled();
});
