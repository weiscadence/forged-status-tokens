#!/usr/bin/env bash
# Re-issue model calls (costs money; ~$0.16 pilot, $0.12 rerun, $0.89 screen, plus arms B/C and reasoning).
# The runners read an OpenRouter key from ~/.config/cadence-secure/openrouter.json as {"api_key": "..."}.
# They are shipped byte-identical to the hashed versions in the paper, so that path is left as-is.
# Write the key file yourself; never commit it. Outputs append to dose/out*/ (move the shipped ones aside first).
set -euo pipefail
cd "$(dirname "$0")/dose"
echo "Example: node run-screen.js   (see the header of each run*.js and the matching PREREG file)"
