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
  道格拉斯·麦克阿瑟: ['麦克阿瑟', 'Douglas MacArthur'], 吉田茂: ['Yoshida Shigeru'], 毛泽东: ['毛主席', 'Mao Zedong'], 周恩来: ['Zhou Enlai'], 彭德怀: ['Peng Dehuai'],
  蒋介石: ['蒋中正', 'Chiang Kai-shek'], 李承晚: ['Syngman Rhee'], 金日成: ['Kim Il Sung'], 苏加诺: ['Sukarno'], 穆罕默德·哈达: ['哈达', 'Mohammad Hatta'], 胡志明: ['Ho Chi Minh'],
  保大: ['阮福晪', 'Bảo Đại'], 曼努埃尔·罗哈斯: ['罗哈斯', 'Manuel Roxas'], 銮披汶·颂堪: ['銮披汶', '披汶', 'Plaek Phibunsongkhram'], 西萨旺·冯: ['Sisavang Vong'],
  诺罗敦·西哈努克: ['西哈努克', 'Norodom Sihanouk'], 汤川秀树: ['Yukawa Hideki'], 黑泽明: ['Kurosawa Akira'], 本多猪四郎: ['Honda Ishirō'],
  汤姆·基尔伯恩: ['基尔伯恩', 'Tom Kilburn'], 弗雷德里克·威廉斯: ['Frederic Williams'],
  '戴维·本-古里安': ['本-古里安', '本古里安', 'David Ben-Gurion'], 阿卜杜拉一世: ['Abdullah I'], 舒克里·库阿特利: ['库阿特利', 'Shukri al-Quwatli'],
  贾迈勒·阿卜杜勒·纳赛尔: ['纳赛尔', 'Gamal Abdel Nasser'], 伊德里斯一世: ['Idris I'], 伊斯梅尔·阿扎里: ['阿扎里', 'Ismail al-Azhari'], 海尔·塞拉西一世: ['塞拉西', 'Haile Selassie'],
  阿丹·阿卜杜拉·奥斯曼: ['Aden Abdullah Osman'], 马卡里奥斯三世: ['马卡里奥斯', 'Makarios III'], 阿卜杜拉·萨利姆·萨巴赫: ['Abdullah Al-Salim Al-Sabah'],
  穆罕默德·礼萨·巴列维: ['巴列维', 'Mohammad Reza Pahlavi'], 拉尔夫·本奇: ['本奇', 'Ralph Bunche'], 卡迈勒·马拉赫: ['马拉赫'],
  费萨尔·本·阿卜杜勒-阿齐兹: ['费萨尔国王', 'King Faisal'], 阿卜杜拉·萨拉勒: ['萨拉勒', 'Abdullah al-Sallal'], 盖哈坦·沙比: ['沙比', 'Qahtan al-Shaabi'],
  卡布斯·本·赛义德: ['卡布斯', 'Qaboos bin Said'], 扎耶德·本·苏尔坦·阿勒纳哈扬: ['扎耶德', 'Sheikh Zayed'], 拉希德·本·赛义德·阿勒马克图姆: ['拉希德', 'Rashid bin Saeed'],
  伊萨·本·萨勒曼·阿勒哈利法: ['伊萨', 'Isa bin Salman'], 艾哈迈德·本·阿里·阿勒萨尼: ['Ahmad bin Ali Al Thani'], 安瓦尔·萨达特: ['萨达特', 'Anwar Sadat'],
  列维·艾希科尔: ['艾希科尔', 'Levi Eshkol'], 侯赛因·本·塔拉勒: ['侯赛因国王', 'King Hussein'], 乌姆·库勒苏姆: ['乌姆·库尔苏姆', 'Umm Kulthum'],
};
// 同名异人：键写作“名|生年”，只给生年相符的那一位
const aliasOf = (n, life) => { const m = String(life || '').match(/^约?(前)?(\d+)/), y = m ? (m[1] ? '-' : '') + m[2] : '';
  return ALIAS[n + '|' + y] || ALIAS[n] || []; };
