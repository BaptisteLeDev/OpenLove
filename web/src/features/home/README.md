# home

Accueil: the first screen of a Partenaire. Holds the Compteur.

- Language: Compteur (`milestone`) = time elapsed since the Couple's start date, as years, months,
  days and total days. See `CONTEXT.md`.
- Language: Prochaine date (`upcomingDate`) = nearest Dates spéciales (`specialDate`) within 30 days.
  Only Dates spéciales in v1, no calendar events. Feb 29 recurs as Feb 28 in non-leap years.
- Provenance: Partenaire names (`getPartnerNames`), start date and `time_zone` come from the Couple row. "Today" is computed in the
  Couple time zone (`todayIn`) from the SERVER clock, never the client's.
- Invariants: future start date gives all zeros; months are anchored on the start date with the
  day clamped to month end (31 Jan + 1 month = 29 Feb in 2024). Domain uses built-ins only.
- Invariants (Prochaine date): private dates are hidden by RLS on `private_to`, never filtered in
  app code. Nearest date wins; ties broken by label.
