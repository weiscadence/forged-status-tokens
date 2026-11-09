# Amendment: arms B and C follow-up (sealed 2026-11-09 ~04:40Z, after screen results, before any B/C call)
Screen result: 12/34 models Holm-significant d3>d0 (all c=0 or near). 7 models UNSCORABLE (100% INVALID: API 400 "reasoning mandatory"/reasoning_effort unsupported): claude-sonnet-5.5, gemini-3.5-flash-lite, gemini-3.8-flash, mistral-large-4-0, grok-4.7, glm-5.3, glm-5.3-flash. Their 0/0 is NOT a null.
- Arm B: untrust instruction. Arm C: length-matched non-green tokens. Doses 0 and 3, same 227 items, same settings, temp 0.
- Positives (Holm<0.05): mistral-small-2603, deepseek-v4-pro, mistral-medium-3-5, qwen3.7-plus, command-a, llama-3.1-8b, llama-4-maverick, phi-4, seed-2.0-mini, qwen3.8-27b, kimi-k3, granite-4.2-8b.
- Controls: nulls with valid answers: claude-haiku-5.5, gpt-6.1-terra (+ qwen3.8-flash). Borderline (not Holm-sig) minimax-m3, deepseek-v4.1-flash reported only.
- Unscorable models: rerun in a separate amendment with reasoning enabled and max_tokens raised; not part of B/C.
- Analysis: exact McNemar B-vs-A d3 and C-vs-A d3 per model, Holm across models. Budget hard stop $4.
Implementation note: run-v3.js runs B at d0,d3 and C at d3 (C d0 == A d0, no signals shown). Order of signals: seeded per-row sha256(id) shuffle, same as screen (randomized per row, not fixed). Models/scripts: V3-MODELS.txt, run-v3.js.
