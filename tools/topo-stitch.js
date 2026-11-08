// 缝合：拼块的一段独用弧（两端点都落在另一块的边界上），换成另一块在这两点之间的独用弧链（反向），两边从此共用边界，夹缝并入本块
const fs=require('fs');const [IN,OUT]=process.argv.slice(2);const T=JSON.parse(fs.readFileSync(IN));
const abs=T.arcs.map(a=>{let x=0,y=0;return a.map(([dx,dy])=>[x+=dx,y+=dy])});
const G=[...T.objects.units.geometries,...T.objects.nb.geometries];const NU=T.objects.units.geometries.length;
const rings=g=>g.type==='Polygon'?g.arcs:g.type==='MultiPolygon'?g.arcs.flat():[];
const key=p=>p[0]+','+p[1];const A=i=>i<0?abs[~i].slice().reverse():abs[i];const st=i=>key(A(i)[0]),en=i=>{const a=A(i);return key(a[a.length-1])};
const len=pts=>{let s=0;for(let k=1;k<pts.length;k++)s+=Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]);return s};
let use;const recount=()=>{use=new Map();G.forEach((g,k)=>rings(g).flat().forEach(i=>{i=i<0?~i:i;(use.get(i)||use.set(i,new Set()).get(i)).add(k)}))};recount();
const solo=i=>use.get(i<0?~i:i).size===1;
// 端点索引：顶点 → [geom, ring]
const at=new Map();G.forEach((g,k)=>rings(g).forEach(r=>r.forEach(i=>{const s=st(i);(at.get(s)||at.set(s,[]).get(s)).push([k,r])})));
let fixed=0;
for(let k=0;k<NU;k++)for(const r of rings(G[k]))for(let t=0;t<r.length;t++){const a=r[t];if(!solo(a))continue;const S=st(a),E=en(a);
  // 从 E 沿其他几何（可跨几块）的独用弧走到 S
  const path=[];const seen=new Set();let ok=false;
  const dfs=(v,depth)=>{if(v===S&&path.length){ok=true;return true}if(depth>80)return false;
    for(const [j,R] of (at.get(v)||[])){if(j===k)continue;for(const i of R){if(st(i)!==v||!solo(i)||seen.has(i))continue;seen.add(i);path.push(i);if(dfs(en(i),depth+1))return true;path.pop()}}return false};
  dfs(E,0);
  if(ok){const pa=A(a),pc=path.flatMap(i=>A(i));const d=Math.hypot(pa[0][0]-pa[pa.length-1][0],pa[0][1]-pa[pa.length-1][1]);
    if(len(pc)<=3*Math.max(len(pa),d)+30){const rep=path.slice().reverse().map(i=>~i);r.splice(t,1,...rep);t+=rep.length-1;recount();fixed++}}
}
fs.writeFileSync(OUT,JSON.stringify(T));console.log('缝合',fixed,'段');
