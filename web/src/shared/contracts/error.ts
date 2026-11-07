import { z } from "zod";

export const errorCode = z.enum([
  "unauthorized",
  "forbidden",
  "not_couple_member",
  "validation_failed",
  "not_found",
  "rate_limited",
  "unavailable",
  "internal",
]);
export type ErrorCode = z.infer<typeof errorCode>;

export const errorResponse = z.strictObject({
  error: z.strictObject({ code: errorCode, message: z.string().min(1) }),
});

export const examples = {
  valid: [{ error: { code: "unauthorized", message: "invalid pairing code" } }],
  invalid: [
    { error: { code: "unauthorized" } },
    { error: "unauthorized" },
    { error: { code: "internal", message: "x", extra: true } },
  ],
};
