import { expect, test } from "vitest";

import { envSchema } from "@/shared/env";
import { checkEnv, type EnvCheckItem } from "@/shared/envChecklist";

import { groupByStep } from "./steps";

test("supabase keys, public ones included, group under supabase", () => {
  const items: EnvCheckItem[] = [
    { key: "SUPABASE_URL", status: "ok" },
    { key: "NEXT_PUBLIC_SUPABASE_URL", status: "missing" },
  ];

  expect(groupByStep(items)).toEqual([
    { id: "vercel", items: [] },
    { id: "supabase", items },
  ]);
});

test("unknown key goes to other", () => {
  const item: EnvCheckItem = { key: "TMDB_API_KEY", status: "missing" };

  const groups = groupByStep([item]);

  expect(groups).toHaveLength(3);
  expect(groups.at(-1)).toEqual({ id: "other", items: [item] });
});

test("no other group when every key matches", () => {
  const groups = groupByStep(checkEnv(envSchema, {}));

  expect(groups.map((group) => group.id)).toEqual(["vercel", "supabase"]);
  expect(groups.flatMap((group) => group.items)).toHaveLength(Object.keys(envSchema.shape).length);
});
