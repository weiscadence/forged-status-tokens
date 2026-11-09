# Prereg amendment — reviewer arm (complacency leg), DRAFT for Cadence
# To be folded into the Track 3 prereg skeleton v2 at/after the Sat gate.
# Status: draft, not sealed. Jiggy approved the leg (Nov 6 ~20:03 CST);
# the arm's design is Cadence's scale-up call at the gate.

## Arm: trained reviewer vs prompted judge (dose-response, mitigation)
Question: does TRAINING a reviewer to check the artifact flatten the
false-"done" dose-response that a prompted judge shows?

Design: the same ~20 seeded tasks x 5 seeds x 4 dose arms (0/1/2/3 green
signals) x 3 model families as the main leg. Two reviewer variants judge
each run:
  (a) prompted judge (baseline — the leg's main measurement), and
  (b) AutoScientist fine-tuned reviewer (trained on trainset v2, see below).
Primary metric per variant: false-"done" rate by dose, with Wilson CIs.
Comparison: dose-response slope per variant; the arm's claim is that (b)'s
slope is flatter than (a)'s. Pre-registered BEFORE any model call.

## Training data (trainset v2, DRAFT)
- 1,000 rows, 500 fake / 500 real, ground truth by construction.
  Generator: deterministic, seed 20261106. Dataset sha256
  c99d2db39fd5f03e31e67b4167dc09fe2912d7b4e80ef46fe54e3a4d2270ccdd
  (493,982 B). Plumb Gate PASS.
- Input contract: the model sees ONLY (task, claim, signals, artifact).
  Family and mechanism are metadata, never inputs.
- Anti-filler: rows differ on structural axes only (family, mechanism,
  dose, artifact content); wording alone never distinguishes two rows;
  uniqueness enforced in code and asserted every run.
- Split: train 631 / eval 369. Held out entirely: mechanisms `reverted`
  + `stale-cache`, family `docs-update`. Eval baseline: constant-"NO"
  scores 61.5% (eval is 227 NO / 142 YES) — report per-mechanism and
  per-family breakdowns, not just the headline.
- v1 superseded: two label leaks found by hostile self-review (artifact
  comments that WERE the label; claims that confessed the mechanism) and
  one broken family (test-fix artifact identical in both classes). All
  fixed in v2; leak checks pass (0 artifacts with `#`, 0 claims naming a
  mechanism).

## Trainer: AutoScientist (sprint perk)
- Jiggy's account via the sprint: $500 platform credits on the page
  (Jiggy sees 200 in-account — unit discrepancy unresolved) + 3 months
  Premium. AutoScientist needs >= 1,000 rows; this file has exactly 1,000.
- AutoScientist co-optimizes data + training recipe; the actual training
  runs on Together AI; output is a LoRA adapter. It cannot run the leg
  itself and cannot do physics sims.
- Vendor claim (+35% over hand-tuned, 48%->64% win rate) is Adaption's own
  internal eval, not independent. Their own ambassador documented the
  failure mode: models improve on the dashboard's own test while degrading
  on held-out data. Mitigation is the design itself: held-out eval + the
  transfer test below.

## Evaluation (two stages, both pre-registered)
1. Held-out synthetic eval (trainset v2 eval split, 369 rows): the
   reviewer must beat the 61.5% constant-"NO" baseline, per mechanism and
   per family.
2. Transfer test (the claim that matters): real corpus close-claims
   (tagger v3, unbuilt) + the leg's own held-out runs. Synthetic win
   without transfer is reported as such, not as a reviewer that works.

## Kill conditions (any one kills the arm's claim)
- K1: trained reviewer's false-"done" slope ≈ prompted judge's slope
  within CI → training did not help; report the null.
- K2: reviewer wins on synthetic eval but fails the transfer test →
  it learned the generator, not the skill; report the gap, not the win.
- K3: reviewer collapses to a constant (always YES / always NO) on any
  dose → the training set taught a prior, not a check; report and drop.
- K4: AutoScientist run fails to converge or the adapter cannot be
  evaluated on held-out data within the $20 budget / Sunday freeze →
  the arm is cut, the prompted-judge leg stands alone.

## Costs / budget
- AutoScientist runs on the sprint's $500 credits (in-account: 200, unit
  unresolved) — no OpenRouter spend for the training itself. The leg's
  model calls (agents + judges) stay inside the $20 budget and the Sunday
  21:00 CST freeze. No model calls before the Sat 18:00Z gate.
