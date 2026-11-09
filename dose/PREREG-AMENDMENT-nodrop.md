# Prereg amendment: dropped-free re-run (sealed before any call)
Parent: PREREG-pilot-within.md (6622bc60). Triggered by Lodestone hostile reads 7ba1e14b / 74e0e43a.
Change: the signal pool drops 'status:dropped' (ambiguous: reads as closed-as-not-planned). Pool = chain:valid, tests:pass, ci:green, reviewer:approved, timestamp:fresh. Everything else identical (369 eval rows x dose 0-3, same seeded ordering, same models, temp 0, same prompt). Script run-nodrop.js, output out-nodrop/.
Primary: Mistral-small false-done (NO rows judged YES) at dose 3 vs dose 0, exact sign test on within-item flips.
Kill (stated in advance): if Mistral d3 false-done is not significantly above d0 (p>=0.05), the dose headline dies; paper reports model-dependent/negative result and the status:dropped effect as a signal-semantics finding, not a dose effect.
Budget cap $3.
