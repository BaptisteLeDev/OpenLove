import "server-only";
import { isAuthApiError } from "@supabase/supabase-js";

import type { RefreshRequest, SessionResponse, SignInRequest } from "@/shared/contracts/session";
import { clientIp } from "@/shared/http/clientIp";
import { ApiError } from "@/shared/http/withContract";
import { adminClient, anonClient } from "@/shared/supabase/server";

import { LOGIN_LIMIT } from "../domain/limits";
import { hitRateLimit } from "./rateLimit";

export function toSession(s: {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in: number;
}): SessionResponse {
  return {
    accessToken: s.access_token,
    refreshToken: s.refresh_token,
    expiresAt: s.expires_at ?? Math.floor(Date.now() / 1000) + s.expires_in,
  };
}

export async function signInForSession(
  input: SignInRequest,
  { req }: { req: Request },
): Promise<SessionResponse> {
  const allowed = await hitRateLimit(
    `login:${clientIp(req.headers)}`,
    LOGIN_LIMIT.max,
    LOGIN_LIMIT.windowSeconds,
  );
  if (!allowed) throw new ApiError(429, "rate_limited", "too many attempts");

  const { data, error } = await anonClient().auth.signInWithPassword(input);
  if (error || !data.session) throw new ApiError(401, "unauthorized", "invalid credentials");

  const admin = adminClient();
  const { data: member, error: memberError } = await admin
    .from("couple_members")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (memberError) throw memberError;
  if (!member) {
    await admin.auth.admin.signOut(data.session.access_token);
    throw new ApiError(403, "not_couple_member", "not a couple member");
  }
  return toSession(data.session);
}

export async function refreshSession({ refreshToken }: RefreshRequest): Promise<SessionResponse> {
  const { data, error } = await anonClient().auth.refreshSession({
    refresh_token: refreshToken,
  });
  if (error) {
    // Android wipes its session on 401: only a refused token may say so, not an Auth outage.
    if (!isAuthApiError(error) || error.status >= 500) throw error;
    if (error.status === 429) throw new ApiError(429, "rate_limited", "too many attempts");
    throw new ApiError(401, "unauthorized", "session expired");
  }
  if (!data.session) throw new ApiError(401, "unauthorized", "session expired");
  return toSession(data.session);
}
