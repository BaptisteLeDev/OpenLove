import { createRequire } from "node:module";

import { cruise } from "dependency-cruiser";
import { expect, test } from "vitest";

const ruleSet = createRequire(import.meta.url)("../.dependency-cruiser.cjs");

test("arch rules reject each deliberate cross-layer import", async () => {
  const { output } = await cruise(["test/arch-fixtures"], { ruleSet, validate: true });
  if (typeof output === "string") throw new Error("expected a cruise result");
  const broken = new Set(output.summary.violations.map((v) => v.rule.name));
  expect([...broken].sort()).toEqual([
    "api-routes-only-contract-and-server",
    "domain-imports-only-domain-and-contracts",
    "no-cross-feature-internals",
    "ui-never-reaches-server",
  ]);
});
