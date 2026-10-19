# home

Accueil: the first screen of a Partenaire. Holds the Compteur.

- Language: Compteur (`milestone`) = time elapsed since the Couple's start date, as years, months,
  days and total days. See `CONTEXT.md`.
- Provenance: start date and `time_zone` come from the Couple row. "Today" is computed in the
  Couple time zone (`todayIn`) from the SERVER clock, never the client's.
- Invariants: future start date gives all zeros; months are anchored on the start date with the
  day clamped to month end (31 Jan + 1 month = 29 Feb in 2024). Domain uses built-ins only.
