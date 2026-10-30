export const PAIRING_TTL_SECONDS = 300;
export const PAIRING_LIMIT = { max: 10, windowSeconds: 900 };

export function pairingUri(instanceUrl: string, code: string): string {
  return `openlove://pair?instance=${encodeURIComponent(instanceUrl)}&code=${code}`;
}
