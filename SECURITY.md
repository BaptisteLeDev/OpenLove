# Politique de sécurité

## Versions supportées

OpenLove est en pré-code. Aucune version n'est encore supportée. Une fois la v1 publiée, ce tableau
listera les versions supportées.

| Version | Supportée |
|---|---|
| `dev` (pré-release) | Au mieux |

## Signaler une vulnérabilité

**Ne pas ouvrir d'issue publique pour un problème de sécurité.**

Signaler en privé via le formulaire d'avis de sécurité GitHub :

👉 <https://github.com/BaptisteLeDev/OpenLove/security/advisories/new>

Indiquer :

- le composant touché (route `web/` API, app Android, migration, CI, docs...)
- les étapes de reproduction, ou une preuve de concept
- l'impact attendu (exposition de données, contournement d'auth, SSRF, faille RLS...)
- ton nom ou pseudo si tu veux être crédité

Ne pas inclure de secrets, de données personnelles réelles, ni de contenu issu d'une instance
couple en production.

## Délais

- Accusé de réception sous **7 jours**.
- Qualification et sévérité sous **14 jours**.
- Correctif ou mitigation aussi vite que la sévérité l'exige ; la date de divulgation se coordonne
  avec toi.
- Crédit dans les notes de version, sauf demande contraire.

## Périmètre

Dans le périmètre : tout ce dépôt (app web, `/api/*`, app Android, migrations Supabase et politiques
RLS, workflows CI, modèles de déploiement).

Hors périmètre : les vulnérabilités des services tiers (Supabase, Firebase, Vercel, TMDB, Nominatim),
sauf si la configuration OpenLove les rend exploitables. Les signaler au fournisseur.

## Conception sécurité

Les menaces connues et leurs correctifs sont listés dans
[ARCHITECTURE.md §6](ARCHITECTURE.md#6-security-fixes-carried-from-the-source-audit).
Chaque table a du RLS, chaque route passe par `withContract` (auth + Zod entrée/sortie), et la
révélation du contenu verrouillé dans le temps est décidée uniquement par l'horloge serveur.

---

# Security Policy (English)

## Supported versions

OpenLove is pre-code. No release is supported yet. Once v1 ships, this table lists the supported
versions.

| Version | Supported |
|---|---|
| `dev` (pre-release) | Best effort |

## Reporting a vulnerability

**Do not open a public issue for a security problem.**

Report it privately through GitHub's security advisory form:

👉 <https://github.com/BaptisteLeDev/OpenLove/security/advisories/new>

Include:

- the affected component (`web/` API route, Android app, migration, CI, docs...)
- steps to reproduce, or a proof of concept
- the impact you expect (data exposure, auth bypass, SSRF, RLS gap...)
- your name or handle if you want credit

Please do not send secrets, real personal data or content from a live couple instance in the report.

## What to expect

- Acknowledgement within **7 days**.
- Triage and severity assessment within **14 days**.
- A fix or mitigation as fast as the severity requires; we coordinate the disclosure date with you.
- Credit in the release notes, unless you ask otherwise.

## Scope

In scope: everything in this repository (web app, `/api/*`, Android app, Supabase migrations and RLS
policies, CI workflows, deploy templates).

Out of scope: vulnerabilities in third-party services (Supabase, Firebase, Vercel, TMDB, Nominatim),
unless OpenLove's configuration makes them exploitable. Report those to the provider.

## Security design

Known threats and their fixes are listed in [ARCHITECTURE.md §6](ARCHITECTURE.md#6-security-fixes-carried-from-the-source-audit).
Every table has RLS, every route goes through `withContract` (auth + Zod in/out), and the reveal
of time-locked content is decided by the server clock only.

