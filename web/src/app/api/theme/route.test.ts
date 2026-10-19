import { expect, test, vi } from "vitest";

import { themeResponse } from "@/shared/contracts/theme";

import { GET } from "./route";

vi.mock("@/shared/supabase/server", () => ({ getPartner: vi.fn() }));
vi.mock("server-only", () => ({}));

test("/api/theme -> 200 with a contract-valid scheme, no auth", async () => {
  const res = await GET(new Request("http://x/api/theme"));
  expect(res.status).toBe(200);
  const { data } = await res.json();
  expect(themeResponse.safeParse(data).success).toBe(true);
});
