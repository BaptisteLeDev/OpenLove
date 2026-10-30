import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "vitest";

import { envSchema } from "@/shared/env";
import fr from "@/shared/i18n/messages/fr.json";

import { steps } from "./steps";

const doc = readFileSync(join(import.meta.dirname, "../../../../docs/install.md"), "utf8").replace(
  /\*\*|`/g,
  "",
);

test("install.md carries every step title, instruction and checklist line", () => {
  for (const { id } of steps) {
    const step: { title: string; instructions: string[]; checklist?: string[] } =
      fr.setup.steps[id];
    for (const line of [step.title, ...step.instructions, ...(step.checklist ?? [])]) {
      expect(doc).toContain(line);
    }
  }
});

test("install.md mentions every env key", () => {
  for (const key of Object.keys(envSchema.shape)) expect(doc).toContain(key);
});
