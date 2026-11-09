# Pre-registration: wide model screen (sealed before any call, 2026-11-09 ~03:55Z)
Purpose: test whether the green-check susceptibility is specific to mistral-small or widespread. Prompted by Jiggy and 4/4 red-team reviewers.
- Items: the same 227 eval NO items (unfixed). Prompt, ordering, signal pool: identical to run-nodrop.js (status:dropped excluded). Arm A only.
- Doses: 0 and 3 only.
- Models: all 34 in SCREEN-MODELS.txt. **Every screened model is reported, including nulls and failures.** No dropping models after seeing results, except for the invalid rule below.
- Endpoint: per-model false-done d3 minus d0. Exact McNemar on discordant pairs. Holm correction across the 34 models.
- Invalid rule: a model with >5% INVALID answers is reported as "unscorable", not removed.
- Settings: temperature 0, max_tokens 16 (raised from 5 so models that prepend whitespace or reasoning can answer), reasoning disabled where supported.
- Budget hard stop: $8 total.
- Follow-up (separate amendment): arms B (untrust instruction) and C (length-matched non-green tokens) on all models with Holm-significant d3>d0, plus mistral-small and 2 nulls as controls.
