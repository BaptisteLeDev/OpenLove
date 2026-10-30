export const PAIRING_TTL_SECONDS = 300;

export function pairingUri(instanceUrl: string, code: string): string {
  return `openlove://pair?instance=${encodeURIComponent(instanceUrl)}&code=${code}`;
}

export type PairingQr = { qr: string; expiresAt: string };
