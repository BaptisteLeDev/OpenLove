import { randomBytes } from "node:crypto";

import { expect, test } from "vitest";

import { decrypt, encrypt } from "./crypto";

const key = randomBytes(32);

test("round trip, fresh iv each time, no plaintext in output", () => {
  const a = encrypt(key, "bonjour");
  expect(decrypt(key, a)).toBe("bonjour");
  expect(a).not.toBe(encrypt(key, "bonjour"));
  expect(Buffer.from(a, "base64").toString("utf8")).not.toContain("bonjour");
});

test("wrong key or tampered blob throws", () => {
  const blob = encrypt(key, "x");
  expect(() => decrypt(randomBytes(32), blob)).toThrow();
  const bytes = Buffer.from(blob, "base64");
  bytes.writeUInt8(bytes.readUInt8(bytes.length - 1) ^ 1, bytes.length - 1);
  expect(() => decrypt(key, bytes.toString("base64"))).toThrow();
});
