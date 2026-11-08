# theme

Material 3 color scheme and type/shape tokens, served by `/api/theme` to web and Android.

- Provenance: the Couple's `seed` (`couples` table, read via `adminClient`); `design/tokens.json` seed when no Couple or read fails.
- Invariant: only validated `#rrggbb` hex strings and numbers reach the `<style>` tag.
- Decision: [ADR 0003](../../../../docs/decisions/0003-material3-shared-tokens.md).
