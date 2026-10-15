# Architecture - OpenLove

One instance = one couple. Two clients (web, Android), one backend (Next.js `/api`), one data
path (Supabase). Decisions and their trade-offs live in [`docs/decisions/`](docs/decisions/).
Vocabulary: [`CONTEXT.md`](CONTEXT.md).

## 1. System

```
 Web (Next.js UI) ──cookie──┐
                            ├──> /api/* (Next.js route handlers) ──> Supabase (Postgres, Auth, Storage, Realtime)
 Android (Compose) ─Bearer──┘            │                      ──> FCM (push web + Android)
                                         └──> TMDB, Nominatim, GIF provider (one client each)
 Web only: Supabase Realtime (chat, typing) with the user's JWT, RLS-scoped.
```

- Android never talks to Supabase: `/api` is the only door ([ADR 0001](docs/decisions/0001-monorepo-api-only-backend.md)).
- No memory/cookie fallback: Supabase or nothing; `supabase start` for dev ([ADR 0002](docs/decisions/0002-supabase-single-data-path.md)).

## 2. Repo layout

```
web/
  src/app/                      pages + api route files (thin: parse -> feature -> respond)
  src/features/<feature>/
    domain/                     pure TS: rules, value objects. Imports nothing outside domain/.
    server/                     server-only: repos (Supabase), use cases calling domain
    ui/                         components + hooks for this feature
  src/shared/
    contracts/                  Zod schemas (API in/out) = source of contracts/*.json
    http/withContract.ts        auth (cookie|Bearer) + Zod in/out + error envelope
    supabase/                   ONE server client, ONE browser client
    env.ts                      ONE Zod env schema (also drives /setup checklist)
    ui/                         M3 primitives (Button, Card, TextField, Chip, Dialog...)
    i18n/                       next-intl, messages/fr.json
android/                        app/ (screens per feature), core/ (api client, auth, theme)
contracts/                      generated fixtures, decoded by Android contract tests
design/tokens.json              M3 tokens (seed color -> scheme), generates CSS vars + Compose theme
supabase/migrations/            SQL, RLS on every table
```

Features (bounded areas of one domain): `couple` (auth, pairing, partners), `home` (compteur,
prochaine date, humeur), `chat`, `reveal` (surprises, lettres), `collections`, `calendar`,
`media`, `notifications`, `settings`.

## 3. Rules (enforced by dependency-cruiser, `pnpm arch-test`)

1. `features/*/domain` imports nothing but itself and `shared/contracts` types.
2. `features/*/ui` never imports `features/*/server` nor `shared/supabase` server client.
3. Feature A never imports feature B internals; cross-feature = through `shared/` or a use case.
4. `src/app/api/**` = `withContract(...)` + one use-case call. Zero business logic.
5. Service-role key: `server-only` modules only.

Business rule needing a DB to test = rule leaked out of `domain/`.

## 4. API conventions

- `withContract(reqSchema, resSchema, {auth: 'partner' | 'cron' | 'public'}, handler)`.
- Envelope `{data: T} | {error: {code, message}}`, codes `unauthorized | forbidden |
  validation_failed | not_found | rate_limited | unavailable`, semantic HTTP status.
- Pagination: cursor `{items, nextCursor}` on chat messages only (cap 100, default 50).
- No versioning: `/api/*` = v1. Contracts are the compatibility promise to Android: a breaking
  schema change fails the Android contract test.

## 5. Cross-cutting

| Concern | Choice | ADR |
|---|---|---|
| Design system | Material 3 tokens from one `design/tokens.json`; Tailwind on web, Compose M3 on Android | [0003](docs/decisions/0003-material3-shared-tokens.md) |
| Push | FCM for web and Android, one `notify(recipient, payload)` | [0004](docs/decisions/0004-fcm-single-push-provider.md) |
| Mobile login | QR pairing from `/settings` (instance URL + one-time code), manual fallback | [0005](docs/decisions/0005-qr-pairing-mobile.md) |
| Media | `MediaStore` port: Supabase Storage (private bucket, signed URLs); Google Drive later | [0006](docs/decisions/0006-mediastore-port.md) |
| Chat realtime | Web: Supabase Realtime. Android: FCM wake + 3 s polling while chat open | [0001](docs/decisions/0001-monorepo-api-only-backend.md) |
| Chat crypto | AES-256-GCM at rest, server key. Documented as at-rest, NOT E2E | - |
| Config | One Zod env schema; `/setup` renders checklist (Vercel, Supabase, Firebase, keys) | - |
| i18n | next-intl / `strings.xml`, FR only in v1 | - |
| Deploy | Vercel button (v1). Docker/VPS after all features + UX | - |

## 6. Security fixes carried from the source audit

| # | Source gap | Fix in OpenLove |
|---|---|---|
| S1 | Identity guessed from email prefix / metadata | `couple_members` table: user UUID -> `partner_a`/`partner_b` |
| S2 | Unvalidated `request.json()` | `withContract` everywhere |
| S3 | CSP `unsafe-inline`/`unsafe-eval` | nonce via middleware |
| S4 | ICS fetch SSRF (DNS rebinding, CGNAT) | pinned lookup, block private + `100.64/10` |
| S5 | Rate limiter per-isolate, hourly cap dead | Postgres-backed limiter, separate windows |
| S6 | Push token upsert on endpoint = hijack | unique `(user_id, token)` |
| S7 | Notification click opens any URL | same-origin check |
| S8/S9 | Tables without RLS / `USING(true)` | RLS deny-all + `couple_id` policies on every table |
| S10 | Token-only paths under session gate | explicit `auth` mode per route in `withContract` |
| S11 | Legacy CryptoJS MD5+CBC | GCM only, no legacy path |
| S12 | Unbounded `limit` | cap 100 |
| S13 | CSRF only on login | SameSite=Lax + Origin check on cookie mutations; Bearer exempt |
| new | Pairing code brute force | 5 min TTL, single use, rate limited |

## 7. Docs

Root `README.md` (users), this file (contributors), `CONTEXT.md` (language), `docs/decisions/`
(why), `docs/install.md` + in-app `/setup` (deploy), `web/src/features/*/README.md` once a feature
has invariants worth stating.
