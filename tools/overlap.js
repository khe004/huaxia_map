// 用法：node tools/overlap.js。列出合集中相邻两卷可能重复收录的同一件事（标题相同或相近、或同年同月同地同类，前后一年内），供人工逐对核对年月、地点与说法是否一致；只列出、不判错，不进 check.sh
const fs=require('fs'),vm=require('vm');const R=require('./root.js').R;
const S=JSON.parse(fs.readFileSync(R+'/series.json'));
function load(id){const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`,'utf8')+';this.X={EVENTS}',c);return c.X.EVENTS;}
const big=s=>{const a=new Set();for(let i=0;i+1<s.length;i++)a.add(s.slice(i,i+2));return a};
const sim=(a,b)=>{const A=big(a),B=big(b);let n=0;A.forEach(x=>B.has(x)&&n++);return n/Math.max(1,Math.min(A.size,B.size))};
for(let k=0;k+1<S.books.length;k++){const a=load(S.books[k].id),b=load(S.books[k+1].id);
 for(const e of a)for(const f of b){const dy=Math.abs((e.y+(e.mo-1)/12)-(f.y+(f.mo-1)/12));
  if(dy>1.01)continue; const s=sim(e.t,f.t); const near=Math.hypot(e.ll[0]-f.ll[0],e.ll[1]-f.ll[1])<0.5;
  if(e.t===f.t||s>=0.5||(dy<0.09&&near&&e.k===f.k))console.log(`${S.books[k].id}→${S.books[k+1].id}\t${e.y}.${e.mo} ${e.t}\t|\t${f.y}.${f.mo} ${f.t}\t${e.p}/${f.p}`);}}
