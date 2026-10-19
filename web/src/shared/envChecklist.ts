import type { z } from "zod";

type EnvStatus = "ok" | "missing" | "invalid";
export type EnvCheckItem = { key: string; status: EnvStatus };

export function checkEnv(
  schema: z.ZodObject,
  source: Record<string, string | undefined>,
): EnvCheckItem[] {
  return Object.entries(schema.shape).map(([key, field]) => {
    const value = source[key];
    if (value === undefined || value === "") return { key, status: "missing" };
    return { key, status: field.safeParse(value).success ? "ok" : "invalid" };
  });
}
