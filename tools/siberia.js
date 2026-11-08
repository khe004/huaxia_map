// 在现有底图上增补省区“西伯利亚”的两块拼块（元代岭北行省北境用）：伊尔库茨克州（Irkutsk Oblast）与其余部分（Krasnoyarsk South）。
// 从周边陆地“Russia”里按东经 84–116.5 度、北纬 58 度以南的方框切出（切线只穿过周边陆地内部，贴着原有拼块的边界原样保留），
// 再用伊尔库茨克州界外扩 25 公里分成两块。原有拼块的坐标按原量化参数写回，归属不变（tools/land.js 的分配逐卷核对过）。
// 用法：SRC=<增补前的 units.topo.json> node tools/siberia.js <工作目录> <输出文件>；工作目录的上一级 data/RUS.geojson 为 geoBoundaries 俄罗斯一级行政区（gbOpen 简化版）。
// 之后依次跑 tools/topo-retopo.js、topo-sliver.js、topo-stitch.js（见 tools/units.js 开头）。依赖 mapshaper、topojson-client、topojson-server、d3-geo。
const fs=require('fs'),{execFileSync}=require('child_process'),tc=require('topojson-client');
const SRC=process.env.SRC||require('path').join(__dirname,'../basemaps/china/units.topo.json'), D=process.argv[2], OUT=process.argv[3];
const T=JSON.parse(fs.readFileSync(SRC));
const w=(f,o)=>fs.writeFileSync(D+'/'+f,JSON.stringify(o));
w('u.json',tc.feature(T,T.objects.units)); w('nb.json',tc.feature(T,T.objects.nb));
const gb=JSON.parse(fs.readFileSync(D+'/../data/RUS.geojson'));
const pick=ns=>({type:'FeatureCollection',features:gb.features.filter(f=>ns.includes(f.properties.shapeName)).map(f=>({type:'Feature',properties:{},geometry:f.geometry}))});
console.log(gb.features.map(f=>f.properties.shapeName).filter(n=>/Irkutsk|Krasnoyarsk|Kemerovo/.test(n)));
w('K.json',pick(['Irkutsk Oblast','Krasnoyarsk Krai','Kemerovo Oblast'])); w('I.json',pick(['Irkutsk Oblast']));
const ms=require.resolve('mapshaper/bin/mapshaper'); const run=a=>execFileSync(process.execPath,[ms,...a],{stdio:['ignore','ignore','inherit']});
const P=f=>D+'/'+f;
run(['-i',P('K.json'),'-dissolve','-simplify','interval=3000','-o',P('Kd.json')]);run(['-i',P('I.json'),'-simplify','interval=3000','-o',P('I.json'),'force']);
run(['-i',P('nb.json'),'-filter',"n=='Russia'",'-clip','bbox=84,45,116.5,58','-o',P('R.json')]);
run(['-i',P('I.json'),'-buffer','radius=25km','-o',P('Ib.json')]);
run(['-i',P('R.json'),'-clip',P('Ib.json'),'-each',"n='Irkutsk Oblast'",'-o',P('A.json')]);
run(['-i',P('R.json'),'-erase',P('Ib.json'),'-each',"n='Krasnoyarsk South'",'-o',P('B.json')]);
run(['-i',P('nb.json'),'-erase',P('R.json'),'-o',P('nb2.json')]);
const add=f=>JSON.parse(fs.readFileSync(P(f))).features.map(x=>({...x,properties:{n:x.properties.n,p:'西伯利亚',c:'RUS'}}));
const u=JSON.parse(fs.readFileSync(P('u.json'))); u.features.push(...add('A.json'),...add('B.json')); w('u2.json',u);
run(['-i',P('u2.json'),P('nb2.json'),'combine-files','snap','-rename-layers','units,nb','-o','format=topojson','no-quantization',P('out.json')]);
const O=JSON.parse(fs.readFileSync(P('out.json')));{const [sx,sy]=T.transform.scale,[tx,ty]=T.transform.translate;O.transform=T.transform;O.arcs=O.arcs.map(a=>{let px=0,py=0;const r=[];for(const [x,y] of a){const qx=Math.round((x-tx)/sx),qy=Math.round((y-ty)/sy);if(r.length&&qx===px&&qy===py)continue;r.push([qx-px,qy-py]);px=qx;py=qy;}if(r.length<2)r.push([0,0]);return r;});delete O.bbox;}console.log(Object.keys(O.objects),O.arcs.length,O.objects.units.geometries.length,T.objects.units.geometries.length,O.objects.units.geometries.slice(-2).map(g=>JSON.stringify(g.properties)));
fs.writeFileSync(OUT,JSON.stringify(O));
