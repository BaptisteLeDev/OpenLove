import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/features/couple/server/auth";
import { getMilestone } from "@/features/home/server/getMilestone";
import { Milestone } from "@/features/home/ui/Milestone";
import { getPartner } from "@/shared/supabase/server";

export default async function HomePage() {
  const result = await getPartner();
  if (!result.ok) redirect("/login");
  const t = await getTranslations("home");
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
      <Milestone value={await getMilestone(result.partner.coupleId)} />
      <Link href="/messages" className="rounded-full border px-4 py-2">
        {t("messages")}
      </Link>
      <form action={signOut}>
        <button type="submit" className="rounded-full border px-4 py-2">
          {t("logout")}
        </button>
      </form>
    </main>
  );
}
