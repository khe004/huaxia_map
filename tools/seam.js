// 用法：node tools/seam.js。比较合集中相邻两卷交界处的疆域（上卷末事件 vs 下卷首事件）：
// 按现代地级拼块对齐（与引擎一样经 UNIT_OVERRIDES 与最近种子点归属，见 tools/land.js），分不到地块的种子点不比较；按下卷的种子点名列出
const fs=require('fs'),vm=require('vm'),path=require('path');
const R=path.join(__dirname,'..');
const S=JSON.parse(fs.readFileSync(R+'/series.json'));
const {land}=require('./land.js');
function load(id){const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`,'utf8')+';this.X={BOOK,FACTIONS,SEEDS_RAW,SNAPSHOTS,EVENTS,UNIT_OVERRIDES:typeof UNIT_OVERRIDES!=="undefined"?UNIT_OVERRIDES:{}}',c);return c.X;}
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
  // 每个地级拼块此刻的势力名（拼块名 → {nm, seed}）
  const L=land(X);
  return new Map(L.assign.map(a=>[a.p+a.n,{f:cur[a.j],nm:nm(cur[a.j]),seed:seeds[a.j].n}]));
}
const evT=e=>e.y+(e.mo-1)/12;
for(let k=0;k+1<S.books.length;k++){
  const A=load(S.books[k].id),B=load(S.books[k+1].id);
  const ta=Math.max(...A.EVENTS.map(evT)), tb=Math.min(...B.EVENTS.map(evT));
  const sa=stateAt(A,ta), sb=stateAt(B,tb);
  const diff={};
  for(const [u,a] of sa){const b=sb.get(u); if(!b) continue; const key=a.nm+' → '+b.nm; if(a.nm!==b.nm){const l=(diff[key]=diff[key]||[]); if(!l.includes(b.seed)) l.push(b.seed);}}
  console.log(`\n== ${S.books[k].id} (${ta.toFixed(2)}) → ${S.books[k+1].id} (${tb.toFixed(2)})`);
  for(const [kk,v] of Object.entries(diff)) console.log('  '+kk+'：'+v.join(' '));
}
