import { beforeEach, expect, test, vi } from "vitest";

import { createFirstCouple } from "./firstRun";

const createUser = vi.fn();
const deleteUser = vi.fn();
const rpc = vi.fn();
const signInWithPassword = vi.fn();
const hasCouple = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("./couple", () => ({ hasCouple: () => hasCouple() }));
vi.mock("@/shared/supabase/server", () => ({
  adminClient: () => ({ auth: { admin: { createUser, deleteUser } }, rpc }),
  serverClient: async () => ({ auth: { signInWithPassword } }),
}));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`redirect:${to}`);
  },
}));

function form(over: Record<string, string> = {}) {
  const f = new FormData();
  const base = {
    email: "alex@example.com",
    password: "12345678",
    partnerAName: " Alex ",
    partnerBName: "Sam",
    startDate: "2020-01-02",
    seed: "#AABBCC",
    ...over,
  };
  for (const [k, v] of Object.entries(base)) f.set(k, v);
  return f;
}

beforeEach(() => {
  vi.clearAllMocks();
  hasCouple.mockResolvedValue(false);
  createUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
  deleteUser.mockResolvedValue({ error: null });
  rpc.mockResolvedValue({ data: "c1", error: null });
  signInWithPassword.mockResolvedValue({ error: null });
});

test("valid form creates user, couple, signs in, redirects", async () => {
  await expect(createFirstCouple({}, form())).rejects.toThrow("redirect:/");
  expect(createUser).toHaveBeenCalledWith({
    email: "alex@example.com",
    password: "12345678",
    email_confirm: true,
  });
  expect(rpc).toHaveBeenCalledWith("create_couple", {
    p_user_id: "u1",
    p_partner_a_name: "Alex",
    p_partner_b_name: "Sam",
    p_start_date: "2020-01-02",
    p_seed: "#aabbcc",
  });
  expect(signInWithPassword).toHaveBeenCalledWith({
    email: "alex@example.com",
    password: "12345678",
  });
});

test("sign-in failure redirects to /login", async () => {
  signInWithPassword.mockResolvedValue({ error: { message: "x" } });
  await expect(createFirstCouple({}, form())).rejects.toThrow("redirect:/login");
});

test.each([
  ["blank name", { partnerAName: "  " }],
  ["short password", { password: "1234567" }],
  ["bad seed", { seed: "red" }],
  ["bad date", { startDate: "2020-13-45" }],
])("%s -> invalid, nothing created", async (_n, over) => {
  expect(await createFirstCouple({}, form(over))).toEqual({ error: "invalid" });
  expect(createUser).not.toHaveBeenCalled();
});

test("createUser error -> invalid, rpc not called", async () => {
  createUser.mockResolvedValue({ data: { user: null }, error: { message: "dup" } });
  expect(await createFirstCouple({}, form())).toEqual({ error: "invalid" });
  expect(rpc).not.toHaveBeenCalled();
});

test("Couple exists (rpc null) -> user deleted, exists", async () => {
  rpc.mockResolvedValue({ data: null, error: null });
  expect(await createFirstCouple({}, form())).toEqual({ error: "exists" });
  expect(deleteUser).toHaveBeenCalledWith("u1");
  expect(signInWithPassword).not.toHaveBeenCalled();
});

test("rpc error -> user deleted, rejects", async () => {
  rpc.mockResolvedValue({ data: null, error: { message: "boom" } });
  await expect(createFirstCouple({}, form())).rejects.toThrow();
  expect(deleteUser).toHaveBeenCalledWith("u1");
});

test("Couple already exists -> exists, no user created", async () => {
  hasCouple.mockResolvedValue(true);
  expect(await createFirstCouple({}, form())).toEqual({ error: "exists" });
  expect(createUser).not.toHaveBeenCalled();
});

test("cleanup failure is logged, exists still returned", async () => {
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  rpc.mockResolvedValue({ data: null, error: null });
  deleteUser.mockResolvedValue({ error: { message: "nope" } });
  expect(await createFirstCouple({}, form())).toEqual({ error: "exists" });
  expect(spy).toHaveBeenCalledWith("orphan auth user", "u1", "nope");
  spy.mockRestore();
});
