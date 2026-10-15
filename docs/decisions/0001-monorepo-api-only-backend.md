# 0001 - Monorepo, Next.js `/api` as the only backend

- Status: accepted (2026-10-15)

## Context
Web and Android must stay in sync. The source app let the web talk to Supabase from many places,
and its Android branch had to mirror that surface by hand.

## Decision
One repo: `web/` (Next.js UI + `/api`), `android/`, `contracts/`, `design/`, `supabase/`. No pnpm
workspace. Android calls only `/api/*` with a Bearer JWT. Contracts are Zod schemas exported as
JSON fixtures; Android decodes them in a contract test (no code generation).

Chat realtime: web uses Supabase Realtime (user JWT, RLS). Android uses an FCM data push to wake
plus 3 s polling while the chat screen is open. SSE rejected: long-lived connections on Vercel cost
and time out.

## Consequences
- One place to validate, authorize and rate-limit.
- Android chat latency is a few seconds, acceptable for two users.
- Breaking a schema breaks the Android build: intended.
