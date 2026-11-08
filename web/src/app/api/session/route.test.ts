import { expect, test, vi } from "vitest";

import { signInForSession } from "@/features/couple/server/session";
import { ApiError } from "@/shared/http/withContract";

import { POST } from "./route";

vi.mock("@/features/couple/server/session", () => ({
  signInForSession: vi.fn(),
}));
vi.mock("server-only", () => ({}));

const post = (body: unknown) =>
  POST(
    new Request("http://x/api/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

const valid = { email: "a@example.com", password: "s3cret-pass-word" };

test("invalid body -> 400 before the server module runs", async () => {
  const res = await post({});
  expect(res.status).toBe(400);
  expect(signInForSession).not.toHaveBeenCalled();
});

test("refused -> 401 envelope without echoing the secret", async () => {
  vi.mocked(signInForSession).mockRejectedValueOnce(new ApiError(401, "unauthorized", "refused"));
  const res = await post(valid);
  const text = await res.text();
  expect(res.status).toBe(401);
  expect(JSON.parse(text).error).toEqual({
    code: "unauthorized",
    message: "refused",
  });
  expect(text).not.toContain("s3cret-pass-word");
});

test("success -> 200 envelope with the session", async () => {
  const session = {
    accessToken: "a",
    refreshToken: "r",
    expiresAt: 1798761600,
  };
  vi.mocked(signInForSession).mockResolvedValueOnce(session);
  const res = await post(valid);
  expect(res.status).toBe(200);
  expect((await res.json()).data).toEqual(session);
});
