import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { sendMessageAction } from "@/features/messages/server/actions";
import { listMessages } from "@/features/messages/server/messages";
import { MessageForm } from "@/features/messages/ui/MessageForm";
import { MessageList } from "@/features/messages/ui/MessageList";
import { getPartner } from "@/shared/supabase/server";

export default async function MessagesPage() {
  const result = await getPartner();
  if (!result.ok) redirect("/login");
  const t = await getTranslations("messages");
  const { items } = await listMessages({ limit: 50 });
  return (
    <main className="flex min-h-dvh flex-col items-center gap-4 p-6">
      <h1 className="text-title-medium">{t("title")}</h1>
      <MessageList items={items.toReversed()} me={result.partner.userId} />
      <MessageForm action={sendMessageAction} />
    </main>
  );
}
