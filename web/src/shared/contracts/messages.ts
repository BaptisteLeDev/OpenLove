import { z } from "zod";

export const MAX_LIMIT = 100;

export const message = z.strictObject({
  id: z.string().regex(/^\d+$/),
  authorId: z.uuid(),
  body: z.string(),
  createdAt: z.iso.datetime(),
});

export const sendMessageInput = z.object({ text: z.string().trim().min(1).max(4000) });

export const messagesQuery = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(50),
  cursor: z
    .string()
    .regex(/^\d{1,18}$/)
    .optional(),
});

export const messagesResponse = z.strictObject({
  items: z.array(message),
  nextCursor: z.string().regex(/^\d+$/).nullable(),
});

const sample = {
  id: "42",
  authorId: "6f1c2f0e-3b1a-4c55-9a43-0d2f6f6a9b11",
  body: "Bonne nuit",
  createdAt: "2026-10-30T22:00:00.000Z",
};

export const examples = {
  valid: [
    { items: [sample], nextCursor: "42" },
    { items: [], nextCursor: null },
  ],
  invalid: [
    { items: [{ ...sample, id: "abc" }], nextCursor: null },
    { items: [sample] },
    { items: [{ ...sample, authorId: "x" }], nextCursor: null },
  ],
};
