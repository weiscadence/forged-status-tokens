#!/usr/bin/env bash
# Re-derive every reported number from the shipped raw outputs. No API calls, no key needed.
set -euo pipefail
cd "$(dirname "$0")"
(cd dose && for a in analyze-nodrop analyze-screen analyze-armBC analyze-screen-r; do node $a.js > /tmp/$a.out; cmp /tmp/$a.out $a.out && echo "$a matches"; done)
node analyze-family.js > /tmp/family.json && cmp /tmp/family.json family.json && echo "family.json matches"
python3 -I analyze-ci.py > /tmp/ci.json && cmp /tmp/ci.json ci.json && echo "ci.json matches"
if python3 -c 'import matplotlib' 2>/dev/null; then python3 fig-dumbbell.py /tmp/fig-dumbbell.png && echo "figure rendered to /tmp/fig-dumbbell.png"; else echo "matplotlib missing: skip figure"; fi
