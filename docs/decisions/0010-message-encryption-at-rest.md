# 0010 - Message text encrypted app-side with AES-256-GCM

- Status: accepted (2026-10-30)

## Context
CONTEXT.md: Message text is encrypted at rest. A DB dump or a leaked service key must not reveal
chat content. Options: pgcrypto (key passed in SQL, lands in query logs), Vault/pgsodium (key lives
in the same database, pgsodium being deprecated upstream), app-side encryption.

## Decision
`web/src/features/messages/server/crypto.ts` encrypts with Node `aes-256-gcm` (random 12-byte IV,
auth tag, stored as base64 `iv|ciphertext|tag` in `messages.body_enc`). Key =
`MESSAGE_ENCRYPTION_KEY` (32 bytes base64) in the one Zod env schema, shown on `/setup`. The key
never enters the database.

## Consequences
- DB, backups and PostgREST only ever see ciphertext. Text cannot be searched in SQL.
- Losing or rotating the key makes old Messages unreadable. No rotation scheme in v1 (YAGNI).
- Only the server decrypts, so Android (API-only) gets plaintext over TLS, never the key.
- Authored metadata (author, time) stays in clear for ordering and RLS.
