#!/usr/bin/env bash
# Re-derive the reported numbers from the shipped raw outputs. No API calls, no key needed.
# Byte-compared against shipped outputs: the four dose/analyze-*.out files, family.json, ci.json,
# and (with matplotlib) fig-dumbbell-data.json. The Figure 1 literals in fig-headline.py are
# checked against family.json. Not byte-compared: the pilot analysis (dose/analyze.js, no saved
# output is shipped; it is run and printed) and the two PNGs (renderer-dependent).
# PYTHON=/path/to/python picks the interpreter (default python3).
set -euo pipefail
cd "$(dirname "$0")"
PY=${PYTHON:-python3}
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
(cd dose && for a in analyze-nodrop analyze-screen analyze-armBC analyze-screen-r; do node $a.js > "$T/$a.out"; cmp "$T/$a.out" $a.out && echo "$a matches"; done)
node analyze-family.js > "$T/family.json" && cmp "$T/family.json" family.json && echo "family.json matches"
"$PY" -I analyze-ci.py > "$T/ci.json" && cmp "$T/ci.json" ci.json && echo "ci.json matches"
"$PY" -I check-headline.py > "$T/headline.txt" || { cat "$T/headline.txt"; echo "fig-headline.py literals DIFFER from family.json"; exit 1; }
echo "fig-headline.py literals match family.json (panel B bar 4 is descriptive, not derived)"
(cd dose && node analyze.js > "$T/pilot.out") && echo "pilot analysis ran ($(grep -c '^## ' "$T/pilot.out") models; no shipped output to compare, see dose/analyze.js)"
if "$PY" -c 'import matplotlib' 2>/dev/null; then
  # fig-dumbbell.py rewrites fig-dumbbell-data.json next to itself: keep the shipped copy, compare, put it back.
  cp fig-dumbbell-data.json "$T/shipped-data.json"
  "$PY" fig-dumbbell.py "$T/fig-dumbbell.png" > /dev/null
  cp fig-dumbbell-data.json "$T/new-data.json"; cp "$T/shipped-data.json" fig-dumbbell-data.json
  cmp "$T/new-data.json" fig-dumbbell-data.json && echo "fig-dumbbell-data.json matches"
  "$PY" fig-headline.py "$T/fig-headline.png" && echo "both figures rendered (PNGs not byte-compared)"
else echo "matplotlib missing: figures and fig-dumbbell-data.json NOT checked"; fi
