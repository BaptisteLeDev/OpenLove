import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const here = import.meta.dirname;
const src = join(here, "../src/shared/contracts");
const out = join(here, "../../contracts");

export async function buildContracts(): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  for (const f of readdirSync(src).filter((f) => f.endsWith(".ts") && !f.includes(".test."))) {
    // oxlint-disable-next-line no-unsanitized/method -- path comes from readdirSync of our own dir
    const { examples } = await import(pathToFileURL(join(src, f)).href);
    const body = { valid: examples.valid, invalid: examples.invalid };
    files[f.replace(/\.ts$/, ".json")] = `${JSON.stringify(body, null, 2)}\n`;
  }
  return files;
}

if (process.argv[1] === import.meta.filename) {
  for (const [name, body] of Object.entries(await buildContracts())) {
    writeFileSync(join(out, name), body);
  }
}
