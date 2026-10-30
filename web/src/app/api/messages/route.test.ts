import { beforeEach, expect, test, vi } from "vitest";

import { GET, POST } from "./route";

const getPartner = vi.fn();
const listMessages = vi.fn();
const sendMessage = vi.fn();

vi.mock("@/shared/supabase/server", () => ({
  getPartner: () => getPartner(),
  serverClient: async () => ({}),
}));
vi.mock("@/features/messages/server/messages", () => ({
  listMessages: (...a: unknown[]) => listMessages(...a),
  sendMessage: (...a: unknown[]) => sendMessage(...a),
}));

const partner = { userId: "u", coupleId: "c", role: "partner_a" };
const get = (q: string) => GET(new Request(`http://x/api/messages${q}`));

beforeEach(() => {
  vi.clearAllMocks();
  getPartner.mockResolvedValue({ ok: true, partner });
  listMessages.mockResolvedValue({ items: [], nextCursor: null });
});

test("GET without session -> 401", async () => {
  getPartner.mockResolvedValue({ ok: false, code: "unauthorized" });
  expect((await get("")).status).toBe(401);
});

test("GET limit above 100 or below 1 -> 400, never reaches the store", async () => {
  expect((await get("?limit=101")).status).toBe(400);
  expect((await get("?limit=0")).status).toBe(400);
  expect(listMessages).not.toHaveBeenCalled();
});

test("GET defaults the limit and passes the cursor", async () => {
  expect((await get("?cursor=12")).status).toBe(200);
  expect(listMessages).toHaveBeenCalledWith({ limit: 50, cursor: "12" });
});

test("POST empty text -> 400; valid -> 200 with the Message", async () => {
  const post = (body: unknown) =>
    POST(
      new Request("http://x/api/messages", {
        method: "POST",
        headers: { origin: "http://x", host: "x" },
        body: JSON.stringify(body),
      }),
    );
  expect((await post({ text: "" })).status).toBe(400);
  const msg = {
    id: "1",
    authorId: "0192f6c4-5b1a-7c55-9a43-0d2f6f6a9b11",
    body: "hi",
    createdAt: "2026-10-30T10:00:00.000Z",
  };
  sendMessage.mockResolvedValue(msg);
  const res = await post({ text: "hi" });
  expect(res.status).toBe(200);
  expect((await res.json()).data).toEqual(msg);
  expect(sendMessage).toHaveBeenCalledWith(partner, "hi");
});
