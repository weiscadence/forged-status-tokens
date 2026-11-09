# Per-model paired difference in false-done rate, d3 - d0 (arm A, 227 NO items), with
# Newcombe (1998, method 10) 95% CI for paired proportions and exact two-sided McNemar p.
# Same inclusion as fig-dumbbell.py: screen models with <=5% INVALID, reasoning rerun with the
# runner's end-anchored ans field. Also counts A3 YES by family (for off-family notes).
# Usage: python3 analyze-ci.py > ci.json   (run from projects/apart-swarm)
import json, os, math
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dose')
Z = 1.959963984540054

def wilson(x, n):
    p = x / n; d = 1 + Z*Z/n; c = p + Z*Z/(2*n); h = Z*math.sqrt(p*(1-p)/n + Z*Z/(4*n*n))
    return (c - h) / d, (c + h) / d

def newcombe(a, b, c, d):  # a=both YES, b=d3 YES only (up), c=d0 YES only (down), d=neither
    n = a + b + c + d; p1 = (a + b) / n; p2 = (a + c) / n; D_ = p1 - p2
    l1, u1 = wilson(a + b, n); l2, u2 = wilson(a + c, n)
    A = (a + b) * (c + d) * (a + c) * (b + d); B = a * d - b * c
    if A == 0: phi = 0
    else:
        C = (B - n/2) if B > n/2 else (0 if B >= 0 else B)
        phi = C / math.sqrt(A)
    lo = D_ - math.sqrt((p1-l1)**2 - 2*phi*(p1-l1)*(u2-p2) + (u2-p2)**2)
    hi = D_ + math.sqrt((u1-p1)**2 - 2*phi*(u1-p1)*(p2-l2) + (p2-l2)**2)
    return D_, max(-1, lo), min(1, hi)

def mcnemar(b, c):
    n = b + c
    if not n: return 1.0
    k = min(b, c); return min(1.0, 2 * sum(math.comb(n, i) for i in range(k + 1)) / 2**n)

def rows(p):
    return [json.loads(l) for l in open(p) if json.loads(l)['label'] == 'NO']

out = {}
for sub, reason in (('out-screen', False), ('out-screen-r', True)):
    for f in sorted(os.listdir(os.path.join(D, sub))):
        rs = rows(os.path.join(D, sub, f)); m = f[:-6]
        if sum(r['ans'] == 'INVALID' for r in rs) / max(1, len(rs)) > 0.05: continue
        g = lambda k: {r['id']: r for r in rs if r.get('arm', 'A') == 'A' and r['k'] == k}
        X, Y = g(0), g(3); a = b = c = d = inv = 0; fam3 = {}
        for i, x in X.items():
            y = Y.get(i)
            if y is None: continue
            if 'INVALID' in (x['ans'], y['ans']): inv += 1; continue
            x1, y1 = x['ans'] == 'YES', y['ans'] == 'YES'
            if y1: fam3[y['family']] = fam3.get(y['family'], 0) + 1
            a += x1 and y1; b += (not x1) and y1; c += x1 and not y1; d += not x1 and not y1
        diff, lo, hi = newcombe(a, b, c, d)
        out[m] = dict(reason=reason, n=a+b+c+d, invalidPairs=inv, A0=a+c, A3=a+b, up=b, down=c,
                      diff=round(diff, 4), lo=round(lo, 4), hi=round(hi, 4), p=mcnemar(b, c), A3byFamily=fam3)
print(json.dumps(out, indent=1))
