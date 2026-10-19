import { z } from "zod";

export const healthResponse = z.object({ ok: z.boolean() });

export const examples = {
  valid: [{ ok: true }],
  invalid: [{}, { ok: "yes" }],
};
