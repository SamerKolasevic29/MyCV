#!/usr/bin/env bash
# =========================================================
#  build-articles.sh
#  Skenira assets/Articles/*.md, čita front matter i pravi
#  assets/Articles/articles.json (to učitava stranica).
#
#  Upotreba (iz root-a repoa):   bash scripts/build-articles.sh
#
#  Imenovanje fajlova:   <slug>.<jezik>.md
#      tmv-intro.en.md   tmv-intro.bs.md
#
#  Front matter na vrhu svakog .md fajla:
#      ---
#      title: Naslov članka
#      date: 2026-11-01
#      tag: Article
#      description: Kratak opis za listu
#      ---
# =========================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIR="$ROOT/assets/Articles"
OUT="$DIR/articles.json"

# vrijednost ključa iz front matter-a (prvi blok između --- i ---)
fm_get() {
    awk -v key="$2" '
        NR == 1 && $0 !~ /^---[ \t\r]*$/ { exit }
        NR > 1  && $0 ~ /^---[ \t\r]*$/  { exit }
        NR > 1 {
            i = index($0, ":")
            if (i > 1 && substr($0, 1, i - 1) == key) {
                v = substr($0, i + 1)
                sub(/^[ \t]+/, "", v); sub(/[ \t\r]+$/, "", v)
                print v; exit
            }
        }' "$1" | sed -E "s/^[\"']//; s/[\"']$//"
}

# prvi "# Naslov" iz teksta (fallback ako nema title u front matter-u)
first_h1() { sed -n -E 's/^#[ \t]+(.*[^ \t\r])[ \t\r]*$/\1/p' "$1" | head -n 1; }

json_esc() { printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/\t/ /g'; }

shopt -s nullglob
entries=()

for f in "$DIR"/*.md; do
    base="$(basename "$f")"
    name="${base%.md}"                 # tmv-intro.en
    lang="${name##*.}"                 # en
    slug="${name%.*}"                  # tmv-intro

    # fajl bez jezičnog sufiksa (npr. neki.md) tretira se kao engleski
    if [[ "$name" != *.* ]]; then slug="$name"; lang="en"; fi

    title="$(fm_get "$f" title)";       [[ -z "$title" ]] && title="$(first_h1 "$f")"
    [[ -z "$title" ]] && title="$slug"
    date="$(fm_get "$f" date)";         [[ -z "$date" ]] && date="$(date -r "$f" +%F)"
    tag="$(fm_get "$f" tag)";           [[ -z "$tag" ]] && tag="Article"
    desc="$(fm_get "$f" description)"

    entries+=("$(printf '  {"slug":"%s","lang":"%s","file":"%s","date":"%s","tag":"%s","title":"%s","desc":"%s"}' \
        "$(json_esc "$slug")" "$(json_esc "$lang")" "$(json_esc "$base")" "$(json_esc "$date")" \
        "$(json_esc "$tag")" "$(json_esc "$title")" "$(json_esc "$desc")")")
done

{
    echo "["
    for i in "${!entries[@]}"; do
        if (( i < ${#entries[@]} - 1 )); then echo "${entries[$i]},"; else echo "${entries[$i]}"; fi
    done
    echo "]"
} > "$OUT"

echo "Wrote $OUT (${#entries[@]} file(s))"
