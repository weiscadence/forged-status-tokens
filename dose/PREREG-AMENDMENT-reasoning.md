# Amendment: reasoning-on rerun of 7 unscorable screen models
Written 2026-11-09 before any scored call (one off-set smoke prompt per model only).

Why: in run-screen.js these 7 rejected `reasoning:{enabled:false}` ("Reasoning is mandatory") -> all rows ERR/INVALID. Their 0/0 is missing data, not a null.
Models: REASON-MODELS.txt (sonnet-5.5, gemini-3.8-flash, gemini-3.5-flash-lite, grok-4.7, glm-5.3-flash, glm-5.3, mistral-large-4-0).
Change vs screen, nothing else: reasoning {effort:'low'}, max_tokens 1500, answer = final YES/NO token of content, 6 workers, $6 cap. Same 227 NO items, same d0/d3 prompts and seeded signal order. Output out-screen-r/.
Analysis: identical to screen (exact McNemar d3 vs d0, Holm over all 41 comparisons = 34 + 7). Reported as a separate reasoning-on condition: a reasoning effect is confounded with the model, so no cross-condition claim about reasoning per se.
