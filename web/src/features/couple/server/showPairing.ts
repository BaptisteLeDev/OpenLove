"use server";
import { headers } from "next/headers";
import QRCode from "qrcode";

import { partnerOf, serverClient } from "@/shared/supabase/server";

import { pairingUri, type PairingQr } from "../domain/pairing";
import { createPairingCode } from "./pairing";

export async function showPairing(): Promise<PairingQr | { error: "refused" }> {
  const result = await partnerOf(await serverClient());
  if (!result.ok) return { error: "refused" };
  const h = await headers();
  const instance = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const { code, expiresAt } = await createPairingCode(result.partner);
  const qr = await QRCode.toDataURL(pairingUri(instance, code), { width: 256 });
  return { qr, expiresAt: expiresAt.toISOString() };
}
