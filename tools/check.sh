#!/bin/sh
# 用法：sh tools/check.sh [书 …]：跑全部数据校验（不需要第三方包与命令行参数的那些），任何一项报出问题即以 1 退出。
# unlinked（正文提到而未挂名的人物）只是待办清单，照常打印数量，不算失败。CI（.github/workflows/pages.yml）构建前也跑这一步。
cd "$(dirname "$0")/.." || exit 2
fail=0
for t in posthumous evorder thresholds orphans refs legendname snapstep coexist citystep leaderfac facstep dupsent; do
  o=$(node "tools/$t.js" "$@" 2>&1); s=$?; l=$(echo "$o" | tail -1)
  if [ $s -ne 0 ] || ! echo "$l" | grep -q "共 0 "; then echo "== $t"; echo "$o" | tail -20; fail=1; fi
done
node tools/unlinked.js "$@" 2>&1 | tail -1
[ $fail -eq 0 ] && echo "全部校验通过"
exit $fail
