import { z } from "zod";

export const pairingRequest = z.strictObject({ code: z.string().min(16).max(128) });
export type PairingRequest = z.infer<typeof pairingRequest>;

export const pairingResponse = z.strictObject({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresAt: z.number().int(),
});
export type PairingResponse = z.infer<typeof pairingResponse>;

export const examples = {
  valid: [{ accessToken: "access-token", refreshToken: "refresh-token", expiresAt: 1798761600 }],
  invalid: [
    { accessToken: "access-token", expiresAt: 1798761600 },
    { accessToken: "access-token", refreshToken: "refresh-token", expiresAt: "soon" },
    { accessToken: "access-token", refreshToken: "refresh-token", expiresAt: 1, extra: true },
  ],
};
