import { z } from "zod";

export const envSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  MESSAGE_ENCRYPTION_KEY: z.base64().refine((v) => Buffer.from(v, "base64").length === 32),
});

export const publicEnvSchema = envSchema.pick({
  NEXT_PUBLIC_SUPABASE_URL: true,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
});

let cached: z.infer<typeof envSchema> | undefined;

// Lazy: build and tests run without .env.
export function env() {
  return (cached ??= envSchema.parse(process.env));
}
