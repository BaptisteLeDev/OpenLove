import { beforeEach, expect, test, vi } from "vitest";

import tokens from "../../../../../design/tokens.json";
import { getTheme } from "./getTheme";

const maybeSingle = vi.fn();
const adminClient = vi.fn();
vi.mock("server-only", () => ({}));
vi.mock("@/shared/supabase/server", () => ({ adminClient: () => adminClient() }));

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  maybeSingle.mockReset();
  adminClient.mockReset();
  adminClient.mockReturnValue({
    from: () => ({
      select: () => ({ order: () => ({ limit: () => ({ maybeSingle }) }) }),
    }),
  });
});

test("Couple seed drives the scheme", async () => {
  maybeSingle.mockResolvedValue({ data: { seed: "#8f3f5a" }, error: null });
  expect((await getTheme()).seed).toBe("#8f3f5a");
});

test("no Couple -> default seed", async () => {
  maybeSingle.mockResolvedValue({ data: null, error: null });
  expect((await getTheme()).seed).toBe(tokens.seed);
});

test("read throws -> default seed", async () => {
  adminClient.mockImplementation(() => {
    throw new Error("env missing");
  });
  expect((await getTheme()).seed).toBe(tokens.seed);
});

test("query error -> default seed and logged", async () => {
  maybeSingle.mockResolvedValue({ data: null, error: { message: "x" } });
  expect((await getTheme()).seed).toBe(tokens.seed);
  expect(console.error).toHaveBeenCalled();
});
