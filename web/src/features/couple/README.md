# couple

The Couple an instance serves and its two Partenaires.

- Language: Couple (`couples`), Partenaire (`couple_members`, role `partner_a` | `partner_b`).
- Provenance: identity = `couple_members` row keyed by the auth account id (S1), never email or
  metadata. Schema in `supabase/migrations/*_couple.sql`; dev data from `web/scripts/seed.ts`.
- Invariants: one Couple per account (`user_id` primary key), at most 2 Partenaires per Couple
  (`unique (couple_id, role)`). RLS on both tables, read-only to members of the same Couple via
  `private.my_couple_id()` (S8/S9); writes go through the service role only. "One Couple per
  instance" is enforced by bootstrap, not the DB.
- Decision: [ADR 0002](../../../../docs/decisions/0002-supabase-single-data-path.md).
