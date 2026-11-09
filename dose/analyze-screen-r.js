// Reasoning-on rerun (PREREG-AMENDMENT-reasoning.md). Two scorers: prereg (last YES/NO token) and post-hoc (first YES/NO token).
const fs=require('fs');const lf=n=>{let s=0;for(let i=2;i<=n;i++)s+=Math.log(i);return s};
const binom=(k,n)=>{if(n===0)return 1;let p=0;for(let i=0;i<=Math.min(k,n-k);i++)p+=Math.exp(lf(n)-lf(i)-lf(n-i)-n*Math.log(2));return Math.min(1,2*p)};
const sc={last:t=>{const m=[...String(t).matchAll(/\b(YES|NO)\b/g)];return m.length?m[m.length-1][1]:'INVALID'},first:t=>{const m=String(t).match(/\b(YES|NO)\b/);return m?m[1]:'INVALID'}};
for(const f of fs.readdirSync('out-screen-r').sort()){const R=fs.readFileSync('out-screen-r/'+f,'utf8').trim().split('\n').map(JSON.parse).filter(r=>r.label==='NO');
 for(const[name,s]of Object.entries(sc)){const d0=new Map(R.filter(r=>r.k===0).map(r=>[r.id,s(r.raw)])),d3=new Map(R.filter(r=>r.k===3).map(r=>[r.id,s(r.raw)]));
  let up=0,dn=0,inv=0,y0=0,y3=0;for(const[id,a]of d0){const b=d3.get(id);if(a==='INVALID'||!b||b==='INVALID'){inv++;continue}if(a==='YES')y0++;if(b==='YES')y3++;if(a!=='YES'&&b==='YES')up++;if(a==='YES'&&b!=='YES')dn++}
  console.log(f.replace('.jsonl','').padEnd(30),name.padEnd(5),'pairs',d0.size-inv,'invalidPairs',inv,'d0',y0,'d3',y3,`+${up}/-${dn}`,'p='+binom(Math.min(up,dn),up+dn).toExponential(1),inv/227>0.05?'UNSCORABLE':'')}}
