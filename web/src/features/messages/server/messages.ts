import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";

import type { message, messagesQuery } from "@/shared/contracts/messages";
import { env } from "@/shared/env";
import { type Partner, serverClient } from "@/shared/supabase/server";

import { decrypt, encrypt } from "./crypto";

type Message = z.input<typeof message>;
type Row = { id: number; author_id: string; body_enc: string; created_at: string };

const key = () => Buffer.from(env().MESSAGE_ENCRYPTION_KEY, "base64");

const toMessage = (r: Row): Message => ({
  id: String(r.id),
  authorId: r.author_id,
  body: decrypt(key(), r.body_enc),
  createdAt: new Date(r.created_at).toISOString(),
});

const COLUMNS = "id, author_id, body_enc, created_at";

export async function sendMessage(
  partner: Pick<Partner, "userId" | "coupleId">,
  text: string,
  sb?: SupabaseClient,
): Promise<Message> {
  const { data, error } = await (sb ?? (await serverClient()))
    .from("messages")
    .insert({
      couple_id: partner.coupleId,
      author_id: partner.userId,
      body_enc: encrypt(key(), text),
    })
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return toMessage(data);
}

export async function listMessages(
  { limit, cursor }: z.output<typeof messagesQuery>,
  sb?: SupabaseClient,
) {
  let q = (sb ?? (await serverClient()))
    .from("messages")
    .select(COLUMNS)
    .order("id", { ascending: false })
    .limit(limit + 1);
  if (cursor) q = q.lt("id", cursor);
  const { data, error } = await q;
  if (error) throw error;
  const page = data.slice(0, limit);
  return {
    items: page.map(toMessage),
    nextCursor: data.length > limit ? String(page[page.length - 1]?.id) : null,
  };
}
