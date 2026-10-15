# OpenLove - Domain context

Business language is French (UI and conversation). Code identifiers in English, mapped below.

## Actors

| Term | Code | Definition | Avoid |
|---|---|---|---|
| **Couple** | `couple` | The two people one instance serves. Exactly one per instance. | tenant, group |
| **Partenaire** | `partner` (`partner_a`, `partner_b`) | One of the two members. Display name comes from branding. | user (in domain code), owner |
| **Instance** | `instance` | One deployment (URL) of OpenLove. | server, site |
| **Appairage** | `pairing` | Linking the Android app to an Instance by scanning a QR from `/settings`. | login (it is not one) |
| **Code d'appairage** | `pairingCode` | One-time, 5 min code inside the QR, exchanged for a session. | token |

## Home

| Term | Code | Definition | Avoid |
|---|---|---|---|
| **Compteur** | `milestone` | Time elapsed since the couple's start date. | timer |
| **Prochaine date** | `upcomingDate` | Next Date spéciale or calendar event within 30 days. | next event |
| **Humeur** | `mood` | A Partenaire's mood of the day, one per day. | status |

## Révélation (time-locked content)

| Term | Code | Definition | Avoid |
|---|---|---|---|
| **Surprise** | `surprise` | Post written ahead, invisible until `revealAt`. | post, message |
| **Lettre** | `letter` | Letter from one Partenaire to the other, revealed at a chosen date. | deferred letter |
| **Révélation** | `reveal` | The moment server clock passes `revealAt`. Client clock never decides. | unlock |
| **Archive** | `archive` | All revealed Surprises and Lettres. | timeline |

## Chat

| Term | Code | Definition | Avoid |
|---|---|---|---|
| **Message** | `message` | Chat entry: text, Média, GIF or Lieu partagé. Text encrypted at rest. | post |
| **Média** | `media` | Image stored through `MediaStore` in the couple's own storage. | file, upload |
| **Lieu partagé** | `sharedPlace` | Message carrying coordinates + label, preview map, opens in Maps. | location |
| **Vu** | `readAt` | Read receipt on a Message. | seen flag |
| **En train d'écrire** | `typing` | Ephemeral typing signal. | |

## Collections (from source glossary, kept)

| Term | Code | Definition | Avoid |
|---|---|---|---|
| **Item** | `item` | One entry of a Collection. Aggregate root. | entry, card, todo |
| **Collection** | `kind` | All Items of one kind. Exactly three. | list |
| **Activité** | `activity` | Things to do together. | todo |
| **Cinéma** | `movie` | Films/series watchlist (TMDB). | film |
| **Favoris** | `place` | Places/restaurants. | lieu (generic) |
| **status** | `pending` / `done` | Labelled per kind: à faire/fait, à voir/vu, à prévoir/déjà allé. | todo |
| **watch_mode** | `download` / `stream` | Cinéma only, orthogonal to status. | |
| **Auteur** | `createdBy` | Partenaire who added the Item. Item stays co-owned. | owner |

## Calendar

| Term | Code | Definition | Avoid |
|---|---|---|---|
| **Date spéciale** | `specialDate` | Personal recurring date (anniversary...). Can be private to one Partenaire. | event |
| **Source de calendrier** | `calendarSource` | Subscribed `.ics` URL (https, SSRF-guarded). | feed |
| **Rappel** | `reminder` | Push sent by the daily cron before a date. | notification (generic) |

## Rules worth knowing

- Unrevealed Surprise/Lettre never leaves the server, not even its title.
- Every Item, Message, Média belongs to the Couple; Auteur is display only.
- Push for chat never contains Message content (lock-screen privacy).
