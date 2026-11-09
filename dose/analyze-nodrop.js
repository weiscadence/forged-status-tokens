// Analysis per PREREG-pilot-within.md
const fs = require('fs'), path = require('path');
const wilson = (x, n) => { if (!n) return [0, 0]; const z = 1.96, p = x / n, d = 1 + z * z / n, c = p + z * z / (2 * n), h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)); return [(c - h) / d, (c + h) / d]; };
const lchoose = (n, k) => { let s = 0; for (let i = 1; i <= k; i++) s += Math.log(n - k + i) - Math.log(i); return s; };
const mcnemar = (b, c) => { const n = b + c; if (!n) return 1; const k = Math.min(b, c); let p = 0; for (let i = 0; i <= k; i++) p += Math.exp(lchoose(n, i) - n * Math.LN2); return Math.min(1, 2 * p); };
const pct = v => (100 * v).toFixed(1);
for (const f of fs.readdirSync(path.join(__dirname, 'out-nodrop')).filter(f => f.endsWith('.jsonl'))) {
  const R = fs.readFileSync(path.join(__dirname, 'out-nodrop', f), 'utf8').trim().split('\n').map(JSON.parse);
  const cost = R.reduce((s, r) => s + r.cost, 0), inv = R.filter(r => r.ans === 'INVALID').length;
  console.log(`\n## ${f.replace('.jsonl', '')}  n=${R.length} invalid=${inv} cost=$${cost.toFixed(4)}`);
  for (const sub of [['all', () => true], ['no status:dropped', r => !r.sig.includes('status:dropped') ]]) {
    for (const lab of ['NO', 'YES']) {
      const line = [0, 1, 2, 3].map(k => { const s = R.filter(r => r.label === lab && r.k === k && r.ans !== 'INVALID' && (k === 0 || sub[1](r))); const x = s.filter(r => r.ans === 'YES').length; const [lo, hi] = wilson(x, s.length); return `d${k} ${pct(x / s.length)}% [${pct(lo)},${pct(hi)}] n=${s.length}`; });
      console.log(`${sub[0].padEnd(18)} P(YES|${lab}) ${line.join(' | ')}`);
    }
    // paired d3 vs d0 on NO items
    const by = {}; for (const r of R) if (r.label === 'NO' && (r.k === 0 || r.k === 3)) (by[r.id] = by[r.id] || {})[r.k] = r;
    let b = 0, c = 0, n = 0; for (const id in by) { const p = by[id]; if (!p[0] || !p[3] || p[0].ans === 'INVALID' || p[3].ans === 'INVALID' || !sub[1](p[3])) continue; n++; if (p[0].ans === 'NO' && p[3].ans === 'YES') b++; if (p[0].ans === 'YES' && p[3].ans === 'NO') c++; }
    console.log(`${sub[0].padEnd(18)} paired NO items n=${n}: flipped to YES at d3=${b}, flipped to NO=${c}, delta=${pct((b - c) / n)}pt, McNemar p=${mcnemar(b, c).toExponential(2)}`);
  }
}
