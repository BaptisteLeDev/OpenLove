import { expect, test } from "vitest";

import { clientIp } from "./clientIp";

test("takes the first x-forwarded-for hop", () => {
  expect(clientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
});

test("falls back to x-real-ip", () => {
  expect(clientIp(new Headers({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
});

test("keys on unknown when no usable header", () => {
  expect(clientIp(new Headers())).toBe("unknown");
  expect(clientIp(new Headers({ "x-forwarded-for": "  " }))).toBe("unknown");
});
