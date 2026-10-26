// 事件标题里写着某人之死的判断：posthumous.js、evorder.js 共用。
// 按“ · ”分隔的各段判断：含此人之名的那一段写着死亡（“某某之死”“某某自缢”“诛某某”）；
// “斩、杀、诛、鸩、弑”只算紧跟其后的人名（“马援斩征侧”是征侧死，不是马援死；“某某诛某某”不算前者之死）
const DEATH = /(之死|卒|崩|自杀|被杀|遇刺|遇害|自刎|自刭|自缢|自经|饿死|被醢|弃市|腰斩|被弑|遇弑|饮酖|伏诛|之诛|族诛|死于|殉节|冤死|败死|败亡|赐死|自尽)/;
const diesIn = (e, w) => e.t.split(/\s*·\s*/).some(seg => seg.includes(w) && (new RegExp('(斩|杀|诛|鸩|弑|缢杀)' + w).test(seg)
  || (DEATH.test(seg.replace(new RegExp('(斩|杀|诛|鸩|弑)[^ ·]*'), m => (m.includes(w) ? m : ''))) && !new RegExp(w + '(诛|杀|斩|弑)').test(seg))));
module.exports = { DEATH, diesIn };
