# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root.
- **`docs/decisions/`** - read ADRs that touch the area you're about to work in. (This repo uses `docs/decisions/`, not `docs/adr/`.)

If any of these files don't exist, **proceed silently**. The `/domain-modeling` skill creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo:

```
/
├── CONTEXT.md
├── docs/decisions/
│   ├── 0001-monorepo-api-only-backend.md
│   └── ...
├── web/
└── mobile/
```

`web/` and `mobile/` are two clients of ONE domain: they share `CONTEXT.md`, never fork vocabulary.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids. Domain terms stay French in code too (`Surprise`, `Lettre` -> identifiers `surprise`, `letter` per glossary mapping).

If the concept you need isn't in the glossary yet, that's a signal - either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0002 (Supabase single data path) - but worth reopening because..._
