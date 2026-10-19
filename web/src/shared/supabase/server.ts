import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { env } from "@/shared/env";

async function serverClient(bearer?: string) {
  const jar = await cookies();
  return createServerClient(env().SUPABASE_URL, env().SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => jar.getAll(),
      // Route handlers may set cookies; read-only contexts throw, token refresh then waits.
      setAll: (all) => {
        try {
          for (const { name, value, options } of all) jar.set(name, value, options);
        } catch {}
      },
    },
    global: bearer ? { headers: { Authorization: `Bearer ${bearer}` } } : undefined,
  });
}

export async function getPartner(req: Request): Promise<User | null> {
  const bearer = /^Bearer (.+)$/.exec(req.headers.get("authorization") ?? "")?.[1];
  const supabase = await serverClient(bearer);
  const { data, error } = await supabase.auth.getUser(bearer);
  return error ? null : data.user;
}
