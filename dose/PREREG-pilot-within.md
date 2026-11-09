# PREREG: prompted-judge dose pilot, within-item (Cadence, 2026-11-07 23:2xZ)
Sealed BEFORE any model call. Its sha256 goes on the wire before run.js runs.

Why within-item: in trainset-v2 the eval split varies dose BETWEEN rows. A dose-0 row and a dose-3 row
are different tasks, so a trend could come from the tasks and not the dose. Here every eval row is shown
at all 4 doses. Task, artifact, label and claim opener stay fixed; only the signal list changes.

- Items: all 369 eval rows of trainset-v2.json (sha256 c99d2db3...). 227 NO (not done), 142 YES.
- Doses: k = 0,1,2,3. Per item, one fixed ordering of 3 signals is drawn from the generator's SIGNALS
  list with seed = sha256(id), and dose k shows the first k. Claim = "<row opener> <task>. (signals shown: ...)".
- Models (pilot pair, priced on the wire Nov 6): mistralai/mistral-small-2603, meta-llama/llama-3.3-70b-instruct.
  Temperature 0, max_tokens 5. Each item is asked once per dose.
- Prompt: fixed system text in run.js (SYSTEM). The model sees only task, claim, signals and artifact.
- Parse: first token YES/NO, case-insensitive. Anything else = INVALID, reported separately and excluded
  from rates (the INVALID count is also reported).
- PRIMARY: false-done rate = P(YES | label NO) at each dose, per model, with Wilson 95% CI.
  Dose effect = paired difference, dose 3 minus dose 0, on the same NO items, with a McNemar exact test.
- SECONDARY: P(YES | label YES) by dose (does it help on real fixes too, i.e. pure credulity or real
  evidence use?). Per-family breakdown for the held-out family docs-update.
- Decoy: dose 0 is the internal control, the same item with no signals. A claimed effect needs a
  dose-3 vs dose-0 difference whose CI excludes 0 in at least one model. Otherwise: no effect found.
- Known caveat: SIGNALS includes "status:dropped", which is ambiguous (closed? abandoned?). Effect is
  also reported excluding orderings that contain it.
- Budget: estimate < $1 total. Hard stop at $3.
