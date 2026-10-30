import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { signOut } from "@/features/couple/server/auth";
import { getHome } from "@/features/home/server/getHome";
import { Milestone } from "@/features/home/ui/Milestone";
import { UpcomingDate } from "@/features/home/ui/UpcomingDate";
import { partnerOf, serverClient } from "@/shared/supabase/server";

export default async function HomePage() {
  const sb = await serverClient();
  const result = await partnerOf(sb);
  if (!result.ok) redirect("/login");
  const t = await getTranslations("home");
  const home = await getHome(sb, result.partner.coupleId);
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
      <Milestone value={home.milestone} />
      <UpcomingDate value={home.upcomingDate} />
      <form action={signOut}>
        <button type="submit" className="rounded-full border px-4 py-2">
          {t("logout")}
        </button>
      </form>
    </main>
  );
}
