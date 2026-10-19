import { expect, test, vi } from "vitest";

import { GET } from "./route";

vi.mock("@/shared/supabase/server", () => ({ getPartner: vi.fn() }));

test("/api/health -> 200 {data:{ok:true}}", async () => {
  const res = await GET(new Request("http://x/api/health"));
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ data: { ok: true } });
});
