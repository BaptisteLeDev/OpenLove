import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const IV = 12;
const TAG = 16;

export function encrypt(key: Buffer, text: string): string {
  const iv = randomBytes(IV);
  const c = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([c.update(text, "utf8"), c.final()]);
  return Buffer.concat([iv, body, c.getAuthTag()]).toString("base64");
}

export function decrypt(key: Buffer, blob: string): string {
  const raw = Buffer.from(blob, "base64");
  const d = createDecipheriv("aes-256-gcm", key, raw.subarray(0, IV));
  d.setAuthTag(raw.subarray(raw.length - TAG));
  return Buffer.concat([d.update(raw.subarray(IV, raw.length - TAG)), d.final()]).toString("utf8");
}
