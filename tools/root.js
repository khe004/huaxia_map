// 合集的根目录：环境变量 YUTU_SERIES 指定（如 YUTU_SERIES=series/west），各卷在其下的 books/，卷目在其下的 series.json；
// 不指定时为仓库根目录（华夏舆图）。底图包（basemaps/）与引擎（engine/）总在仓库根目录。
const path = require('path');
const REPO = path.join(__dirname, '..');
const R = process.env.YUTU_SERIES ? path.resolve(REPO, process.env.YUTU_SERIES) : REPO;
module.exports = { R, REPO };
