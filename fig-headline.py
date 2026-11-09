# Figure 1 (headline). Numbers from family.json (Table 1) and analyze-armBC (Table 2).
import sys, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
fig,(a,b)=plt.subplots(1,2,figsize=(10,3.6),gridspec_kw={'width_ratios':[1,1.25]})
v=[206/264*100, 16/2460*100]
bars=a.bar(['"Fix the failing test"\n(signal restates the\npass condition)','All other tasks\n(signal is orthogonal)'],v,color=['#c0392b','#95a5a6'],width=.55)
for r,t in zip(bars,['206 of 264\n(78%)','16 of 2,460\n(0.7%)']): a.text(r.get_x()+r.get_width()/2,r.get_height()+2,t,ha='center',fontsize=10)
a.set_ylim(0,100); a.set_ylabel('Unfixed items flipped to "done"\nby 3 forged green signals (%)')
a.set_title('A. Forged status fools reviewers only when it\nrestates the task\'s definition of done',fontsize=10.5,loc='left')
a.spines[['top','right']].set_visible(False)
cats=['Effect gone\n(0–3 left)','Reduced','No significant\nchange','Made it worse\nbefore any signal']
n=[4,2,5,2]; cols=['#27ae60','#f1c40f','#95a5a6','#c0392b']
bb=b.bar(cats,n,color=cols,width=.6)
for r,k in zip(bb,n): b.text(r.get_x()+r.get_width()/2,k+.1,str(k),ha='center',fontsize=11)
b.set_ylim(0,6.5); b.set_ylabel('Models (of 11)'); b.set_yticks([])
b.set_title('B. Telling the reviewer "signals are untrusted"\nis not a dependable fix',fontsize=10.5,loc='left')
b.spines[['top','right','left']].set_visible(False)
b.text(.99,.97,'"Made it worse" overlaps\n"No significant change"',transform=b.transAxes,ha='right',va='top',fontsize=8,color='#555')
plt.tight_layout(); plt.savefig(sys.argv[1],dpi=200)
