// 跨卷人物的统一简介：同一人物在合集多卷出现时，各卷的原名、生卒、简介都以这里为准（势力仍按各卷）。
// 构建时（build.mjs）覆盖各书 PEOPLE_RAW 中的同名人物。条目：[原名, 生卒, 简介, 适用的卷（可省）]。
const PEOPLE_COMMON = {
};
const commonOf = (n, id) => { const v = Object.prototype.hasOwnProperty.call(PEOPLE_COMMON, n) ? PEOPLE_COMMON[n] : null; if (!v) return null; return (Array.isArray(v[0]) ? v : [v]).find(c => !c[3] || c[3].includes(id)) || null; };
