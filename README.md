# OpenLove

[![Licence : MIT](https://img.shields.io/github/license/BaptisteLeDev/OpenLove)](LICENSE)
[![Statut : pré-code](https://img.shields.io/badge/statut-pr%C3%A9--code-lightgrey)](#statut)
[![Contributions bienvenues](https://img.shields.io/badge/contributions-bienvenues-brightgreen)](CONTRIBUTING.md)
[![Code de conduite](https://img.shields.io/badge/code%20de%20conduite-Contributor%20Covenant-blue)](CODE_OF_CONDUCT.md)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)

> Une application de couple propre et auto-hébergeable : chat temps réel, surprises et lettres
> verrouillées dans le temps, collections partagées et calendrier. Web (PWA) et Android, une
> instance par couple.

**OpenLove** est la réécriture open source de l'application privée d'un couple. Rien de personnel
n'est livré : ni noms, ni contenu privé, ni éléments personnels. Tu déploies, tu configures, et ça
devient la tienne.

## À propos

Conçue pour deux personnes, pas pour une plateforme. Une instance sert un seul couple, tu gardes
tes données (ton Supabase, ton stockage), et la révélation des surprises est décidée par l'horloge
du serveur : rien ne peut être spoilé depuis le client.

## Statut

Pré-code. L'architecture et le plan sont posés ; l'implémentation démarre avec l'Epic E0. Suis
l'avancement sur le tableau de projet GitHub.

## Fonctionnalités (v1)

- **Accueil** : compteur de jalon, compte à rebours de la prochaine date, humeur du jour
- **Chat** : messages temps réel, indicateur de frappe, accusés de lecture, images, GIF, lieux
  partagés (aperçu de carte, ouverture dans Google Maps). Texte chiffré au repos.
- **Surprises et lettres** : écrites à l'avance, révélées par l'horloge serveur uniquement
  (sans spoiler)
- **Collections** : lieux, films (TMDB), activités, partagées entre les deux partenaires
- **Calendrier** : dates spéciales, calendriers `.ics` abonnés, rappels
- **Notifications push** : Firebase Cloud Messaging sur web et Android, aucun contenu de message
  affiché
- **Tes photos, ton cloud** : médias stockés dans ton propre Supabase Storage (Google Drive plus tard)
- **Material 3** : une seule couleur de base thème l'app web et l'app Android
- **App Android** : scanner un QR code sur la page réglages du web, et c'est tout

Plus tard : RadioBox (playlists YouTube partagées), extension Chrome, stockage Google Drive,
installation Docker/VPS, locale anglaise.

## Stack

| Couche | Choix |
|---|---|
| Web + API | Next.js (App Router) + TypeScript strict + Tailwind (tokens M3) + next-intl |
| Validation | Zod (env, entrée/sortie API), exporté en contrats JSON pour Android |
| Données | Supabase (Postgres + RLS, Auth, Storage, Realtime) |
| Push | Firebase Cloud Messaging |
| Android | Kotlin + Jetpack Compose Material 3 + Ktor |
| Outillage | pnpm, Vitest, Playwright, ESLint, Biome, dependency-cruiser, knip |

## Démarrage rapide (sans terminal)

1. Cliquer sur **Deploy to Vercel** (lien ajouté à la première version).
2. Ouvrir ton nouveau site : la page **/setup** te guide pour Supabase, Firebase et les clés à
   coller dans Vercel, en vérifiant chacune en direct.
3. Renseigner vos prénoms, la date de début et la couleur. Terminé.
4. Android : télécharger l'APK depuis Releases, ouvrir **Réglages** sur le web, scanner le QR code.

## Contribuer

Lis d'abord [CONTRIBUTING.md](CONTRIBUTING.md). La participation est régie par le
[Code de conduite](CODE_OF_CONDUCT.md). Signale les vulnérabilités en privé, voir
[SECURITY.md](SECURITY.md).

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) : structure, règles, correctifs de sécurité
- [CONTEXT.md](CONTEXT.md) : vocabulaire du domaine
- [docs/decisions/](docs/decisions/) : décisions d'architecture (ADR)
- [CONTRIBUTING.md](CONTRIBUTING.md) : comment contribuer
- [SECURITY.md](SECURITY.md) : comment signaler une vulnérabilité
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) : règles de la communauté

## Licence

[MIT](LICENSE)

---

# OpenLove (English)

[![License: MIT](https://img.shields.io/github/license/BaptisteLeDev/OpenLove)](LICENSE)
[![Status: pre-code](https://img.shields.io/badge/status-pre--code-lightgrey)](#status)
[![Contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-Contributor%20Covenant-blue)](CODE_OF_CONDUCT.md)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)

> A clean, self-hostable love app for couples: realtime chat, time-locked surprises and letters,
> shared collections and calendar. Web (PWA) and Android, one instance per couple.

**OpenLove** is the open-source rewrite of a private couple's app. Nothing personal ships: no
names, no private content, no personal assets. You deploy it, you configure it, it becomes yours.

## About

Built for two people, not for a platform. One instance serves one couple, you own the data
(your Supabase, your storage), and the reveal of surprises is decided by the server clock so
nothing can be spoiled from the client.

## Status

Pre-code. Architecture and plan are settled; implementation starts with Epic E0. Follow the
progress on the GitHub project board.

## Features (v1)

- **Home**: milestone counter, next date countdown, mood of the day
- **Chat**: realtime messages, typing indicator, read receipts, images, GIFs, shared places
  (map preview, opens in Google Maps). Text encrypted at rest.
- **Surprises & letters**: written ahead, revealed by the server clock only (spoiler-proof)
- **Collections**: places, movies (TMDB), activities, shared between the two partners
- **Calendar**: special dates, subscribed `.ics` calendars, reminders
- **Push notifications**: Firebase Cloud Messaging on web and Android, no message content shown
- **Your photos, your cloud**: media stored in your own Supabase Storage (Google Drive later)
- **Material 3**: one seed color themes both the web app and the Android app
- **Android app**: scan a QR code on the web settings page, done

Later: RadioBox (shared YouTube playlists), Chrome extension, Google Drive storage, Docker/VPS
install, English locale.

## Stack

| Layer | Choice |
|---|---|
| Web + API | Next.js (App Router) + TypeScript strict + Tailwind (M3 tokens) + next-intl |
| Validation | Zod (env, API in/out), exported as JSON contracts for Android |
| Data | Supabase (Postgres + RLS, Auth, Storage, Realtime) |
| Push | Firebase Cloud Messaging |
| Android | Kotlin + Jetpack Compose Material 3 + Ktor |
| Tooling | pnpm, Vitest, Playwright, ESLint, Biome, dependency-cruiser, knip |

## Quick start (no terminal)

1. Click **Deploy to Vercel** (link added at first release).
2. Open your new site: the **/setup** page walks you through Supabase, Firebase and the keys to
   paste into Vercel, checking each one live.
3. Set your names, start date and color. Done.
4. Android: download the APK from Releases, open **Settings** on the web, scan the QR code.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) first. Participation is governed by the
[Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities privately, see [SECURITY.md](SECURITY.md).

## Docs

- [ARCHITECTURE.md](ARCHITECTURE.md): layout, rules, security fixes
- [CONTEXT.md](CONTEXT.md): domain vocabulary
- [docs/decisions/](docs/decisions/): architecture decision records
- [CONTRIBUTING.md](CONTRIBUTING.md): how to contribute
- [SECURITY.md](SECURITY.md): how to report a vulnerability
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md): community standards

## License

[MIT](LICENSE)

