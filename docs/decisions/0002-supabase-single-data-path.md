# 0002 - Supabase as the single data path, no fallback mode

- Status: accepted (2026-10-15)

## Context
The source app degraded to in-memory stores and cookies when Supabase was absent. Every feature
had two code paths and half the tests covered the fallback.

## Decision
Supabase (Postgres, Auth, Storage, Realtime) is required. Local dev runs `supabase start`.
Missing config -> the `/setup` page, not a degraded app. RLS on every table with `couple_id`.

## Consequences
- Half the data code disappears.
- A contributor needs Docker for `supabase start`.
- Self-host without Supabase cloud = run self-hosted Supabase (advanced, documented later).
