import { useTranslations } from "next-intl";

export function MessageForm({ action }: { action: (form: FormData) => Promise<void> }) {
  const t = useTranslations("messages");
  return (
    <form action={action} className="flex w-full max-w-md gap-2">
      <input
        name="text"
        required
        maxLength={4000}
        autoComplete="off"
        aria-label={t("placeholder")}
        placeholder={t("placeholder")}
        className="flex-1 rounded-full border px-4 py-2"
      />
      <button type="submit" className="rounded-full border px-4 py-2">
        {t("send")}
      </button>
    </form>
  );
}
