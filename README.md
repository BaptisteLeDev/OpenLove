# OpenLove

> A clean, self-hostable love app for couples: realtime chat, time-locked surprises and letters,
> shared collections and calendar. Web (PWA) and Android, one instance per couple.

**OpenLove** is the open-source rewrite of a private couple's app. Nothing personal ships: no
names, no private content, no personal assets. You deploy it, you configure it, it becomes yours.

> Status: pre-code. Architecture and plan are settled; implementation starts with Epic E0.

## Features (v1)

- **Home** - milestone counter, next date countdown, mood of the day
- **Chat** - realtime messages, typing indicator, read receipts, images, GIFs, shared places
  (map preview, opens in Google Maps). Text encrypted at rest.
- **Surprises & letters** - written ahead, revealed by the server clock only (spoiler-proof)
- **Collections** - places, movies (TMDB), activities, shared between the two partners
- **Calendar** - special dates, subscribed `.ics` calendars, reminders
- **Push notifications** - Firebase Cloud Messaging on web and Android, no message content shown
- **Your photos, your cloud** - media stored in your own Supabase Storage (Google Drive later)
- **Material 3** - one seed color themes both the web app and the Android app
- **Android app** - scan a QR code on the web settings page, done

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

## Docs

- [ARCHITECTURE.md](ARCHITECTURE.md) - layout, rules, security fixes
- [CONTEXT.md](CONTEXT.md) - domain vocabulary
- [docs/decisions/](docs/decisions/) - architecture decision records

## License

MIT
