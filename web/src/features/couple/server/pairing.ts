import "server-only";
import { createHash, randomBytes } from "node:crypto";

import type { PairingRequest, SessionResponse } from "@/shared/contracts/session";
import { clientIp } from "@/shared/http/clientIp";
import { ApiError } from "@/shared/http/withContract";
import { adminClient, anonClient, type Partner } from "@/shared/supabase/server";

import { PAIRING_LIMIT } from "../domain/limits";
import { PAIRING_TTL_SECONDS } from "../domain/pairing";
import { hitRateLimit } from "./rateLimit";

const sha256 = (code: string) => createHash("sha256").update(code).digest("hex");
const invalidCode = () => new ApiError(401, "unauthorized", "invalid pairing code");

export async function createPairingCode(
  partner: Partner,
): Promise<{ code: string; expiresAt: Date }> {
  const code = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + PAIRING_TTL_SECONDS * 1000);
  const admin = adminClient();
  const { error: clearError } = await admin
    .from("pairing_codes")
    .delete()
    .eq("user_id", partner.userId);
  if (clearError) throw clearError;
  const { error } = await admin.from("pairing_codes").insert({
    code_hash: sha256(code),
    user_id: partner.userId,
    expires_at: expiresAt.toISOString(),
  });
  if (error) throw error;
  return { code, expiresAt };
}

export async function exchangePairingCode(
  { code }: PairingRequest,
  { req }: { req: Request },
): Promise<SessionResponse> {
  const allowed = await hitRateLimit(
    `pairing:${clientIp(req.headers)}`,
    PAIRING_LIMIT.max,
    PAIRING_LIMIT.windowSeconds,
  );
  if (!allowed) throw new ApiError(429, "rate_limited", "too many attempts");

  const admin = adminClient();
  const { data: row, error } = await admin
    .from("pairing_codes")
    .delete()
    .eq("code_hash", sha256(code))
    .gt("expires_at", new Date().toISOString())
    .select("user_id")
    .maybeSingle();
  if (error) throw error;
  if (!row) throw invalidCode();

  const { data: member, error: memberError } = await admin
    .from("couple_members")
    .select("user_id")
    .eq("user_id", row.user_id)
    .maybeSingle();
  if (memberError) throw memberError;
  if (!member) throw invalidCode();
  return mintSession(row.user_id);
}

async function mintSession(userId: string): Promise<SessionResponse> {
  const admin = adminClient();
  const { data: user, error: userError } = await admin.auth.admin.getUserById(userId);
  if (userError) throw userError;
  if (!user.user.email) throw new Error("pairing user has no email");
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: user.user.email,
  });
  if (linkError) throw linkError;

  const { data: otp, error: otpError } = await anonClient().auth.verifyOtp({
    token_hash: link.properties.hashed_token,
    type: "magiclink",
  });
  if (otpError) throw otpError;
  if (!otp.session) throw new Error("verifyOtp returned no session");
  return {
    accessToken: otp.session.access_token,
    refreshToken: otp.session.refresh_token,
    expiresAt: otp.session.expires_at ?? Math.floor(Date.now() / 1000) + otp.session.expires_in,
  };
}
