"use client";
import { useTranslations } from "next-intl";
import { useActionState } from "react";

type State = { error?: "invalid" | "exists" };

const FIELDS = [
  { name: "email", type: "email", autoComplete: "email" },
  { name: "password", type: "password", autoComplete: "new-password", minLength: 8 },
  { name: "partnerAName", type: "text", autoComplete: "off", maxLength: 50 },
  { name: "partnerBName", type: "text", autoComplete: "off", maxLength: 50 },
  { name: "startDate", type: "date", autoComplete: "off" },
] as const;

export function FirstRunForm({
  action,
  defaultSeed,
}: {
  action: (prev: State, form: FormData) => Promise<State>;
  defaultSeed: string;
}) {
  const t = useTranslations("setup.firstRun");
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <h2 className="text-headline-medium">{t("title")}</h2>
      {FIELDS.map((f) => (
        <label key={f.name} className="flex flex-col gap-1">
          {t(f.name)}
          <input {...f} required className="rounded border p-2" />
        </label>
      ))}
      <label className="flex flex-col gap-1">
        {t("seed")}
        <input name="seed" type="color" defaultValue={defaultSeed} required />
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
