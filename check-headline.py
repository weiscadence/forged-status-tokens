# fig-headline.py (Figure 1) draws from literals typed into the script, not from the data.
# This checks those literals against family.json, so the headline figure is covered by
# reproduce.sh without editing fig-headline.py (its hash is listed in PAPER.md Appendix E).
# Usage: python3 check-headline.py   (exit 1 on any mismatch)
import ast, json, os, re, sys
H = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(H, 'fig-headline.py')).read()
fam = json.load(open(os.path.join(H, 'family.json')))
bad = []
def check(name, got, want):
    print(('ok   ' if got == want else 'DIFF ') + name + ': figure %s, data %s' % (got, want))
    if got != want: bad.append(name)

# Panel A: flips on test-fix items vs every other family, 12 Holm-positive screen models.
m = re.search(r'v=\[(\d+)/(\d+)\*100, *(\d+)/(\d+)\*100\]', src)
if not m: sys.exit('check-headline: panel A literals not found in fig-headline.py')
tf_x, tf_n, ot_x, ot_n = map(int, m.groups())
t = fam['totals']; k = t['positiveModels']; fn = t['familyN']
check('A test-fix flips', tf_x, t['flipsByFamily']['test-fix'])
check('A test-fix items', tf_n, k * fn['test-fix'])
check('A other flips', ot_x, t['flipsAll'] - t['flipsByFamily']['test-fix'])
check('A other items', ot_n, k * (sum(fn.values()) - fn['test-fix']))

# Panel B: the 11 B-scorable positives (those given a Holm-adjusted A3->B3 p in family.json).
# gone = warning helped and <=3 false accepts left; reduced = helped, more than 3 left;
# no change = A3->B3 not significant after Holm. The 4th bar ("made it worse before any
# signal", 2 models) is the descriptive A0->B0 reading in PAPER.md 4.3 item 2. It has no
# pre-registered rule, so it is not derived here.
m = re.search(r'^n=(\[[\d, ]+\])', src, re.M)
if not m: sys.exit('check-headline: panel B literals not found in fig-headline.py')
n = ast.literal_eval(m.group(1))
B = [v for k_, v in fam['armB'].items() if k_ != '_holmM' and 'pHolm' in v['A3toB3']]
helped = [v for v in B if v['A3toB3']['pHolm'] < 0.05]
check('B models scorable', sum(n[:3]), len(B))
check('B effect gone', n[0], sum(v['B3'] <= 3 for v in helped))
check('B reduced', n[1], sum(v['B3'] > 3 for v in helped))
check('B no significant change', n[2], len(B) - len(helped))
print('note B "made it worse" = %d: descriptive, not derived (PAPER.md 4.3 item 2)' % n[3])
sys.exit(1 if bad else 0)
