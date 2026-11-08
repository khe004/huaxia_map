// 在现有底图上把周边陆地“Myanmar”切成拼块（省区“缅甸”）：北部克钦、实皆、掸邦、曼德勒（含内比都）取县级区，其余取邦、省。
// 依次按外扩 8 公里的行政区界从剩余部分切取，外缘沿用原国界；没切到的边缘细缝留给 topo-sliver.js 并入相邻拼块。
// 用法：SRC=<底图> node tools/myanmar.js <工作目录> <输出文件>；工作目录的上一级 data/MMR1.geojson、MMR2.geojson 为 geoBoundaries 缅甸一、二级行政区（gbOpen 简化版）
const fs=require('fs'),{execFileSync}=require('child_process'),tc=require('topojson-client');
const SRC=process.env.SRC||require('path').join(__dirname,'../basemaps/china/units.topo.json'),D=process.argv[2],OUT=process.argv[3];
const T=JSON.parse(fs.readFileSync(SRC));const P=f=>D+'/'+f;const w=(f,o)=>fs.writeFileSync(P(f),JSON.stringify(o));
w('u.json',tc.feature(T,T.objects.units));w('nb.json',tc.feature(T,T.objects.nb));
const g1=JSON.parse(fs.readFileSync(D+'/../data/MMR1.geojson')),g2=JSON.parse(fs.readFileSync(D+'/../data/MMR2.geojson'));
const ADM2=['Bhamo','Mohnyin','Myitkyina','Puta-O','Hkamti','Kale','Kanbalu','Katha','Mawlaik','Monywa','Sagaing','Shwebo','Tamu','Yinmarbin',
  'Muse','Langkho','Loilen','Taunggyi','Kengtung','Monghsat','Tachileik','Hopang','Kyaukme','Lashio','Laukkaing','Matman','Mongmit',
  'Kyaukse','Mandalay','Meiktila','Myingyan','Nyaung-U','Pyinoolwin','Yamethin','Det Khi Na','Oke Ta Ra'];
const ADM1=['Chin','Magway','Rakhine','Bago','Yangon','Ayeyarwady','Kayah','Kayin','Mon','Tanitharyi'];
const shapes=[...g2.features.filter(f=>ADM2.includes(f.properties.shapeName)),...g1.features.filter(f=>ADM1.includes(f.properties.shapeName))];
console.log('行政区',shapes.length);
const ms=require.resolve('mapshaper/bin/mapshaper');const run=a=>execFileSync(process.execPath,[ms,...a],{stdio:['ignore','ignore','inherit']});
run(['-i',P('nb.json'),'-filter',"n=='Myanmar'",'-o',P('rest.json')]);
const pieces=[];
shapes.forEach((f,k)=>{w('s.json',{type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:f.geometry}]});
  run(['-i',P('s.json'),'-simplify','interval=1500','-buffer','radius=8km','-o',P('sb.json'),'force']);
  run(['-i',P('rest.json'),'-clip',P('sb.json'),'-o',P('pc.json'),'force']);
  run(['-i',P('rest.json'),'-erase',P('sb.json'),'-o',P('rest.json'),'force']);
  const PJ=JSON.parse(fs.readFileSync(P('pc.json')));const pc=(PJ.features||(PJ.geometries||[]).map(g=>({geometry:g}))).filter(x=>x.geometry);
  pc.forEach(x=>pieces.push({type:'Feature',properties:{n:f.properties.shapeName,p:'缅甸',c:'MMR'},geometry:x.geometry}));});
const RJ=JSON.parse(fs.readFileSync(P('rest.json')));const rest=(RJ.features||(RJ.geometries||[]).map(g=>({type:'Feature',properties:{n:'Myanmar'},geometry:g}))).filter(x=>x.geometry).map(x=>({...x,properties:{n:'Myanmar'}}));
const nb=JSON.parse(fs.readFileSync(P('nb.json')));nb.features=nb.features.filter(x=>x.properties.n!=='Myanmar').concat(rest);w('nb2.json',nb);
const u=JSON.parse(fs.readFileSync(P('u.json')));u.features.push(...pieces);w('u2.json',u);
run(['-i',P('u2.json'),P('nb2.json'),'combine-files','snap','-rename-layers','units,nb','-o','format=topojson','no-quantization',P('out.json')]);
const O=JSON.parse(fs.readFileSync(P('out.json')));const [sx,sy]=T.transform.scale,[tx,ty]=T.transform.translate;O.transform=T.transform;
O.arcs=O.arcs.map(a=>{let px=0,py=0;const r=[];for(const [x,y] of a){const qx=Math.round((x-tx)/sx),qy=Math.round((y-ty)/sy);if(r.length&&qx===px&&qy===py)continue;r.push([qx-px,qy-py]);px=qx;py=qy}if(r.length<2)r.push([0,0]);return r});delete O.bbox;
fs.writeFileSync(OUT,JSON.stringify(O));console.log('拼块',pieces.length,'剩余缅甸细缝',rest.length);
