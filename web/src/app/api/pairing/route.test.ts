import { expect, test, vi } from "vitest";

import { exchangePairingCode } from "@/features/couple/server/pairing";
import { ApiError } from "@/shared/http/withContract";

import { POST } from "./route";

vi.mock("@/features/couple/server/pairing", () => ({ exchangePairingCode: vi.fn() }));
vi.mock("server-only", () => ({}));

const post = (body: unknown) =>
  POST(
    new Request("http://x/api/pairing", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

test("invalid body -> 400 before the server module runs", async () => {
  const res = await post({ code: "x" });
  expect(res.status).toBe(400);
  expect(exchangePairingCode).not.toHaveBeenCalled();
});

test("refused exchange -> 401 envelope without echoing the code or email", async () => {
  const code = "pairing-code-abcdef";
  vi.mocked(exchangePairingCode).mockRejectedValueOnce(
    new ApiError(401, "unauthorized", "invalid pairing code"),
  );
  const res = await post({ code });
  const text = await res.text();
  expect(res.status).toBe(401);
  expect(JSON.parse(text).error).toEqual({ code: "unauthorized", message: "invalid pairing code" });
  expect(text).not.toContain(code);
  expect(text).not.toContain("@");
});

test("success -> 200 envelope with the session", async () => {
  const session = { accessToken: "a", refreshToken: "r", expiresAt: 1798761600 };
  vi.mocked(exchangePairingCode).mockResolvedValueOnce(session);
  const res = await post({ code: "pairing-code-abcdef" });
  expect(res.status).toBe(200);
  expect((await res.json()).data).toEqual(session);
});
