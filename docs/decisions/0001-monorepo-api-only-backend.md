# 0001 - Monorepo, Next.js `/api` as the only backend

- Status: accepted (2026-10-15)
- Amended: 2026-10-15 (chat realtime is signal only: text encrypted at rest, browser cannot decrypt Realtime payload)

## Context
Web and Android must stay in sync. The source app let the web talk to Supabase from many places,
and its Android branch had to mirror that surface by hand.

## Decision
One repo: `web/` (Next.js UI + `/api`), `mobile/` (KMP, see [0009](0009-kmp-shared-mobile-core.md)), `contracts/`, `design/`, `supabase/`. No pnpm
workspace. Android calls only `/api/*` with a Bearer JWT. Contracts are Zod schemas exported as
JSON fixtures; Android decodes them in a contract test (no code generation).

Chat realtime: web uses Supabase Realtime (user JWT, RLS) as signal only: a Broadcast or change
event carrying the message id, no content. The client refetches via `/api/chat`. Reason: chat text
is encrypted at rest with the server key, so the browser cannot decrypt a Realtime payload.
Android uses the same fetch path: FCM data push to wake, then fetch, plus 3 s polling while the chat
screen is open. SSE rejected: long-lived connections on Vercel cost and time out.

## Consequences
- One place to validate, authorize and rate-limit.
- Android chat latency is a few seconds, acceptable for two users.
- Breaking a schema breaks the Android build: intended.
- Realtime payload holds no content: a missed signal is recovered only by the next refetch.
