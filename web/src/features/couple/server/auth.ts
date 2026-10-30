"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { clientIp } from "@/shared/http/clientIp";
import { partnerOf, serverClient } from "@/shared/supabase/server";

import { LOGIN_LIMIT } from "../domain/limits";
import { hitRateLimit } from "./rateLimit";

export type LoginState = { error?: "invalid" | "refused" | "rate_limited" };

const credentials = z.object({ email: z.email(), password: z.string().min(1) });

export async function signIn(_prev: LoginState, form: FormData): Promise<LoginState> {
  const input = credentials.safeParse(Object.fromEntries(form));
  if (!input.success) return { error: "invalid" };
  const allowed = await hitRateLimit(
    `login:${clientIp(await headers())}`,
    LOGIN_LIMIT.max,
    LOGIN_LIMIT.windowSeconds,
  );
  if (!allowed) return { error: "rate_limited" };
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
