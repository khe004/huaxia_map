// 用法：node tools/seam.js。比较合集中相邻两卷交界处的疆域（上卷末事件 vs 下卷首事件），按种子点名对齐
const fs=require('fs'),vm=require('vm'),path=require('path');
const R=path.join(__dirname,'..');
const S=JSON.parse(fs.readFileSync(R+'/series.json'));
function load(id){const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`,'utf8')+';this.X={BOOK,FACTIONS,SEEDS_RAW,SNAPSHOTS,EVENTS}',c);return c.X;}
function stateAt(X,t){
  const seeds=X.SEEDS_RAW.split(/\s{2,}|\n+/).map(s=>s.trim()).filter(Boolean).map(s=>{const[z,n,c]=s.split('|');return{z,n,c}});
  const by=new Map();seeds.forEach((s,i)=>by.set(s.n,i));
  let cur=seeds.map(s=>(s.z==='x'?'x':X.BOOK.baseFaction));
  // 与引擎一致：第一条快照是开局形势，不论写的是几月都从卷首生效
  for(const [j,[y,m,list]] of X.SNAPSHOTS.entries()){ if(j>0&&y+(m-1)/12>t+1e-9) break;
    for(const [f,tok] of list) for(const k of tok.split(/\s+/).filter(Boolean)){
      let idx=[]; if(k==='*')idx=seeds.map((_,i)=>i); else if(k[0]==='@')seeds.forEach((s,i)=>s.z===k.slice(1)&&idx.push(i)); else if(k[0]==='#')cur.forEach((g,i)=>g===k.slice(1)&&idx.push(i)); else if(by.has(k))idx=[by.get(k)];
      idx.forEach(i=>cur[i]=f);} }
  const nm=f=>{const F=X.FACTIONS[f];return F?(F.name?F.name(t):f).replace(/（[^）]*）/g,''):f};
  return new Map(seeds.map((s,i)=>[s.n,{f:cur[i],nm:nm(cur[i]),c:s.c}]));
}
const evT=e=>e.y+(e.mo-1)/12;
for(let k=0;k+1<S.books.length;k++){
  const A=load(S.books[k].id),B=load(S.books[k+1].id);
  const ta=Math.max(...A.EVENTS.map(evT)), tb=Math.min(...B.EVENTS.map(evT));
  const sa=stateAt(A,ta), sb=stateAt(B,tb);
  const diff={};
  for(const [n,a] of sa){const b=sb.get(n); if(!b) continue; const key=a.nm+' → '+b.nm; if(a.nm!==b.nm)(diff[key]=diff[key]||[]).push(n);}
  console.log(`\n== ${S.books[k].id} (${ta.toFixed(2)}) → ${S.books[k+1].id} (${tb.toFixed(2)})`);
  for(const [kk,v] of Object.entries(diff)) console.log('  '+kk+'：'+v.join(' '));
}
