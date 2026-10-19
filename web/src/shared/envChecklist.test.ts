import { expect, test } from "vitest";
import { z } from "zod";

import { envSchema } from "./env";
import { checkEnv } from "./envChecklist";

const schema = z.object({ URL: z.url(), TOKEN: z.string().min(1) });

test("valid values are ok", () => {
  expect(checkEnv(schema, { URL: "https://a.io", TOKEN: "x" })).toEqual([
    { key: "URL", status: "ok" },
    { key: "TOKEN", status: "ok" },
  ]);
});

test("undefined and empty string are missing", () => {
  expect(checkEnv(schema, {}).map((i) => i.status)).toEqual(["missing", "missing"]);
  expect(checkEnv(schema, { URL: "https://a.io", TOKEN: "" })[1]).toEqual({
    key: "TOKEN",
    status: "missing",
  });
});

test("present but failing the schema is invalid", () => {
  expect(checkEnv(schema, { URL: "nope", TOKEN: "x" })).toEqual([
    { key: "URL", status: "invalid" },
    { key: "TOKEN", status: "ok" },
  ]);
});

test("a var added to the schema appears with no other edit", () => {
  const result = checkEnv(schema.extend({ EXTRA: z.string() }), {
    URL: "https://a.io",
    TOKEN: "x",
  });
  expect(result).toContainEqual({ key: "EXTRA", status: "missing" });
  expect(result).toHaveLength(3);
});

test("the real schema yields one missing item per key on empty env", () => {
  const result = checkEnv(envSchema, {});
  expect(result).toHaveLength(Object.keys(envSchema.shape).length);
  expect(result.every((i) => i.status === "missing")).toBe(true);
});

test("never leaks provided values", () => {
  const out = JSON.stringify(checkEnv(schema, { URL: "supersecret-bad", TOKEN: "supersecret-ok" }));
  expect(out).not.toContain("supersecret");
});
