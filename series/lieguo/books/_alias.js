// 人物别名：目录页检索用。书中人名用通行的中文译名，读者常用的另一种写法登记在这里，检索时与人名同等对待，结果里注“又称”
const ALIAS = {
  谢尔盖·克里卡廖夫: ['克里卡廖夫', 'Sergei Krikalev'], 海伦·沙曼: ['沙曼', 'Helen Sharman'], 秋山丰宽: ['秋山', 'Toyohiro Akiyama'],
  阿纳托利·阿尔采巴尔斯基: ['阿尔采巴尔斯基', 'Anatoly Artsebarsky'], 亚历山大·沃尔科夫: ['沃尔科夫'], 托赫塔尔·奥巴基罗夫: ['奥巴基罗夫'], 弗朗茨·菲伯克: ['菲伯克'],
  米哈伊尔·戈尔巴乔夫: ['戈尔巴乔夫', 'Mikhail Gorbachev'], 鲍里斯·叶利钦: ['叶利钦', 'Boris Yeltsin'], 列昂尼德·克拉夫丘克: ['克拉夫丘克'], 斯坦尼斯拉夫·舒什克维奇: ['舒什克维奇'],
  努尔苏丹·纳扎尔巴耶夫: ['纳扎尔巴耶夫'], 维陶塔斯·兰茨贝吉斯: ['兰茨贝吉斯'],
  康拉德·阿登纳: ['阿登纳', 'Konrad Adenauer'], 特奥多尔·豪斯: ['豪斯', 'Theodor Heuss'], 威廉·皮克: ['皮克', 'Wilhelm Pieck'], 卡尔·伦纳: ['伦纳', 'Karl Renner'],
  约瑟普·布罗兹·铁托: ['铁托', 'Josip Broz Tito'], 奥托·弗兰克: ['Otto Frank'], '范妮·布兰克斯-科恩': ['布兰克斯-科恩', 'Fanny Blankers-Koen'], 埃米尔·扎托佩克: ['扎托佩克', 'Emil Zátopek'],
  贾瓦哈拉尔·尼赫鲁: ['尼赫鲁', 'Jawaharlal Nehru'], 穆罕默德·阿里·真纳: ['真纳', 'Muhammad Ali Jinnah'], 利亚卡特·阿里·汗: ['利亚卡特', 'Liaquat Ali Khan'],
  路易斯·蒙巴顿: ['蒙巴顿', 'Louis Mountbatten'], 拉金德拉·普拉萨德: ['普拉萨德', 'Rajendra Prasad'], 哈里·辛格: ['Hari Singh'], 吴努: ['U Nu'],
  唐·斯蒂芬·森纳那亚克: ['森纳那亚克', 'D. S. Senanayake'], 莫罕达斯·甘地: ['甘地', '圣雄甘地', 'Mahatma Gandhi'], 丹增·诺尔盖: ['丹增', 'Tenzing Norgay'], 埃德蒙·希拉里: ['希拉里', 'Edmund Hillary'],
  汤姆·基尔伯恩: ['基尔伯恩', 'Tom Kilburn'], 弗雷德里克·威廉斯: ['Frederic Williams'],
};
// 同名异人：键写作“名|生年”，只给生年相符的那一位
const aliasOf = (n, life) => { const m = String(life || '').match(/^约?(前)?(\d+)/), y = m ? (m[1] ? '-' : '') + m[2] : '';
  return ALIAS[n + '|' + y] || ALIAS[n] || []; };
