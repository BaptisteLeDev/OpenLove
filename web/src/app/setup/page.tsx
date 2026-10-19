import { useTranslations } from "next-intl";

import { SetupChecklist } from "@/features/setup/ui/SetupChecklist";
import { envSchema } from "@/shared/env";
import { checkEnv } from "@/shared/envChecklist";

export const dynamic = "force-dynamic";

export default function SetupPage() {
  const t = useTranslations("setup");
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-4 p-6">
      <h1 className="text-headline-large">{t("title")}</h1>
      <p>{t("intro")}</p>
      <SetupChecklist items={checkEnv(envSchema, process.env)} />
    </main>
  );
}
