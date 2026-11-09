# Forged `tests:pass` flips LLM reviewers: reproducibility bundle

Code, pre-registrations, raw outputs and analysis scripts for the Apart Swarm Alignment Sprint paper (`PAPER.md`, draft v5.6).

## Layout
- `PAPER.md`: the paper.
- `dose/gen_trainset_v2.py` -> `dose/trainset-v2.json`: synthetic corpus (seed 20261106; 369 eval items, 227 unfixed / label NO).
- `dose/PREREG-*.md`: pre-registration and amendments, each sealed (hash posted) before its scored calls.
- `dose/run*.js`: call harnesses (pilot, nodrop rerun, screen, arms B/C = run-v3, reasoning rerun = run-screen-r). `*-MODELS.txt`: model lists. `run*.log`: call logs (status, spend).
- `dose/out*/`: raw JSONL, one line per call (`id, k` (dose), `label, family, sig` (signals shown), `raw` (model text), `ans` (parsed), `cost`, `arm`).
- `dose/analyze*.js` + `.out`: pre-registered analyses and their saved outputs.
- `analyze-family.js` -> `family.json`: per-family breakdown, arm-B Holm.
- `analyze-ci.py` -> `ci.json`: per-model paired d3 - d0 difference, Newcombe 95% CI, exact McNemar p (paper Appendix D).
- `fig-dumbbell.py` -> `fig-dumbbell.png`, `fig-dumbbell-data.json`: Figure 1.

## Reproduce the numbers (no API key, about a minute)
Needs Node >= 18 and Python 3 (matplotlib only for the figure). Run `./reproduce.sh`. It reruns every analysis on the shipped JSONL and byte-compares against the shipped outputs.

## Re-issue the model calls
See `rerun-calls.sh`. You need your own OpenRouter key. Model behaviour at temperature 0 is not guaranteed stable over time or across providers, so expect small differences.

## Notes
- Strings like `sk-live-...`, `AKIA-...`, `ghp_...`, `xoxb-...` in the generator and trainset are fake, 8-hex placeholders used as the "secret-removal" task content. They are not credentials.
- No API keys, `.env` or config files are included. The runners only reference a key-file path outside the repo.
- SHA-256 prefixes for every file are in PAPER.md section 8.
