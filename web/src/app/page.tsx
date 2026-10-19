import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("app");
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 p-6">
      <h1 className="text-4xl font-semibold">{t("name")}</h1>
      <p>{t("tagline")}</p>
    </main>
  );
}
