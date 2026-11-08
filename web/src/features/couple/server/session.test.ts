import { AuthApiError, AuthRetryableFetchError } from "@supabase/supabase-js";
import { beforeEach, expect, test, vi } from "vitest";

import { ApiError } from "@/shared/http/withContract";

import { refreshSession } from "./session";

const refresh = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/shared/supabase/server", () => ({
  anonClient: () => ({ auth: { refreshSession: refresh } }),
  adminClient: vi.fn(),
}));
vi.mock("./rateLimit", () => ({ hitRateLimit: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

const fail = (error: unknown) => refresh.mockResolvedValue({ data: { session: null }, error });
const apiError = (status: number) => new AuthApiError("x", status, "code");

test("refused refresh token (4xx) -> 401", async () => {
  fail(apiError(400));
  await expect(refreshSession({ refreshToken: "r" })).rejects.toMatchObject({ status: 401 });
});

test("GoTrue 429 -> rate_limited", async () => {
  fail(apiError(429));
  await expect(refreshSession({ refreshToken: "r" })).rejects.toMatchObject({
    status: 429,
    code: "rate_limited",
  });
});

test("GoTrue 5xx -> rethrown, never 401", async () => {
  const e = apiError(503);
  fail(e);
  await expect(refreshSession({ refreshToken: "r" })).rejects.toBe(e);
});

test("network failure -> rethrown, never 401", async () => {
  const e = new AuthRetryableFetchError("down", 0);
  fail(e);
  const err = await refreshSession({ refreshToken: "r" }).catch((x: unknown) => x);
  expect(err).toBe(e);
  expect(err).not.toBeInstanceOf(ApiError);
});
