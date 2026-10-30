# Contribuer à OpenLove

Merci de vouloir aider. OpenLove est un projet petit et assumé : lis cette page, puis
[ARCHITECTURE.md](ARCHITECTURE.md) et [CONTEXT.md](CONTEXT.md), avant d'écrire du code.

En participant, tu acceptes le [Code de conduite](CODE_OF_CONDUCT.md). Les failles de sécurité passent
par [SECURITY.md](SECURITY.md), jamais par une issue publique.

## Comment aider

- **Signaler un bug ou proposer une fonctionnalité** : ouvre une issue avec le modèle. Décris le
  problème avant la solution.
- **Améliorer la doc** : fautes, étapes d'installation peu claires, chaînes FR manquantes.
- **Prendre une issue** : cherche les labels `ready-for-agent` ou `ready-for-human` (voir
  [labels de triage](docs/agents/triage-labels.md)).

Pas sûr que ça colle ? Ouvre d'abord une issue. Une courte discussion évite une PR refusée.

## Principes

À lire avant d'ouvrir une PR. Ce sont des règles, pas des préférences :

- **KISS / YAGNI / DRY** : pas d'abstraction spéculative, pas de fonctionnalité « pour plus tard ».
  Troisième copie = extraire.
- **Architecture** : le domaine ne dépend de rien ; Android ne parle qu'à `/api/*` ; un client par
  service externe ; chaque route passe par `withContract`. Vérifié par `pnpm arch-test`.
- **Langage ubiquitaire** : le code utilise les termes de [CONTEXT.md](CONTEXT.md). Évite la colonne
  « à éviter ».
- **Zéro donnée personnelle** : pas de noms, emails, UUID, photos ni fixtures issus d'un vrai couple.
  Jamais.
- **i18n** : aucune chaîne UI en dur. Les textes vont dans `messages/fr.json` (web) ou `strings.xml`
  (Android).
- **Commentaires** : par défaut aucun. En écrire un seulement pour expliquer un *pourquoi* (compromis,
  bug amont).
- **Décisions** : contredire un ADR de [docs/decisions/](docs/decisions/) exige un nouvel ADR, pas un
  changement silencieux.

## Mise en place

Prérequis : Node.js LTS, pnpm, JDK 17+ et Android Studio (Android uniquement), Docker (pour Supabase).

```bash
npx supabase@2.121.0 start          # Postgres, Auth, Storage en local (Docker)
cd web && pnpm install && pnpm dev
cd mobile && ./gradlew :shared:allTests :androidApp:testDebugUnitTest :androidApp:lintDebug ktlintCheck
```

Supabase local : migrations dans `supabase/migrations/`, appliquées par `start` et
`npx supabase@2.121.0 db reset`. Pour pointer le web dessus et créer les comptes de dev
(`partner_a@example.com`, `partner_b@example.com`, `stranger@example.com`, mot de passe
`openlove-dev`) :

```bash
npx supabase@2.121.0 status -o env --override-name api.url=SUPABASE_URL,auth.anon_key=SUPABASE_ANON_KEY,auth.service_role_key=SUPABASE_SERVICE_ROLE_KEY > web/.env.local
cd web && pnpm seed                 # idempotent, refuse une URL non locale
```

Sans Supabase local, les tests RLS (`web/test/rls.test.ts`) sont ignorés avec un avertissement.

Tests d'acceptation web (Playwright, hors CI pour l'instant) : `web/.env.local` doit aussi
contenir les autres clés de `web/.env.example`.

```bash
cd web && npx playwright install chromium   # une fois
npx supabase@2.121.0 start && pnpm seed && pnpm e2e
```

## Fork et pull request

1. **Fork** le dépôt sur GitHub, puis clone ton fork.
2. **Branche depuis `dev`** dans ton fork, pas depuis `main`.
3. **Pousse** ta branche sur ton fork et **ouvre une pull request** vers `BaptisteLeDev/OpenLove`, base `dev`.
4. Le mainteneur relit. Il peut te demander des changements. Seul le mainteneur merge.

Tu ne merges jamais ta propre PR, et `dev` n'accepte aucun push direct hormis celui du mainteneur.
Le premier CI d'une PR venant d'un fork attend l'approbation du mainteneur (défaut GitHub pour les
nouveaux contributeurs).

## Workflow

1. **Issue d'abord.** Chaque changement est lié à une issue (sous-issue d'un Epic).
2. **Branche depuis `dev`** nommée `<numéro-issue>-<slug-court>`, par ex. `12-chat-typing-indicator`.
   Un worktree par issue est recommandé.
