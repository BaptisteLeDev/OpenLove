import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { env } from "@/shared/env";

export type Partner = { userId: string; coupleId: string; role: "partner_a" | "partner_b" };
export type PartnerResult =
  | { ok: true; partner: Partner }
  | { ok: false; code: "unauthorized" | "not_couple_member" };

async function serverClient(bearer?: string): Promise<SupabaseClient> {
  const jar = await cookies();
  return createServerClient(env().SUPABASE_URL, env().SUPABASE_ANON_KEY, {
    // Bearer (Android) -> PostgREST runs RLS as that JWT, not the cookie session.
    ...(bearer && { global: { headers: { Authorization: `Bearer ${bearer}` } } }),
    cookies: {
      getAll: () => jar.getAll(),
      // Route handlers may set cookies; read-only contexts throw, token refresh then waits.
      setAll: (all) => {
        try {
          for (const { name, value, options } of all) jar.set(name, value, options);
        } catch {}
      },
    },
  });
}

async function partnerOf(sb: SupabaseClient, jwt?: string): Promise<PartnerResult> {
  const { data: auth, error: authError } = await sb.auth.getUser(jwt);
  if (authError || !auth.user) return { ok: false, code: "unauthorized" };
  const { data, error } = await sb
    .from("couple_members")
    .select("couple_id, role")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { ok: false, code: "not_couple_member" };
  return { ok: true, partner: { userId: auth.user.id, coupleId: data.couple_id, role: data.role } };
}

export async function getPartner(bearer?: string): Promise<PartnerResult> {
  return partnerOf(await serverClient(bearer), bearer);
}
