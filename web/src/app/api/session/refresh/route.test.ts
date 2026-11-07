import { expect, test, vi } from "vitest";

import { refreshSession } from "@/features/couple/server/session";
import { ApiError } from "@/shared/http/withContract";

import { POST } from "./route";

vi.mock("@/features/couple/server/session", () => ({
  refreshSession: vi.fn(),
}));
vi.mock("server-only", () => ({}));

const post = (body: unknown) =>
  POST(
    new Request("http://x/api/session/refresh", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

const valid = { refreshToken: "refresh-secret-token" };

test("invalid body -> 400 before the server module runs", async () => {
  const res = await post({});
  expect(res.status).toBe(400);
  expect(refreshSession).not.toHaveBeenCalled();
});

test("refused -> 401 envelope without echoing the secret", async () => {
  vi.mocked(refreshSession).mockRejectedValueOnce(new ApiError(401, "unauthorized", "refused"));
  const res = await post(valid);
  const text = await res.text();
  expect(res.status).toBe(401);
  expect(JSON.parse(text).error).toEqual({
    code: "unauthorized",
    message: "refused",
  });
  expect(text).not.toContain("refresh-secret-token");
});

test("success -> 200 envelope with the session", async () => {
  const session = {
    accessToken: "a",
    refreshToken: "r",
    expiresAt: 1798761600,
  };
  vi.mocked(refreshSession).mockResolvedValueOnce(session);
  const res = await post(valid);
  expect(res.status).toBe(200);
  expect((await res.json()).data).toEqual(session);
});
