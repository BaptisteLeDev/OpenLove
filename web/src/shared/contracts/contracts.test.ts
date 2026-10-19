import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "vitest";

import { buildContracts } from "../../../scripts/contracts";

test("each contract example validates or fails as labeled", async () => {
  const dir = join(import.meta.dirname);
  for (const file of readdirSync(dir).filter((f) => /^(?!.*\.test\.).*\.ts$/.test(f))) {
    // oxlint-disable-next-line no-unsanitized/method -- path comes from readdirSync of our own dir
    const mod = await import(`./${file}`);
    const schema = Object.entries(mod).find(([k]) => k.endsWith("Response"))?.[1] as {
      safeParse: (v: unknown) => { success: boolean };
    };
    for (const v of mod.examples.valid) expect(schema.safeParse(v).success).toBe(true);
    for (const v of mod.examples.invalid) expect(schema.safeParse(v).success).toBe(false);
  }
});

test("committed contracts/*.json equal generated output", async () => {
  const generated = await buildContracts();
  const dir = join(import.meta.dirname, "../../../../contracts");
  expect(readdirSync(dir).sort()).toEqual(Object.keys(generated).sort());
  for (const [file, body] of Object.entries(generated)) {
    expect(readFileSync(join(dir, file), "utf8")).toBe(body);
  }
});
