import { expect, test } from "vitest";

import { pairingUri } from "./pairing";

test("pairingUri encodes the instance and keeps the code", () => {
  expect(pairingUri("https://a.b/c?d", "abc_-123")).toBe(
    "openlove://pair?instance=https%3A%2F%2Fa.b%2Fc%3Fd&code=abc_-123",
  );
});
