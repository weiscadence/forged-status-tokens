// Arm B/C vs screen arm A, paired on the same 227 NO items. Exact McNemar (two-sided).
const fs=require('fs');const L=f=>fs.existsSync(f)?fs.readFileSync(f,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse):[];
const lf=n=>{let s=0;for(let i=2;i<=n;i++)s+=Math.log(i);return s};
const binom=(k,n)=>{if(n===0)return 1;let p=0;for(let i=0;i<=Math.min(k,n-k);i++)p+=Math.exp(lf(n)-lf(i)-lf(n-i)-n*Math.log(2));return Math.min(1,2*p)};
const wil=(x,n)=>{const z=1.96,p=x/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return `[${(100*Math.max(0,c-h)).toFixed(1)},${(100*(c+h)).toFixed(1)}]`};
const rows=[];
for(const f of fs.readdirSync('out-v3').sort()){const v=L('out-v3/'+f),s=L('out-screen/'+f);
 const m=(rs,pred)=>new Map(rs.filter(r=>r.label==='NO'&&pred(r)).map(r=>[r.id,r.ans]));
 const A3=m(s,r=>r.k===3),B0=m(v,r=>r.arm==='B'&&r.k===0),B3=m(v,r=>r.arm==='B'&&r.k===3),C3=m(v,r=>r.arm==='C'&&r.k===3);
 const inv=x=>[...x.values()].filter(a=>a==='INVALID').length;
 const pair=(X,Y)=>{let up=0,dn=0;for(const[id,a]of X){const b=Y.get(id);if(a==='INVALID'||b==null||b==='INVALID')continue;if(a!=='YES'&&b==='YES')up++;if(a==='YES'&&b!=='YES')dn++}return {up,dn,p:binom(Math.min(up,dn),up+dn)}};
 const yes=x=>[...x.values()].filter(a=>a==='YES').length;
 const bA=pair(A3,B3),cA=pair(A3,C3),bd=pair(B0,B3);
 const unsc=inv(B3)/227>0.05||inv(B0)/227>0.05?' B-UNSCORABLE(>5% INVALID)':'';
 rows.push(`${f.replace('.jsonl','').padEnd(34)} A3 ${yes(A3)} ${wil(yes(A3),227)} | B3 ${yes(B3)} ${wil(yes(B3),227)} A3→B3 -${bA.dn}/+${bA.up} p=${bA.p.toExponential(1)} | B0→B3 +${bd.up}/-${bd.dn} p=${bd.p.toExponential(1)} | C3 ${yes(C3)} A3→C3 -${cA.dn}/+${cA.up} p=${cA.p.toExponential(1)}${unsc}`)}
console.log('counts are false-done out of 227 NO items; CIs Wilson 95% in %\n'+rows.join('\n'));
