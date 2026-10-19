import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "vitest";

const METHOD = "(GET|POST|PUT|PATCH|DELETE)";

function violations(src: string): string[] {
  const body = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/^import\b[^;]*?from\s+["'][^"']+["'];?[ \t]*$/gm, "")
    .replace(/^import\s+["'][^"']+["'];?[ \t]*$/gm, "");
  const chunks = body.split(/^(?=[A-Za-z])/m).filter((c) => c.trim());
  const ok = new RegExp(`^export const ${METHOD} = withContract\\(`);
  return chunks.filter((c) => !ok.test(c)).map((c) => c.trim().split("\n")[0] ?? "");
}

function routes(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? routes(join(dir, e.name)) : e.name === "route.ts" ? [join(dir, e.name)] : [],
  );
}

test("detector flags logic in a route file", () => {
  const bad = [
    'import { withContract } from "@/shared/http/withContract";',
    "const x = compute();",
    "export async function GET() {}",
    "export const dynamic = 'force-dynamic';",
  ].join("\n");
  expect(violations(bad)).toHaveLength(3);
});

test("detector accepts withContract exports", () => {
  const good = [
    'import { withContract } from "@/shared/http/withContract";',
    'import { healthResponse } from "@/shared/contracts/health";',
    "",
    "export const GET = withContract({ output: healthResponse, auth: 'public' }, () => ({",
    "  ok: true,",
    "}));",
  ].join("\n");
  expect(violations(good)).toEqual([]);
});

test("every api route.ts is imports + withContract exports only", () => {
  const files = routes(join(import.meta.dirname, "../src/app/api"));
  expect(files.length).toBeGreaterThan(0);
  for (const f of files)
    expect({ f, v: violations(readFileSync(f, "utf8")) }).toEqual({ f, v: [] });
});
