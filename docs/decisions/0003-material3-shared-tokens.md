# 0003 - Material 3 with one shared token file

- Status: accepted (2026-10-15)

## Context
Android uses Compose Material3 natively. On the web, MUI only partly follows M3 and is heavy;
`@material/web` is in maintenance mode.

## Decision
`design/tokens.json` (M3 scheme from a seed color, light + dark) is the single source. A script
generates CSS variables consumed by Tailwind on the web and a Kotlin `ColorScheme` on Android.
Web components are small M3-styled primitives in `web/src/shared/ui`. Couples personalize by
changing the seed color. Schemes can be produced with Google's Design MCP (`generate_color_scheme`)
or `@material/material-color-utilities`.

## Consequences
- Same colors on both clients, one edit.
- We own a small set of web primitives instead of a UI framework.
