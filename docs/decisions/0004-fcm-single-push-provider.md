# 0004 - FCM for web and Android push

- Status: accepted (2026-10-15)

## Context
Android needs FCM anyway. The source used VAPID web push, a second provider with its own keys and
token table.

## Decision
FCM for both clients behind one server function `notify(recipient, payload)`. Tokens stored with
unique `(user_id, token)`. Chat pushes carry no message content and are grouped.

## Consequences
- One provider, one client, one token table.
- Each couple creates a Firebase project: covered by the `/setup` guide.
