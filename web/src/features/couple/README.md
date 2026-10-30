# couple

The Couple an instance serves and its two Partenaires.

- Language: Couple (`couples`), Partenaire (`couple_members`, role `partner_a` | `partner_b`).
- Provenance: identity = `couple_members` row keyed by the auth account id (S1), never email or
  metadata. Schema in `supabase/migrations/*_couple.sql`; dev data from `web/scripts/seed.ts`.
- Invariants: one Couple per account (`user_id` primary key), at most 2 Partenaires per Couple
  (`unique (couple_id, role)`). RLS on both tables, read-only to members of the same Couple via
  `private.my_couple_id()` (S8/S9); writes go through the service role only. "One Couple per
  instance" is enforced by bootstrap, not the DB.
- Web login: server action `server/auth.ts` (`signIn`, `signOut`). An account outside the Couple
  is signed out and refused. `src/proxy.ts` only checks session presence; the Accueil page
  checks membership.
- Appairage: `server/pairing.ts`. Code stored as sha256 only, TTL 5 min, single use via atomic
  delete-returning, membership re-checked at exchange, one live code per Partenaire. Session minted
  by admin `generateLink` magiclink + `verifyOtp`. Limiter: Postgres fixed window, keys
  `pairing:<ip>` / `login:<ip>`, 10 per 15 min (`domain/limits.ts`). [ADR 0005](../../../../docs/decisions/0005-qr-pairing-mobile.md).
- Decision: [ADR 0002](../../../../docs/decisions/0002-supabase-single-data-path.md).
