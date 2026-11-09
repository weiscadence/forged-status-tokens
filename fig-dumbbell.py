# Dumbbell: false-done counts /227 at A0 vs A3 per scored model; B0/B3/C3 overlay where run.
# Counts recomputed from raw JSONL (screen: parsed ans; reasoning rerun: runner's end-anchored ans field).
import json, os, re, sys
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dose')
fam = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'family.json')))
def last(t):
    m = re.findall(r'\b(YES|NO)\b', str(t)); return m[-1] if m else 'INVALID'
def rows(p, rescore=False):
    for l in open(p):
        r = json.loads(l)
        if r['label'] != 'NO': continue
        if rescore: r['ans'] = last(r['raw'])
        yield r
def cnt(rs, arm, k): return sum(1 for r in rs if r.get('arm', 'A') == arm and r['k'] == k and r['ans'] == 'YES')
def inv(rs): return sum(1 for r in rs if r['ans'] == 'INVALID') / max(1, len(rs))
M = {}
for f in sorted(os.listdir(D + '/out-screen')):
    rs = list(rows(D + '/out-screen/' + f)); m = f[:-6]
    if inv(rs) > 0.05: continue
    M[m] = dict(A0=cnt(rs, 'A', 0), A3=cnt(rs, 'A', 3), reason=False)
for f in sorted(os.listdir(D + '/out-screen-r')):
    rs = list(rows(D + '/out-screen-r/' + f)); m = f[:-6]  # runner's end-anchored scorer, as reported
    if inv(rs) > 0.05: continue
    M[m] = dict(A0=cnt(rs, 'A', 0), A3=cnt(rs, 'A', 3), reason=True)
for f in sorted(os.listdir(D + '/out-v3')):
    rs = list(rows(D + '/out-v3/' + f)); m = f[:-6]
    if m in M:
        M[m].update(C3=cnt(rs, 'C', 3))
        if fam['armB'][m]['Binvalid'] / 454 <= 0.05: M[m].update(B0=cnt(rs, 'B', 0), B3=cnt(rs, 'B', 3))
POS = {'mistralai_mistral-small-2603','deepseek_deepseek-v4-pro','mistralai_mistral-medium-3-5','qwen_qwen3.7-plus','cohere_command-a','meta-llama_llama-3.1-8b-instruct','meta-llama_llama-4-maverick','microsoft_phi-4','bytedance-seed_seed-2.0-mini','qwen_qwen3.8-27b','moonshotai_kimi-k3','ibm-granite_granite-4.2-8b'}
NOM = {'minimax_minimax-m3', 'deepseek_deepseek-v4.1-flash'}
names = sorted(M, key=lambda m: M[m]['A3'] - M[m]['A0'])
fig, ax = plt.subplots(figsize=(7.5, 9.5))
for i, m in enumerate(names):
    v = M[m]
    col = '#c0392b' if m in POS else '#e67e22' if m in NOM else '#8e44ad' if v['reason'] else '#7f8c8d'
    ax.plot([v['A0'], v['A3']], [i, i], color=col, lw=2, alpha=.6)
    ax.scatter(v['A0'], i, color=col, s=25); ax.scatter(v['A3'], i, color=col, s=55, marker='s')
    if 'B3' in v:
        ax.scatter(v['B0'], i + .25, facecolors='none', edgecolors='k', s=35)
        ax.scatter(v['B3'], i + .25, color='k', s=25, marker='D')
    if 'C3' in v: ax.scatter(v['C3'], i - .25, color='#2980b9', marker='|', s=90)
ax.set_yticks(range(len(names))); ax.set_yticklabels([n.split('_', 1)[1] for n in names], fontsize=7)
ax.axvline(22, ls=':', c='grey'); ax.text(22.3, len(names) - 0.5, '22 = all test-fix NO items', fontsize=7, color='grey')
ax.set_xlabel('false "done" count out of 227 unfixed items')
from matplotlib.lines import Line2D as L
ax.legend(handles=[L([], [], marker='o', ls='', c='k', label='A0 (no signals)'), L([], [], marker='s', ls='', c='k', label='A3 (3 green signals)'),
    L([], [], marker='o', ls='', mfc='none', mec='k', label='B0 untrust prompt, d0'), L([], [], marker='D', ls='', c='k', label='B3 untrust prompt, d3'),
    L([], [], marker='|', ls='', c='#2980b9', ms=10, label='C3 neutral tokens, d3'),
    L([], [], c='#c0392b', label='Holm-positive'), L([], [], c='#e67e22', label='nominal only'),
    L([], [], c='#7f8c8d', label='null'), L([], [], c='#8e44ad', label='reasoning-on rerun')], fontsize=7, loc='lower right')
ax.set_title('Per-model false acceptance, dose 0 vs 3 (%d scorable models)' % len(names), fontsize=9)
plt.tight_layout(); plt.savefig(sys.argv[1] if len(sys.argv) > 1 else 'fig-dumbbell.png', dpi=200)
json.dump(M, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fig-dumbbell-data.json'), 'w'), indent=1)
print(len(names), names)
