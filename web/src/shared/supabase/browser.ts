import { createBrowserClient } from "@supabase/ssr";

import { publicEnvSchema } from "@/shared/env";

export function browserClient() {
  // Literal accesses: Next inlines NEXT_PUBLIC_* only when written out.
  const e = publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  return createBrowserClient(e.NEXT_PUBLIC_SUPABASE_URL, e.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
