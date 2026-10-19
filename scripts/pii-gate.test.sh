#!/usr/bin/env bash
set -euo pipefail

gate="$(cd "$(dirname "$0")" && pwd)/pii-gate.sh"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
fail=0
# fixtures built at runtime so this file passes the gate itself
tail=426614174000 dom=gmail.com hm=home d=

run_gate() {
  (cd "$tmp" && PII_DENYLIST="${1:-}" bash "$gate" >/dev/null 2>&1) && echo 0 || echo $?
}

expect() {
  local name="$1" want="$2" got="$3"
  if [ "$got" = "$want" ]; then echo "ok   $name"; else echo "FAIL $name (want $want, got $got)"; fail=1; fi
}

git -C "$tmp" init -q
git -C "$tmp" config user.email t@example.com
git -C "$tmp" config user.name t
reset() { git -C "$tmp" rm -rqf --ignore-unmatch . >/dev/null; rm -f "$tmp"/*.txt; }
plant() { printf '%s\n' "$2" > "$tmp/$1"; git -C "$tmp" add "$1"; }

plant clean.txt "nothing to see, mail a@example.com"
expect clean 0 "$(run_gate)"

plant uuid.txt "id 123e4567-e89b-42d3-a456-$tail"
expect uuid 1 "$(run_gate)"
reset

plant mail.txt "write to bob@${dom}"
expect email 1 "$(run_gate)"
reset

plant path.txt "see /${hm}/alice/notes"
expect home-path 1 "$(run_gate)"
reset

plant phone.txt "call 0${d}6 12 34 56 78"
expect phone 1 "$(run_gate)"
reset

plant plus33.txt "call +${d}33 6 12 34 56 78"
expect phone-+33 1 "$(run_gate)"
reset

plant deny.txt "my secret-token-xyz here"
expect denylist-hit 1 "$(run_gate 'secret-token-xyz')"
expect denylist-empty 0 "$(run_gate '')"
expect denylist-bad-regex 2 "$(run_gate '(')"
reset

plant lock.txt "ok"
mkdir -p "$tmp/web" && printf "id 123e4567-e89b-42d3-a456-%s\n" "$tail" > "$tmp/web/pnpm-lock.yaml"
git -C "$tmp" add web/pnpm-lock.yaml
expect lockfile-skipped 0 "$(run_gate)"

exit "$fail"
