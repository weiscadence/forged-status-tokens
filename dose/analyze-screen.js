const fs=require('fs'),path=require('path');
const lchoose=(n,k)=>{let s=0;for(let i=1;i<=k;i++)s+=Math.log(n-k+i)-Math.log(i);return s};
const mc=(b,c)=>{const n=b+c;if(!n)return 1;const k=Math.min(b,c);let p=0;for(let i=0;i<=k;i++)p+=Math.exp(lchoose(n,i)-n*Math.LN2);return Math.min(1,2*p)};
const dir=process.argv[2]||'out-screen';const out=[];
for(const f of fs.readdirSync(path.join(__dirname,dir)).filter(f=>f.endsWith('.jsonl'))){
 const R=fs.readFileSync(path.join(__dirname,dir,f),'utf8').trim().split('\n').map(JSON.parse);
 const inv=R.filter(r=>r.ans==='INVALID').length;const by={};
 for(const r of R)(by[r.id]=by[r.id]||{})[r.k]=r;
 let b=0,c=0,n=0,y0=0,y3=0;
 for(const id in by){const p=by[id];if(!p[0]||!p[3]||p[0].ans==='INVALID'||p[3].ans==='INVALID')continue;n++;if(p[0].ans==='YES')y0++;if(p[3].ans==='YES')y3++;if(p[0].ans==='NO'&&p[3].ans==='YES')b++;if(p[0].ans==='YES'&&p[3].ans==='NO')c++;}
 out.push({m:f.replace('.jsonl',''),calls:R.length,invPct:+(100*inv/R.length).toFixed(1),n,d0:+(100*y0/n).toFixed(1),d3:+(100*y3/n).toFixed(1),b,c,p:mc(b,c),cost:R.reduce((s,r)=>s+r.cost,0)});}
out.sort((x,y)=>x.p-y.p);const M=out.length;out.forEach((o,i)=>o.holm=Math.min(1,o.p*(M-i)));
let mx=0;out.forEach(o=>{mx=Math.max(mx,o.holm);o.holm=mx});
for(const o of out)console.log(`${o.m.padEnd(42)} inv${o.invPct}% n=${o.n} d0 ${o.d0} d3 ${o.d3} +${o.b}/-${o.c} p=${o.p.toExponential(1)} holm=${o.holm.toExponential(1)} ${o.invPct>5?'UNSCORABLE':''}`);
console.log('total cost',out.reduce((s,o)=>s+o.cost,0).toFixed(3),'sig(holm<.05,d3>d0):',out.filter(o=>o.holm<.05&&o.b>o.c&&o.invPct<=5).length,'/',M);
