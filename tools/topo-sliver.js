// 把周边陆地（nb）中夹在拼块之间的细缝并入相邻拼块：边界有七成以上与拼块共用、面积小于 5000 平方公里的多边形块
const fs=require('fs'),tc=require('topojson-client'),d3=require('d3-geo');
const [IN,OUT]=process.argv.slice(2);const T=JSON.parse(fs.readFileSync(IN));
const [sx,sy]=T.transform.scale,[tx,ty]=T.transform.translate;
const abs=T.arcs.map(a=>{let x=0,y=0;return a.map(([dx,dy])=>{x+=dx;y+=dy;return[x*sx+tx,y*sy+ty]})});
const alen=i=>{const a=abs[i<0?~i:i];let s=0;for(let k=1;k<a.length;k++){const c=Math.cos(a[k][1]*Math.PI/180);s+=Math.hypot((a[k][0]-a[k-1][0])*c,a[k][1]-a[k-1][1])}return s};
const U=T.objects.units.geometries, N=T.objects.nb.geometries;
const polys=g=>g.type==='Polygon'?[g.arcs]:g.type==='MultiPolygon'?g.arcs:[];
const vown=new Map();U.forEach((g,k)=>polys(g).flat(2).forEach(i=>abs[i<0?~i:i].forEach(p=>{const q=p.map(v=>v.toFixed(9))+'';(vown.get(q)||vown.set(q,new Map()).get(q)).set(k,1)})));
const owner=new Map();U.forEach((g,k)=>polys(g).flat(2).forEach(i=>{i=i<0?~i:i;(owner.get(i)||owner.set(i,new Map()).get(i)).set(k,true)}));
const add={};let moved=0,area=0;
N.forEach(g=>{const keep=[];for(const p of polys(g)){const ring={type:'Polygon',arcs:p};const f=tc.feature(T,ring);let A=d3.geoArea(f);if(A>2*Math.PI)A=4*Math.PI-A;A*=6371*6371;
  let tot=0;const by={};for(const i of p.flat()){const L=alen(i);tot+=L;const o=owner.get(i<0?~i:i);if(o)for(const k of o.keys())by[k]=(by[k]||0)+L}
  let nv=0,hit=0;const vb={};for(const i of p.flat())for(const q of abs[i<0?~i:i]){nv++;const o=vown.get(q.map(v=>v.toFixed(9))+'');if(o){hit++;for(const k of o.keys())vb[k]=(vb[k]||0)+1}}
  const best=Object.entries(Object.keys(by).length?by:vb).sort((a,b)=>b[1]-a[1])[0];const sh=Object.values(by).reduce((s,v)=>s+v,0);
  if(A<5000&&best&&(sh/tot>0.7||hit/nv>0.6)){(add[best[0]]=add[best[0]]||[]).push(p);moved++;area+=A}else keep.push(p)}
  if(keep.length!==polys(g).length){if(!keep.length){g.type=null;delete g.arcs}else if(keep.length===1){g.type='Polygon';g.arcs=keep[0]}else{g.type='MultiPolygon';g.arcs=keep}}});
for(const [k,ps] of Object.entries(add)){const g=U[k];const m=tc.mergeArcs(T,[g,...ps.map(p=>({type:'Polygon',arcs:p}))]);
  // mergeArcs 会把多块拼块的各块合并，若原来是多块且没有 w，块数不应减少（各块彼此不相邻）
  const before=polys(g).length,after=m.type==='Polygon'?1:m.arcs.length;if(after<before)console.error('块数变少',g.properties.n,before,after);
  g.type=m.type;g.arcs=m.arcs}
T.objects.nb.geometries=N.filter(g=>g.type);
console.log('并入细缝',moved,'块，共',Math.round(area),'平方公里，涉及拼块',Object.keys(add).map(k=>U[k].properties.n).join(' '));
fs.writeFileSync(OUT,JSON.stringify(T));
