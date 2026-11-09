// Pre-registered secondary: per-task-family breakdown of d0->d3 flips (NO items),
// screen (arm A), reasoning rerun (end-of-string scorer), arms B/C. Plus Holm over arm-B tests.
// Usage: node analyze-family.js > family.json   (run from projects/apart-swarm)
const fs = require('fs'), D = __dirname + '/dose/';
const POS = ['mistralai_mistral-small-2603','deepseek_deepseek-v4-pro','mistralai_mistral-medium-3-5','qwen_qwen3.7-plus','cohere_command-a','meta-llama_llama-3.1-8b-instruct','meta-llama_llama-4-maverick','microsoft_phi-4','bytedance-seed_seed-2.0-mini','qwen_qwen3.8-27b','moonshotai_kimi-k3','ibm-granite_granite-4.2-8b'];
const last = t => { const m = [...String(t).matchAll(/\b(YES|NO)\b/g)]; return m.length ? m[m.length-1][1] : 'INVALID'; };
const load = (f, rescore) => fs.readFileSync(f,'utf8').trim().split('\n').map(JSON.parse)
  .filter(r => r.label === 'NO').map(r => rescore ? {...r, ans: last(r.raw)} : r);
function binom2(a, b) { // exact two-sided McNemar
  const n = a + b; if (!n) return 1; const k = Math.min(a, b); let s = 0, c = 1;
  for (let i = 0; i <= n; i++) { if (i > 0) c = c * (n - i + 1) / i; if (i <= k) s += c; }
  return Math.min(1, 2 * s / Math.pow(2, n));
}
function flips(rows, armX, kX, armY, kY) { // items NO(or not YES) under X, YES under Y
  const g = (a, k) => new Map(rows.filter(r => (r.arm || 'A') === a && r.k === k).map(r => [r.id, r]));
  const X = g(armX, kX), Y = g(armY, kY); const fam = {}, famN = {}; let up = 0, dn = 0, inv = 0;
  for (const [id, x] of X) { const y = Y.get(id); if (!y) continue;
    if (x.ans === 'INVALID' || y.ans === 'INVALID') { inv++; continue; }
    famN[x.family] = (famN[x.family] || 0) + 1;
    if (x.ans !== 'YES' && y.ans === 'YES') { up++; fam[x.family] = (fam[x.family] || 0) + 1; }
    if (x.ans === 'YES' && y.ans !== 'YES') dn++; }
  return { up, dn, inv, p: binom2(up, dn), famFlips: fam, famN };
}
const out = { screen: {}, reasoning: {}, armB: {}, totals: {} };
for (const f of fs.readdirSync(D + 'out-screen').sort()) out.screen[f.replace('.jsonl','')] = flips(load(D+'out-screen/'+f), 'A',0,'A',3);
for (const f of fs.readdirSync(D + 'out-screen-r').sort()) out.reasoning[f.replace('.jsonl','')] = flips(load(D+'out-screen-r/'+f, true), 'A',0,'A',3);
// family totals across the 12 Holm-positive screen models
const tot = {}; let all = 0, onlyTF = 0;
for (const m of POS) { const r = out.screen[m]; all += r.up;
  for (const [k, v] of Object.entries(r.famFlips)) tot[k] = (tot[k] || 0) + v;
  if (Object.keys(r.famFlips).every(k => k === 'test-fix')) onlyTF++; }
out.totals = { positiveModels: POS.length, flipsAll: all, flipsByFamily: tot, modelsOnlyTestFix: onlyTF,
  familyN: out.screen[POS[0]].famN };
// arm B: Holm over A3->B3 and B0->B3 across the 11 B-scorable positives (kimi excluded: >5% INVALID)
const tests = [];
for (const f of fs.readdirSync(D + 'out-v3').sort()) { const m = f.replace('.jsonl','');
  const v3 = load(D+'out-v3/'+f), sc = load(D+'out-screen/'+f), both = sc.concat(v3);
  const a3b3 = flips(both,'A',3,'B',3), b3a3 = flips(both,'B',3,'A',3), b0b3 = flips(v3,'B',0,'B',3);
  // A3->B3 reductions: up = A3 YES & B3 NO
  const red = { down: b3a3.up, up: a3b3.up, p: binom2(b3a3.up, a3b3.up) };
  const b0 = v3.filter(r => r.arm==='B' && r.k===0 && r.ans==='YES').length;
  const b3 = v3.filter(r => r.arm==='B' && r.k===3 && r.ans==='YES').length;
  const binv = v3.filter(r => r.arm==='B' && r.ans==='INVALID').length;
  out.armB[m] = { B0: b0, B3: b3, Binvalid: binv, A3toB3: red, B0toB3: { up: b0b3.up, dn: b0b3.dn, p: b0b3.p }, B0toB3famFlips: b0b3.famFlips };
  if (POS.includes(m) && m !== 'moonshotai_kimi-k3') { tests.push([m,'A3toB3',red.p]); tests.push([m,'B0toB3',b0b3.p]); } }
const s = tests.map((t,i)=>[...t,i]).sort((a,b)=>a[2]-b[2]); let run = 0; const M = s.length;
for (let i = 0; i < M; i++) { run = Math.max(run, Math.min(1, (M - i) * s[i][2])); out.armB[s[i][0]][s[i][1]].pHolm = run; }
out.armB._holmM = M;
console.log(JSON.stringify(out, null, 1));
