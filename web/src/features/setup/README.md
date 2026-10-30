# setup

`/setup` env checklist: one row per `envSchema` key with status ok / missing / invalid.

- Provenance: derived from `shared/env.ts` at request time, never from `env()` (it throws on invalid).
- Invariant: values and Zod messages never reach the DOM. How-to text is `setup.vars.<KEY>` in fr.json, generic fallback otherwise.
- Steps: `steps.ts` maps key prefix -> step; copy `setup.steps.<id>` in fr.json; `docs/install.md` kept in sync by `installDoc.test.ts`. New service = one `steps` entry + copy + doc section.