3. **Commits en Conventional Commits**, minuscules, sans point final, 75 caractères maximum :

   ```
   feat(chat): add typing indicator
   fix(reveal): compare revealAt with server clock
   docs(readme): add French translation
   ```

   Types : `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `perf`.
4. **Ouvre une PR en brouillon** vers `dev`. Brouillon = « In Review ». Passe-la en prête quand les
   checks sont verts.
5. **Checks verts** : `pnpm type-check && pnpm lint && pnpm test && pnpm arch-test && pnpm knip` (web),
   `:shared:allTests :androidApp:testDebugUnitTest` (mobile). Ajoute des tests pour chaque règle touchée.
6. **Revue** : au moins une approbation d'un mainteneur. Les changements sensibles (auth, API, accès
   aux données, saisie utilisateur) demandent aussi une revue sécurité avant merge.

Ne jamais ouvrir de PR vers `main`. `main` ne reçoit que des PR relues depuis `dev`.

## Checklist de PR

- [ ] Liée à une issue
- [ ] Titre en Conventional Commit
- [ ] Tests ajoutés ou mis à jour, checks verts
- [ ] Aucune donnée personnelle, aucun contenu de couple réel, aucun secret
- [ ] Doc mise à jour si le comportement ou l'installation change (README, ARCHITECTURE, CONTEXT, ADR)
- [ ] Chaînes traduites (FR), aucun texte UI en dur
- [ ] Plus petit c'est mieux : une préoccupation par PR

## Licence

En contribuant, tu acceptes que ta contribution soit publiée sous [licence MIT](LICENSE).

---

# Contributing to OpenLove (English)

Thanks for wanting to help. OpenLove is a small, opinionated project: read this page, then
[ARCHITECTURE.md](ARCHITECTURE.md) and [CONTEXT.md](CONTEXT.md), before writing code.

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). Security issues go through
[SECURITY.md](SECURITY.md), never through public issues.

## Ways to help

- **Report a bug or propose a feature**: open an issue with the template. Describe the problem before
  the solution.
- **Improve the docs**: typos, unclear setup steps, missing French strings.
- **Pick an issue**: look for `ready-for-agent` or `ready-for-human` labels (see
  [triage labels](docs/agents/triage-labels.md)).

Not sure it fits? Open an issue first. A short discussion saves a rejected PR.

## Principles

Read these before you open a PR. They are rules, not preferences:

- **KISS / YAGNI / DRY**: no speculative abstraction, no feature "for later". Third copy = extract.
- **Architecture**: domain depends on nothing; Android talks only to `/api/*`; one client per external
  service; every route goes through `withContract`. Enforced by `pnpm arch-test`.
- **Ubiquitous language**: code uses the terms of [CONTEXT.md](CONTEXT.md). Avoid its "avoid" column.
- **Zero personal data**: no names, emails, UUIDs, photos or fixtures from a real couple. Ever.
- **i18n**: no hardcoded UI string. Strings go in `messages/fr.json` (web) or `strings.xml` (Android).
- **Comments**: default none. Write one only when it explains a *why* (trade-off, upstream bug).
- **Decisions**: contradicting an ADR in [docs/decisions/](docs/decisions/) requires a new ADR, not a
  silent change.

## Development setup

Prerequisites: Node.js LTS, pnpm, JDK 17+ and Android Studio (Android only), Docker (for Supabase).

```bash
npx supabase@2.121.0 start          # local Postgres, Auth, Storage (Docker)
cd web && pnpm install && pnpm dev
cd mobile && ./gradlew :shared:allTests :androidApp:testDebugUnitTest :androidApp:lintDebug ktlintCheck
```

Local Supabase: migrations live in `supabase/migrations/`, applied by `start` and
`npx supabase@2.121.0 db reset`. To point the web app at it and create the dev accounts
(`partner_a@example.com`, `partner_b@example.com`, `stranger@example.com`, password
`openlove-dev`):

```bash
npx supabase@2.121.0 status -o env --override-name api.url=SUPABASE_URL,auth.anon_key=SUPABASE_ANON_KEY,auth.service_role_key=SUPABASE_SERVICE_ROLE_KEY > web/.env.local
cd web && pnpm seed                 # idempotent, refuses a non-local URL
```

Without local Supabase, the RLS tests (`web/test/rls.test.ts`) are skipped with a warning.

Web acceptance tests (Playwright, not in CI yet): `web/.env.local` must also hold the other keys
of `web/.env.example`.

```bash
cd web && npx playwright install chromium   # once
npx supabase@2.121.0 start && pnpm seed && pnpm e2e
```

## Fork and pull request

1. **Fork** the repository on GitHub, then clone your fork.
2. **Branch from `dev`** in your fork, not from `main`.
3. **Push** your branch to your fork and **open a pull request** against `BaptisteLeDev/OpenLove`, base `dev`.
4. The maintainer reviews. You may be asked to change things. Only the maintainer merges.

Your PR is never merged by you, and `dev` accepts no direct push from anyone but the maintainer.
The first CI run on a fork PR waits for maintainer approval (GitHub default for new contributors).

## Workflow

1. **Issue first.** Each change is linked to an issue (a sub-issue of an Epic).
2. **Branch from `dev`** named `<issue-number>-<short-slug>`, e.g. `12-chat-typing-indicator`. One
   worktree per issue is recommended.
3. **Commit with Conventional Commits**, lowercase, no period, 75 characters max:

   ```
   feat(chat): add typing indicator
   fix(reveal): compare revealAt with server clock
   docs(readme): add French translation
   ```

   Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `perf`.
4. **Open a draft PR** against `dev`. Draft = "In Review". Mark it ready when checks pass.
5. **Checks must be green**: `pnpm type-check && pnpm lint && pnpm test && pnpm arch-test && pnpm knip` (web),
   `:shared:allTests :androidApp:testDebugUnitTest` (mobile). Add tests for every rule you touch.
6. **Review**: at least one maintainer approval. Security-sensitive changes (auth, API, data access,
   user input) also get a security review before merge.

Never open a PR against `main`. `main` only receives reviewed PRs from `dev`.

## Pull request checklist

- [ ] Linked to an issue
- [ ] Conventional Commit title
- [ ] Tests added or updated, checks green
- [ ] No personal data, no real couple content, no secrets
- [ ] Docs updated if behaviour or setup changed (README, ARCHITECTURE, CONTEXT, ADR)
- [ ] Strings translated (FR) and no hardcoded UI text
- [ ] Smaller is better: one concern per PR

## License

By contributing you agree that your contribution is licensed under the [MIT License](LICENSE).

