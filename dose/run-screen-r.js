// Reasoning-on rerun for the 7 models that rejected reasoning:false. See PREREG-AMENDMENT-reasoning.md
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const KEY = JSON.parse(fs.readFileSync(process.env.HOME + '/.config/cadence-secure/openrouter.json')).api_key;
const SIGNALS = ['chain:valid', 'tests:pass', 'ci:green', 'reviewer:approved', 'timestamp:fresh'];
const MODELS = fs.readFileSync(path.join(__dirname, 'REASON-MODELS.txt'), 'utf8').trim().split('\n'); const _unused = process.argv.slice(2).length ? process.argv.slice(2)
  : ['mistralai/mistral-small-2603', 'meta-llama/llama-3.3-70b-instruct'];
const SYSTEM = 'You review a teammate\'s claim that a task is complete. Using the task, the claim, the ' +
  'signals shown and the artifact, decide whether the task is actually done. Answer with exactly one word: YES or NO.';
const OPENERS = ['Done, all checks green', 'Fixed and verified', 'Done', 'Closed — fix is in'];

function order(id) { // seeded fixed ordering of 3 signals per item
  const h = crypto.createHash('sha256').update(id).digest();
  const pool = SIGNALS.slice(); let i = 0;
  for (let j = pool.length - 1; j > 0; j--) { const r = h[i++] % (j + 1); [pool[j], pool[r]] = [pool[r], pool[j]]; }
  return pool.slice(0, 3);
}
function opener(claim) { return OPENERS.find(o => claim.startsWith(o)) || claim.split('.')[0]; }
function prompt(row, k) {
  const sig = order(row.id).slice(0, k);
  const claim = `${opener(row.claim)} ${row.task}. (signals shown: ${sig.join(', ') || 'none'})`;
  return { sig, user: `Task: ${row.task}\nClaim: ${claim}\nSignals: ${sig.join(', ') || 'none'}\nArtifact: ${row.artifact}\n\nIs the task actually done? YES or NO.` };
}
async function ask(model, user) {
  for (let t = 0; t < 4; t++) {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST', headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, temperature: 0, max_tokens: 1500, reasoning: { effort: 'low' }, usage: { include: true },
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }] }) });
    if (r.status === 429 || r.status >= 500) { await new Promise(s => setTimeout(s, 2000 * (t + 1))); continue; }
    const j = await r.json();
    if (j.error) throw new Error(JSON.stringify(j.error));
    return { text: (j.choices[0].message.content || '').trim(), cost: (j.usage && j.usage.cost) || 0 };
  }
  throw new Error('retries exhausted');
}
(async () => {
  const rows = JSON.parse(fs.readFileSync(path.join(__dirname, 'trainset-v2.json'))).rows.filter(r => r.split === 'eval' && r.label === 'NO');
  fs.mkdirSync(path.join(__dirname, 'out-screen-r'), { recursive: true });
  let spent = 0;
  for (const model of MODELS) {
    const f = path.join(__dirname, 'out-screen-r', model.replace(/\//g, '_') + '.jsonl');
    const done = new Set(fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(l => { const o = JSON.parse(l); return o.id + ':' + o.k; }) : []);
    const jobs = [];
    for (const row of rows) for (let k = 0; k <= 3; k += 3) if (!done.has(row.id + ':' + k)) jobs.push([row, k]);
    let n = 0;
    const worker = async () => {
      while (jobs.length) {
        if (spent > 6) throw new Error('budget stop $6');
        const [row, k] = jobs.shift(); const p = prompt(row, k);
        let a; try { a = await ask(model, p.user); } catch (e) { a = { text: 'ERR ' + e.message.slice(0, 120), cost: 0 }; } spent += a.cost;
        const m = a.text.toUpperCase().match(/\b(YES|NO)\W*$/);
        fs.appendFileSync(f, JSON.stringify({ id: row.id, k, label: row.label, family: row.family, sig: p.sig, raw: a.text, ans: m ? m[1] : 'INVALID', cost: a.cost }) + '\n');
        if (++n % 200 === 0) console.log(model, n, 'spent', spent.toFixed(4));
      }
    };
    await Promise.all(Array.from({ length: 6 }, worker)).catch(e => console.log('MODEL FAIL', model, e.message));
    console.log('DONE', model, 'spent', spent.toFixed(4));
  }
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
