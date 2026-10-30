# 0009 - Mobile core in Kotlin Multiplatform, UI native per platform

- Status: accepted (2026-10-30)

## Context
Android is the first mobile client. An iOS app (E15, post-v1) would otherwise re-implement the
`/api/*` client, envelope, DTOs, JSON config and cache by hand, and drift from Android.
Web stays outside this stack ([ADR 0001](0001-monorepo-api-only-backend.md)).

## Decision
- Layout: `mobile/shared` (KMP: `commonMain`, `androidMain`, `iosMain`) and `mobile/androidApp`
  (current Android `:app`). `iosApp/` (SwiftUI) comes with E15.
- `shared` holds: Ktor API client (engine via `expect`/`actual`: OkHttp on Android, Darwin on iOS),
  envelope and contract DTOs, `kotlinx.serialization` `Json` with the tolerant config of
  [ADR 0008](0008-android-json-tolerant-prod.md), SQLDelight cache, session store as `expect`/`actual`.
- UI stays native: Compose Material3 on Android, SwiftUI on iOS.
- Rejected for now: Compose Multiplatform UI; Swift Export (until stable). iOS consumes `shared`
  through SKIE + XCFramework.
- Web is NOT part of KMP: it stays Next.js/TypeScript. Cross-platform sharing with web goes through
  Zod contracts exported as `contracts/*.json`, decoded by the Kotlin contract tests.
- Still true: Android and iOS call only `/api/*` with a Bearer JWT, never Supabase direct.

## Consequences
- One Ktor client, one envelope, one cache for both mobile platforms.
- iOS targets compile in CI only when a macOS runner is affordable; otherwise `iosMain` is checked
  in E15.
- Shared code cannot use Android-only APIs: platform code lives in `androidMain`/`iosMain` only.
- Paths in CI, PII gate, `CLAUDE.md`, `ARCHITECTURE.md` move from `android/` to `mobile/`.
