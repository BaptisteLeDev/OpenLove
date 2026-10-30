import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "vitest";

import { envSchema } from "@/shared/env";
import fr from "@/shared/i18n/messages/fr.json";

import { steps } from "./steps";

const doc = readFileSync(join(import.meta.dirname, "../../../../docs/install.md"), "utf8");

test("install.md has a section per step", () => {
  for (const { id } of steps) expect(doc).toContain(fr.setup.steps[id].title);
});

test("install.md mentions every env key", () => {
  for (const key of Object.keys(envSchema.shape)) expect(doc).toContain(key);
});
