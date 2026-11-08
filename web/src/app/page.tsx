import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/features/couple/server/auth";
import { getHome, getPartnerNames } from "@/features/home/server/getHome";
import { Milestone } from "@/features/home/ui/Milestone";
import { UpcomingDate } from "@/features/home/ui/UpcomingDate";
import { partnerOf, serverClient } from "@/shared/supabase/server";

export default async function HomePage() {
  const sb = await serverClient();
  const result = await partnerOf(sb);
  if (!result.ok) redirect("/login");
  const t = await getTranslations("home");
  const [home, names] = await Promise.all([
    getHome(sb, result.partner.coupleId),
    getPartnerNames(sb, result.partner.coupleId),
  ]);
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-headline-large">{t("partners", names)}</h1>
      <Milestone value={home.milestone} />
      <UpcomingDate value={home.upcomingDate} />
      <Link href="/messages" className="rounded-full border px-4 py-2">
        {t("messages")}
      </Link>
      <form action={signOut}>
        <button type="submit" className="rounded-full border px-4 py-2">
          {t("logout")}
        </button>
      </form>
      <Link href="/settings" className="rounded-full border px-4 py-2">
        {t("settings")}
      </Link>
    </main>
  );
}
