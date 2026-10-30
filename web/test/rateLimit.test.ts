// @vitest-environment node
import { randomUUID } from "node:crypto";

import { describe, expect, test, vi } from "vitest";

import { hitRateLimit } from "@/features/couple/server/rateLimit";

vi.mock("server-only", () => ({}));

const url = process.env.SUPABASE_URL ?? "";
const anonKey = process.env.SUPABASE_ANON_KEY ?? "";

const up =
  !!url &&
  !!anonKey &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
  (await fetch(`${url}/auth/v1/health`, { headers: { apikey: anonKey } }).then(
    (r) => r.ok,
    () => false,
  ));
// vitest drops console output of fully skipped files.
if (!up)
  process.stderr.write(
    "rateLimit tests skipped: local Supabase unreachable. Run: npx supabase start\n",
  );

describe.skipIf(!up)("postgres rate limiter", () => {
  test("allows max hits per window then refuses, per key", async () => {
    const key = `test:${randomUUID()}`;
    const other = `test:${randomUUID()}`;
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await hitRateLimit(key, 3, 60));
    expect(results).toEqual([true, true, true, false]);
    expect(await hitRateLimit(other, 3, 60)).toBe(true);
  });
});
