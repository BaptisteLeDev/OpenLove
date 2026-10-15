# 0005 - Android login by QR pairing

- Status: accepted (2026-10-15)

## Context
The APK is generic (GitHub Releases) and each couple runs its own instance, so the app must learn
the instance URL. Typing a URL and credentials on a phone is error-prone.

## Decision
`/settings` (logged-in web) shows a QR with the instance URL and a one-time pairing code
(5 min TTL, single use, rate limited). The app exchanges it at `/api/pairing` for a session
(access + refresh token). Fallback: manual URL + email/password. The future Chrome extension
reuses the same pairing.

## Consequences
- No global API token (`EXTENSION_API_TOKEN` of the source is gone).
- Pairing endpoint is a brute-force target: TTL + rate limit are mandatory.
