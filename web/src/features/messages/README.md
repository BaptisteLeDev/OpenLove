# messages

Chat between the two Partenaires of a Couple.

- Language: Message (`messages`), text only in this slice. See `CONTEXT.md`.
- Provenance: `/api/messages` (GET cursor list, POST send) and the `/messages` page, both via
  `server/messages.ts`. Ordering and cursor = identity `id` (newest first, `cursor` = last id seen).
- Invariants: `limit` 1..100 (Zod, default 50). Text trimmed, 1..4000 chars. Text encrypted with
  AES-256-GCM before insert ([ADR 0010](../../../../docs/decisions/0010-message-encryption-at-rest.md)).
  RLS: read and insert scoped to `private.my_couple_id()`, insert needs `author_id = auth.uid()`.
  No update/delete grant.
