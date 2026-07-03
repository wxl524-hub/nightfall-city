# 暗夜都市优化 — 工作进度

> 四阶段优化已**全部完成** ✅

## 总体完成情况

| 阶段 | 内容 | 状态 |
|---|---|---|
| **A** | 修复 10 个致命 Bug，游戏可完整通关 | ✅ |
| **B** | 技能检定+背景加成、战斗深度(防御/增益/定身/减伤)、物品系统 | ✅ |
| **C** | Express+lowdb 后端(云存档+排行榜)、CloudSyncService、PWA 配置 | ✅ |
| **D** | AudioManager(Web Audio)、SettingsModal、GSAP 动效、vite-plugin-pwa | ✅ |

## 新增/修改文件清单

### 新增文件
- `server/index.js` — Express 后端
- `server/package.json`
- `src/data/items.js` — 道具数据
- `src/data/enemies.js` — 敌人数据
- `src/composables/useSkillCheck.js` — 技能检定组合式
- `src/services/AudioManager.js` — Web Audio 音效
- `src/services/CloudSyncService.js` — 云端同步
- `src/components/game/common/InventoryModal.vue` — 物品栏弹窗
- `src/components/ui/SettingsModal.vue` — 设置弹窗
- `src/views/LeaderboardView.vue` — 排行榜视图
- `public/pwa-icon-192.svg` / `public/pwa-icon-512.svg`
- `.gitignore` / `README.md` / `PROGRESS.md`

### 重写文件（修复 Bug + 增强功能）
- `src/stores/combatStore.js` — 同步骰子、防御/增益/定身/减伤、战斗物品
- `src/stores/characterStore.js` — 修复升级越界、扩展物品效果
- `src/stores/gameStore.js` — 线索收集、统计、结局、loadFromSave
- `src/views/GameView.vue` — 接入真实剧本、技能检定、奖励、结算
- `src/views/BattleView.vue` — 物品面板、激活效果、音效+GSAP 抖动
- `src/views/HomeView.vue` — 真实存档加载、排行榜入口
- `src/views/ScenarioSelectView.vue` — 真实剧本列表
- `src/views/SaveLoadView.vue` — 真实加载/删除/手动存档
- `src/components/game/Narrative/NarrativeBox.vue` — 修复字段、点击跳过、线索显示、GSAP 淡入
- `src/services/SaveService.js` — 扩展自动存档、云备份
- `src/router/index.js` — 新增排行榜路由
- `vite.config.js` — proxy + PWA + manualChunks
- `package.json` — 新脚本、版本 1.1.0

## 最终构建结果
```
✓ 60 modules, 1.38s
PWA: 22 entries precached (275 KB)
vendor-vue: 96 KB (Vue + Router + Pinia)
无空 chunk，无编译错误
```

## 使用方式
```bash
npm install          # 安装所有依赖（前端+后端）
npm run dev:all       # 同时启动前端(5173)+后端(3001)
npm run build         # 生产构建（含 PWA Service Worker）
```
