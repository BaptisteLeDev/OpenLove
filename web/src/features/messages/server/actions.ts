"use server";
import { revalidatePath } from "next/cache";

import { sendMessageInput } from "@/shared/contracts/messages";
import { getPartner } from "@/shared/supabase/server";

import { sendMessage } from "./messages";

export async function sendMessageAction(form: FormData): Promise<void> {
  const input = sendMessageInput.safeParse({ text: form.get("text") });
  if (!input.success) return;
  const who = await getPartner();
  if (!who.ok) return;
  await sendMessage(who.partner, input.data.text);
  revalidatePath("/messages");
}
