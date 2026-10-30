import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { showPairing } from "@/features/couple/server/showPairing";
import { PairingPanel } from "@/features/couple/ui/PairingPanel";
import { partnerOf, serverClient } from "@/shared/supabase/server";

export default async function SettingsPage() {
  const result = await partnerOf(await serverClient());
  if (!result.ok) redirect("/login");
  const t = await getTranslations("settings");
  return (
    <main className="flex min-h-dvh flex-col items-center gap-6 p-6">
      <h1 className="text-headline-large">{t("title")}</h1>
      <PairingPanel action={showPairing} />
    </main>
  );
}
