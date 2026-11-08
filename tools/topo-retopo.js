// 按量化网格坐标重建拓扑：坐标完全相同的边界合并为共用弧段
const fs=require('fs'),ts=require('topojson-server');
const [IN,OUT]=process.argv.slice(2);const T=JSON.parse(fs.readFileSync(IN));
const abs=T.arcs.map(a=>{let x=0,y=0;return a.map(([dx,dy])=>[x+=dx,y+=dy])});
const ring=r=>{const out=[];r.forEach((i,k)=>{const a=i<0?abs[~i].slice().reverse():abs[i];out.push(...(k?a.slice(1):a))});return out};
const feat=g=>({type:'Feature',properties:g.properties,geometry:g.type==='Polygon'?{type:'Polygon',coordinates:g.arcs.map(ring)}:g.type==='MultiPolygon'?{type:'MultiPolygon',coordinates:g.arcs.map(p=>p.map(ring))}:null});
const fc=o=>({type:'FeatureCollection',features:T.objects[o].geometries.map(feat)});
const R=ts.topology({units:fc('units'),nb:fc('nb')});
const out={type:'Topology',transform:T.transform,objects:{},arcs:R.arcs.map(a=>{let px=0,py=0;const r=a.map(([x,y])=>{const d=[x-px,y-py];px=x;py=y;return d});return r.length<2?[...r,[0,0]]:r})};
for(const o of ['units','nb'])out.objects[o]={type:'GeometryCollection',geometries:R.objects[o].geometries.map(g=>{const h={type:g.type,properties:g.properties};if(g.arcs)h.arcs=g.arcs;return h})};
fs.writeFileSync(OUT,JSON.stringify(out));console.log('arcs',T.arcs.length,'→',out.arcs.length);
