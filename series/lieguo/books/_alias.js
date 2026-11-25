// 人物别名：目录页检索用。书中人名用通行的中文译名，读者常用的另一种写法登记在这里，检索时与人名同等对待，结果里注“又称”
const ALIAS = {
  谢尔盖·克里卡廖夫: ['克里卡廖夫', 'Sergei Krikalev'], 海伦·沙曼: ['沙曼', 'Helen Sharman'], 秋山丰宽: ['秋山', 'Toyohiro Akiyama'],
  阿纳托利·阿尔采巴尔斯基: ['阿尔采巴尔斯基', 'Anatoly Artsebarsky'],
};
// 同名异人：键写作“名|生年”，只给生年相符的那一位
const aliasOf = (n, life) => { const m = String(life || '').match(/^约?(前)?(\d+)/), y = m ? (m[1] ? '-' : '') + m[2] : '';
  return ALIAS[n + '|' + y] || ALIAS[n] || []; };
