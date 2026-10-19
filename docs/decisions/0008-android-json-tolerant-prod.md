# 0008 - Android JSON: tolerant in prod, strict in contract tests

- Status: accepted (2026-10-19)

## Context
One web deploy serves every installed APK. Old APKs are not force-updated. A strict
`kotlinx.serialization` decoder throws on any unknown key, so adding a field to a `/api/*` response
would break every APK already in the wild.

## Decision
- Prod: one `Json { ignoreUnknownKeys = true }`, shared by the Ktor client (`ContentNegotiation`).
- Contract tests (`ContractTest`): `ignoreUnknownKeys = false` against `contracts/*.json`, so a field
  the server sends but Android does not model fails the build.
- Server rule: adding a response field is safe; renaming, removing or retyping one is breaking and
  needs a version path.

## Consequences
- A server field Android forgot to model is caught in CI, never at runtime.
- Missing required fields still throw in prod: tolerance covers additions only.
