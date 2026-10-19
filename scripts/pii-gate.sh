#!/usr/bin/env bash
set -euo pipefail

allowed_mail='@(example\.com|example\.org|users\.noreply\.github\.com|anthropic\.com)$'
generic=(
  '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
  '/(home|Users)/[A-Za-z0-9._-]+/'
  '(^|[^0-9])(\+33[ .-]?|0)[1-9]([ .-]?[0-9]{2}){4}([^0-9]|$)'
)
mail='[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'

files=()
while IFS= read -r -d '' f; do
  [ "$(basename "$f")" = pnpm-lock.yaml ] || files+=("$f")
done < <(git ls-files -z)

hits=$(mktemp)
trap 'rm -f "$hits"' EXIT
scan() {
  local rc=0
  grep -InHoE -e "$1" -- "${files[@]}" >>"$hits" || rc=$?
  [ "$rc" -le 1 ] || { echo "pii-gate: invalid pattern #${2:-?}" >&2; exit 2; }
}

[ "${#files[@]}" -gt 0 ] || { echo "pii-gate: no tracked files"; exit 0; }

for p in "${generic[@]}"; do scan "$p"; done
rc=0
mails=$(grep -InHoE -e "$mail" -- "${files[@]}") || rc=$?
[ "$rc" -le 1 ] || { echo "pii-gate: email scan failed" >&2; exit 2; }
if [ -n "$mails" ]; then grep -vE "$allowed_mail" <<<"$mails" >>"$hits" || true; fi

if [ -n "${PII_DENYLIST:-}" ]; then
  n=0
  while IFS= read -r p; do
    n=$((n + 1))
    [ -z "$p" ] || scan "$p" "$n"
  done <<<"$PII_DENYLIST"
else
  echo "pii-gate: PII_DENYLIST empty, private patterns skipped"
fi

if [ -s "$hits" ]; then
  echo "pii-gate: forbidden data found (file:line:match)"
  sort -u "$hits"
  exit 1
fi
echo "pii-gate: clean"
