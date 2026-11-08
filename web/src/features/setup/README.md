# setup

`/setup` env checklist: one row per `envSchema` key with status ok / missing / invalid.

- Provenance: derived from `shared/env.ts` at request time, never from `env()` (it throws on invalid).
- Invariant: values and Zod messages never reach the DOM. How-to text is `setup.vars.<KEY>` in fr.json, generic fallback otherwise.
- Steps: `steps.ts` maps key prefix -> step; copy `setup.steps.<id>` in fr.json; `docs/install.md` kept in sync by `installDoc.test.ts`. New service = one `steps` entry + copy + doc section.
- Gating: env invalid -> checklist only. Env ok + no Couple -> checklist + first-run form. Env ok + Couple exists -> redirect `/`. No setup secret (KISS); `createFirstCouple` re-checks via `create_couple` (null = exists) because server actions are directly callable.
- Bootstrap: `server/firstRun.ts` creates the auth user (admin), calls `create_couple` (partner_a + Couple, service role only), deletes the user on failure, then signs in. `hasCouple` lives in `server/couple.ts` so it is not a server action.
