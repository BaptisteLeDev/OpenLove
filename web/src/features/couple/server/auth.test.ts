import { beforeEach, expect, test, vi } from "vitest";

import { signIn, signOut } from "./auth";

const signInWithPassword = vi.fn();
const authSignOut = vi.fn();
const sb = { auth: { signInWithPassword, signOut: authSignOut } };
const partnerOf = vi.fn();
const redirect = vi.fn((to: string) => {
  throw new Error(`redirect:${to}`);
});

vi.mock("@/shared/supabase/server", () => ({
  serverClient: async () => sb,
  partnerOf: (...a: unknown[]) => partnerOf(...a),
}));
vi.mock("next/navigation", () => ({ redirect: (to: string) => redirect(to) }));

const form = (email: string, password = "pw") => {
  const f = new FormData();
  f.set("email", email);
  f.set("password", password);
  return f;
};

beforeEach(() => {
  vi.clearAllMocks();
  signInWithPassword.mockResolvedValue({ error: null });
  partnerOf.mockResolvedValue({
    ok: true,
    partner: { userId: "u", coupleId: "c", role: "partner_a" },
  });
});

test("bad email -> invalid, no Supabase call", async () => {
  expect(await signIn({}, form("nope"))).toEqual({ error: "invalid" });
  expect(signInWithPassword).not.toHaveBeenCalled();
});

test("auth error -> invalid", async () => {
  signInWithPassword.mockResolvedValue({ error: new Error("bad creds") });
  expect(await signIn({}, form("a@example.com"))).toEqual({ error: "invalid" });
  expect(partnerOf).not.toHaveBeenCalled();
});

test("non-member -> signed out and refused", async () => {
  partnerOf.mockResolvedValue({ ok: false, code: "not_couple_member" });
  expect(await signIn({}, form("a@example.com"))).toEqual({ error: "refused" });
  expect(partnerOf).toHaveBeenCalledWith(sb);
  expect(authSignOut).toHaveBeenCalled();
});

test("member -> redirect to /", async () => {
  await expect(signIn({}, form("a@example.com"))).rejects.toThrow("redirect:/");
  expect(signInWithPassword).toHaveBeenCalledWith({ email: "a@example.com", password: "pw" });
  expect(authSignOut).not.toHaveBeenCalled();
});

test("signOut -> supabase signOut then redirect to /login", async () => {
  await expect(signOut()).rejects.toThrow("redirect:/login");
  expect(authSignOut).toHaveBeenCalled();
});
