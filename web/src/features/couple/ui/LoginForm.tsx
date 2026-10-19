"use client";
import { useTranslations } from "next-intl";
import { useActionState } from "react";

type State = { error?: "invalid" | "refused" };

export function LoginForm({ action }: { action: (prev: State, form: FormData) => Promise<State> }) {
  const t = useTranslations("login");
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1">
        {t("email")}
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded border p-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        {t("password")}
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded border p-2"
        />
      </label>
      {state.error && <p role="alert">{t(state.error)}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary p-2 text-on-primary"
      >
        {t("submit")}
      </button>
    </form>
  );
}
