"use server";
import { redirect } from "next/navigation";
import { z } from "zod";

import { adminClient, serverClient } from "@/shared/supabase/server";

export type FirstRunState = { error?: "invalid" | "exists" };

const name = z.string().trim().min(1).max(50);
const input = z.object({
  email: z.email(),
  password: z.string().min(8),
  partnerAName: name,
  partnerBName: name,
  startDate: z.iso.date(),
  seed: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i)
    .transform((s) => s.toLowerCase()),
});

export async function createFirstCouple(
  _prev: FirstRunState,
  form: FormData,
): Promise<FirstRunState> {
  const parsed = input.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "invalid" };
  const { email, password, partnerAName, partnerBName, startDate, seed } = parsed.data;

  const admin = adminClient();
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error || !created.data.user) return { error: "invalid" };
  const userId = created.data.user.id;

  const { data, error } = await admin.rpc("create_couple", {
    p_user_id: userId,
    p_partner_a_name: partnerAName,
    p_partner_b_name: partnerBName,
    p_start_date: startDate,
    p_seed: seed,
  });
  if (error || data === null) {
    await admin.auth.admin.deleteUser(userId);
    if (error) throw new Error(`create_couple failed: ${error.message}`);
    return { error: "exists" };
  }

  const { error: signInError } = await (
    await serverClient()
  ).auth.signInWithPassword({ email, password });
  redirect(signInError ? "/login" : "/");
}
