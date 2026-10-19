"use server";
import { redirect } from "next/navigation";
import { z } from "zod";

import { partnerOf, serverClient } from "@/shared/supabase/server";

export type LoginState = { error?: "invalid" | "refused" };

const credentials = z.object({ email: z.email(), password: z.string().min(1) });

export async function signIn(_prev: LoginState, form: FormData): Promise<LoginState> {
  const input = credentials.safeParse(Object.fromEntries(form));
  if (!input.success) return { error: "invalid" };
  const sb = await serverClient();
  const { error } = await sb.auth.signInWithPassword(input.data);
  if (error) return { error: "invalid" };
  if (!(await partnerOf(sb)).ok) {
    await sb.auth.signOut();
    return { error: "refused" };
  }
  redirect("/");
}

export async function signOut(): Promise<never> {
  await (await serverClient()).auth.signOut();
  redirect("/login");
}
