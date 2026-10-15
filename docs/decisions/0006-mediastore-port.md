# 0006 - `MediaStore` port for couple photos

- Status: accepted (2026-10-15)

## Context
Photos (chat images, surprise images) must live in the couple's own cloud, not in the repo.
Google Photos API only exposes app-created content since 2025. Google Drive needs OAuth and a
Google Cloud project.

## Decision
Port `MediaStore { put, signedUrl, delete }`. v1 adapter: Supabase Storage private bucket, signed
URLs, client-side compression before upload. Google Drive adapter (`drive.file` scope, folder
"OpenLove") in a later Epic. The port exists because two implementations are planned and scoped.

## Consequences
- Zero extra setup in v1 (couple already has Supabase, 1 GB free).
- Drive adapter must pass the same contract tests as the Supabase one.
