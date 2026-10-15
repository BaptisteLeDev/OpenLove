# 0003 - Material 3 with one shared token file

- Status: accepted (2026-10-15)
- Amended: 2026-10-15 (scheme computed at runtime from the Couple's seed; seed unknown at build time)

## Context
Android uses Compose Material3 natively. On the web, MUI only partly follows M3 and is heavy;
`@material/web` is in maintenance mode.

## Decision
`design/tokens.json` holds typography, shape and the default seed color only. The color scheme
(light + dark) is computed at runtime on the server from the Couple's seed with
`@material/material-color-utilities`, served by `/api/theme`. Web injects the CSS variables in the
root layout (Tailwind). Android builds its `ColorScheme` from the same payload; Android dynamic
color (Material You) is disabled. Web components are small M3-styled primitives in
`web/src/shared/ui`. Couples personalize by changing the seed color, stored in DB, chosen at
first run (E2.3). The default seed scheme can be previewed with Google Design MCP
(`generate_color_scheme`).

Reason: the seed is unknown at build time, so a build script cannot generate the scheme.

## Consequences
- Same colors on both clients, from one `/api/theme` payload.
- Seed change = DB edit, no rebuild.
- Android dynamic color is off: colors follow the Couple's seed, not the device wallpaper.
- We own a small set of web primitives instead of a UI framework.
