// 人物别名：目录页检索用。书中人名用通行的中文译名，读者常用的另一种叫法（拉丁或希腊原名、绰号、全名）登记在这里，检索时与人名同等对待，结果里注“又称”
const ALIAS = {
  汉尼拔: ['Hannibal', '汉尼拔·巴卡'], 哈米尔卡: ['Hamilcar', '哈米尔卡·巴卡', '哈密尔卡'], 大西庇阿: ['西庇阿·阿非利加努斯', 'Scipio Africanus', '征服非洲者西庇阿'],
  小西庇阿: ['西庇阿·埃米利亚努斯', 'Scipio Aemilianus'], 费边: ['费边·马克西穆斯', 'Fabius Maximus', '拖延者费边', 'Cunctator'],
  马西尼萨: ['Masinissa', 'Massinissa', '马斯尼萨'], 西法克斯: ['Syphax'], 腓力五世: ['Philip V'], 安条克三世: ['安条克大帝', 'Antiochus III'],
  加图: ['老加图', '监察官加图', 'Cato'], 马塞卢斯: ['Marcellus'], 阿基米德: ['Archimedes'], 希伦二世: ['Hiero', '希耶罗'],
  雷古卢斯: ['Regulus', '阿提利乌斯·雷古卢斯'], 克桑提普斯: ['Xanthippus'], 波利比乌斯: ['Polybius', '波里比阿'],
  李维: ['Livy', '提图斯·李维'], 普鲁塔克: ['Plutarch'], 阿庇安: ['Appian'],
  托勒密四世: ['Ptolemy IV', '爱父者托勒密'], 特乌塔: ['Teuta'], 克利奥米尼三世: ['Cleomenes III'], 安提柯三世: ['安提柯·多松', 'Antigonus Doson'],
};
// 同名异人：键写作“名|生年”，只给生年相符的那一位
const aliasOf = (n, life) => { const m = String(life || '').match(/^约?(前)?(\d+)/), y = m ? (m[1] ? '-' : '') + m[2] : '';
  return ALIAS[n + '|' + y] || ALIAS[n] || []; };
