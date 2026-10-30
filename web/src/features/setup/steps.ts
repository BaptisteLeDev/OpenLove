import type { EnvCheckItem } from "@/shared/envChecklist";

export const steps: readonly { id: "vercel" | "supabase"; prefixes: readonly string[] }[] = [
  { id: "vercel", prefixes: [] },
  { id: "supabase", prefixes: ["SUPABASE_", "NEXT_PUBLIC_SUPABASE_"] },
];

type StepId = (typeof steps)[number]["id"] | "other";
type StepGroup = { id: StepId; items: EnvCheckItem[] };

function stepIdOf(key: string): StepId {
  return (
    steps.find(({ prefixes }) => prefixes.some((prefix) => key.startsWith(prefix)))?.id ?? "other"
  );
}

export function groupByStep(items: EnvCheckItem[]): StepGroup[] {
  const groups: StepGroup[] = [
    ...steps.map(({ id }) => ({ id, items: [] as EnvCheckItem[] })),
    { id: "other", items: [] },
  ];
  for (const item of items)
    groups.find((group) => group.id === stepIdOf(item.key))?.items.push(item);
  return groups.filter((group) => group.id !== "other" || group.items.length > 0);
}
