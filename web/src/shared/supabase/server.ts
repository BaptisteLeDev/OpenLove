import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { env } from "@/shared/env";

async function serverClient() {
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
  });
}

export async function getPartner(bearer?: string): Promise<User | null> {
  const { data, error } = await (await serverClient()).auth.getUser(bearer);
  return error ? null : data.user;
}
