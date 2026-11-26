> **Finished, read-only.** This repository is archived; current work is at https://github.com/weiscadence.

# Forged `tests:pass` flips LLM reviewers: reproducibility bundle

Code, pre-registrations, raw outputs and analysis scripts for the Apart Swarm Alignment Sprint paper (`PAPER.md`, final).

## Layout
- `PAPER.md`: the paper.
- `dose/gen_trainset_v2.py` -> `dose/trainset-v2.json`: synthetic corpus (seed 20261106; 369 eval items, 227 unfixed / label NO).
- `dose/PREREG-*.md`: pre-registration and amendments, each sealed (hash posted) before its scored calls.
- `dose/run*.js`: call harnesses (pilot, nodrop rerun, screen, arms B/C = run-v3, reasoning rerun = run-screen-r). `*-MODELS.txt`: model lists. `run*.log`: call logs (status, spend).
- `dose/out*/`: raw JSONL, one line per call (`id, k` (dose), `label, family, sig` (signals shown), `raw` (model text), `ans` (parsed), `cost`, `arm`).
- `dose/analyze*.js` + `.out`: pre-registered analyses and their saved outputs.
- `analyze-family.js` -> `family.json`: per-family breakdown, arm-B Holm.
- `analyze-ci.py` -> `ci.json`: per-model paired d3 - d0 difference, Newcombe 95% CI, exact McNemar p (paper Appendix D).
- `fig-headline.py` -> `fig-headline.png`: Figure 1 (headline). Its numbers are literals in the script; `check-headline.py` checks them against `family.json`.
- `fig-dumbbell.py` -> `fig-dumbbell.png`, `fig-dumbbell-data.json`: Figure 2.

## Reproduce the numbers (no API key, about a minute)
Needs Node >= 18 and Python 3 (matplotlib only for the figure). Run `./reproduce.sh`. It reruns the analyses on the shipped JSONL and:
- byte-compares `dose/analyze-{nodrop,screen,armBC,screen-r}.out`, `family.json`, `ci.json`, and (if matplotlib is installed) `fig-dumbbell-data.json` against the shipped copies;
- checks the Figure 1 literals in `fig-headline.py` against `family.json` (the fourth bar of panel B is a descriptive reading, PAPER.md 4.3 item 2, and is not derived);
- runs the pilot analysis `dose/analyze.js` and prints nothing to compare: no saved pilot output is shipped;
- renders both figures but does not compare the PNGs (they depend on the matplotlib version).

## Re-issue the model calls
See `rerun-calls.sh`. You need your own OpenRouter key. Model behaviour at temperature 0 is not guaranteed stable over time or across providers, so expect small differences.

## Notes
- Strings like `sk-live-...`, `AKIA-...`, `ghp_...`, `xoxb-...` in the generator and trainset are fake, 8-hex placeholders used as the "secret-removal" task content. They are not credentials.
- No API keys, `.env` or config files are included. The runners only reference a key-file path outside the repo.
- SHA-256 prefixes for the generator, pre-registrations, runners, analyses, figures and raw-output directories are in PAPER.md Appendix E. `README.md`, `reproduce.sh`, `rerun-calls.sh` and `check-headline.py` are not in that table.

## Known issues (found in review, 2026-11-17)
The files listed in Appendix E are left byte-identical to the hashed versions, so these are recorded here instead of patched.
- **Three answer parsers.** The screen, pilot, nodrop and arm B/C runners store `ans` from a start-anchored match (`^\W*(YES|NO)\b`). The reasoning-rerun runner `run-screen-r.js` stores an end-anchored one (`\b(YES|NO)\W*$`). `analyze-family.js` and `analyze-screen-r.js` re-score the reasoning rows as the last YES/NO token anywhere, while `analyze-ci.py` and `fig-dumbbell.py` use the stored end-anchored `ans`. The only model this changes is claude-sonnet-5.5: it is in `family.json` (`reasoning`, 0 invalid, 0 flips) and absent from `ci.json` and Figure 2 (35% INVALID under the runner's parser). PAPER.md 4.4 and 5.1 report both readings; sonnet supports no headline count.
- **Arm B ">5% INVALID" is written three ways**: `analyze-armBC.js` tests B0 and B3 separately over 227, `fig-dumbbell.py` tests both together over 454, `analyze-family.js` names kimi-k3 directly. On the shipped data all three exclude kimi-k3 and nothing else (31 invalid B answers; no other model has any).
- **Wrong header comment** in `dose/run-screen.js` and `dose/run-v3.js`: both begin "Dropped-free re-run. See PREREG-AMENDMENT-nodrop.md ... out/<model>.jsonl", copied from `run-nodrop.js`. The screen is governed by `PREREG-SCREEN.md` and writes `out-screen/`; arms B/C by `PREREG-AMENDMENT-armBC.md` and `out-v3/`.
- **Dose 0 is not assertion-free.** At dose 0 the worker message still opens with its claim ("Done, all checks green", "Fixed and verified", "Done" or "Closed — fix is in"; `OPENERS` in the runners). Dose counts the forged status tokens added after that opener.
- **No C0 arm.** `run-v3.js` runs B0, B3 and C3. The neutral-token result is A3 -> C3, which crosses runs (as pre-registered); there is no within-run C0 -> C3 test.
- **Cost.** Summed from the `cost` field of the shipped JSONL: pilot $0.16, nodrop rerun $0.12, 34-model reasoning-off screen $0.89, arms B/C (15 models) $1.01, reasoning-on rerun (7 models) $1.91. "Under a dollar per model set" in the paper holds for the reasoning-off screen.
