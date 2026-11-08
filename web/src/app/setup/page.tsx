import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { hasCouple } from "@/features/setup/server/couple";
import { createFirstCouple } from "@/features/setup/server/firstRun";
import { FirstRunForm } from "@/features/setup/ui/FirstRunForm";
import { SetupChecklist } from "@/features/setup/ui/SetupChecklist";
import { envSchema } from "@/shared/env";
import { checkEnv } from "@/shared/envChecklist";

import tokens from "../../../../design/tokens.json";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const t = await getTranslations("setup");
  const items = checkEnv(envSchema, process.env);
  const envOk = items.every((i) => i.status === "ok");
  if (envOk && (await hasCouple())) redirect("/");
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-4 p-6">
      <h1 className="text-headline-large">{t("title")}</h1>
      <p>{t("intro")}</p>
      <SetupChecklist items={items} />
      {envOk && <FirstRunForm action={createFirstCouple} defaultSeed={tokens.seed} />}
    </main>
  );
}
