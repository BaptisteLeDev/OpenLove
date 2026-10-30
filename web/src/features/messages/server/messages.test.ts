// @vitest-environment node
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { localAdmin, SEED, seed } from "../../../../scripts/seed";
import { listMessages, sendMessage } from "./messages";

vi.mock("server-only", () => ({}));

const url = process.env.SUPABASE_URL ?? "";
const anonKey = process.env.SUPABASE_ANON_KEY ?? "";
const up =
  !!url &&
  !!anonKey &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !!process.env.MESSAGE_ENCRYPTION_KEY &&
  (await fetch(`${url}/auth/v1/health`, { headers: { apikey: anonKey } }).then(
    (r) => r.ok,
    () => false,
  ));

async function signedIn(email: string): Promise<{ sb: SupabaseClient; userId: string }> {
  const sb = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await sb.auth.signInWithPassword({ email, password: SEED.password });
  if (error) throw error;
  return { sb, userId: data.user.id };
}

describe.skipIf(!up)("messages", () => {
  let coupleId = "";

  beforeAll(async () => {
    coupleId = (await seed(localAdmin())).coupleId;
  });

  test("a sends, b lists it in clear; the stored row is not the text", async () => {
    const a = await signedIn(SEED.emails.a);
    const b = await signedIn(SEED.emails.b);
    const text = `secret ${crypto.randomUUID()}`;
    const sent = await sendMessage({ userId: a.userId, coupleId }, text, a.sb);
    expect(sent.body).toBe(text);

    const page = await listMessages({ limit: 100 }, b.sb);
    expect(page.items.find((m) => m.id === sent.id)?.body).toBe(text);

    const raw = await localAdmin().from("messages").select().eq("id", sent.id).single();
    expect(JSON.stringify(raw.data)).not.toContain(text);
  });

  test("cursor pages newest first without overlap", async () => {
    const a = await signedIn(SEED.emails.a);
    const me = { userId: a.userId, coupleId };
    const ids = [
      (await sendMessage(me, "p1", a.sb)).id,
      (await sendMessage(me, "p2", a.sb)).id,
      (await sendMessage(me, "p3", a.sb)).id,
    ];
    const first = await listMessages({ limit: 2 }, a.sb);
    expect(first.items.map((m) => m.id)).toEqual([ids[2], ids[1]]);
    expect(first.nextCursor).not.toBeNull();
    const second = await listMessages({ limit: 2, cursor: first.nextCursor ?? "" }, a.sb);
    expect(second.items[0]?.id).not.toBe(ids[1]);
    expect(second.items.map((m) => m.id)).toContain(ids[0]);
  });
});
