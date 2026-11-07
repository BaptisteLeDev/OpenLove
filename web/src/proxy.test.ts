// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, expect, test, vi } from "vitest";

import { proxy } from "./proxy";

type SetAll = (
  c: { name: string; value: string; options: object }[],
  h: Record<string, string>,
) => void;
let claims: object | null = null;
let refresh: ((setAll: SetAll) => void) | undefined;

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@supabase/ssr", () => ({
  createServerClient: (_u: string, _k: string, o: { cookies: { setAll: SetAll } }) => ({
    auth: {
      getClaims: async () => {
        refresh?.(o.cookies.setAll);
        return { data: claims && { claims }, error: null };
      },
    },
  }),
}));

beforeEach(() => {
  claims = null;
  refresh = undefined;
  vi.stubEnv("SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("SUPABASE_ANON_KEY", "a");
  vi.stubEnv("MESSAGE_ENCRYPTION_KEY", Buffer.alloc(32).toString("base64"));
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "b");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "a");
});

const at = (path: string) => proxy(new NextRequest(`http://localhost${path}`));

test("no session on / -> 307 to /login", async () => {
  const res = await at("/");
  expect(res.status).toBe(307);
  expect(res.headers.get("location")).toBe("http://localhost/login");
});

test.each(["/login", "/setup"])("no session on %s -> passes", async (path) => {
  const res = await at(path);
  expect(res.headers.get("location")).toBeNull();
  expect(res.headers.get("x-middleware-next")).toBe("1");
});

test("session on / -> passes", async () => {
  claims = { sub: "u1" };
  const res = await at("/");
  expect(res.headers.get("x-middleware-next")).toBe("1");
});

test("refreshed session -> cookies and no-store headers on the response", async () => {
  claims = { sub: "u1" };
  refresh = (setAll) =>
    setAll([{ name: "sb-auth", value: "new", options: { path: "/" } }], {
      "Cache-Control": "private, no-store",
    });
  const res = await at("/");
  expect(res.cookies.get("sb-auth")?.value).toBe("new");
  expect(res.headers.get("cache-control")).toBe("private, no-store");
  expect(res.headers.get("x-middleware-request-cookie")).toContain("sb-auth=new");
});

test("/setup with no env -> passes without building the client", async () => {
  vi.unstubAllEnvs();
  vi.stubEnv("SUPABASE_URL", "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
  vi.resetModules();
  const { proxy: fresh } = await import("./proxy");
  const res = await fresh(new NextRequest("http://localhost/setup"));
  expect(res.headers.get("x-middleware-next")).toBe("1");
});
