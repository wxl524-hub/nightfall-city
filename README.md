# 🌙 暗夜都市 — Nightfall City

都市奇幻 TRPG 网页游戏，基于 D&D 掷骰判定系统。
使用 Vue 3 + Pinia + Tailwind 构建，配合轻量 Express 后端实现云存档与排行榜。

## 快速开始

```bash
# 安装依赖（前端 + 后端）
npm install

# 启动前端（Vite dev server，端口 5173）
npm run dev

# 同时启动前端 + 后端（推荐）
npm run dev:all
# 前端: http://localhost:5173
# 后端: http://localhost:3001

# 仅启动后端
npm run server
```

## 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `VITE_API_BASE` | _(同源)_ | 后端 API 地址（生产部署时设为 `https://your-server.com`）|
| `PORT` | `3001` | 后端监听端口 |

## 项目结构

```
├── src/                    # 前端源码
│   ├── components/         # Vue 组件
│   │   ├── game/           # 游戏相关（叙事框、角色状态、物品栏）
│   │   └── ui/             # 通用 UI（按钮、面板、骰子、进度条）
│   ├── composables/        # 组合式函数（掷骰、技能检定、游戏流程）
│   ├── data/               # 游戏数据（剧本、技能、道具、敌人、背景）
│   ├── router/             # 路由配置
│   ├── services/           # 服务层（存档、云同步、骰子服务）
│   ├── stores/             # Pinia 状态管理（游戏、角色、战斗）
│   ├── styles/             # 全局样式
│   └── views/              # 页面视图
├── server/                 # 后端（Express + lowdb）
│   └── index.js            # 云存档 + 排行榜 API
├── .gitignore
├── README.md
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.cjs
└── vite.config.js
```

## 游戏特色

- **D&D 掷骰系统**：D20 属性检定、暴击/大失败、优劣势
- **职业系统**：调查员 / 灵媒师 / 法师 / 猎人，各有独特技能
- **背景加成**：侦探、神秘学者、幸存者、记者、法医、驱魔师提供不同场景加成
- **回合制战斗**：攻击、防御减伤、技能（San 消耗+冷却）、战斗物品
- **剧本分支**：基于技能检定和角色背景的多线叙事
- **存档系统**：自动存档 + 手动存档槽位 + 云端同步
- **排行榜**：通关后提交分数到排行榜

## 后端 API

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 健康检查 |
| GET | `/api/saves/:playerId` | 获取玩家云存档 |
| POST | `/api/saves/:playerId` | 保存/更新云存档 |
| DELETE | `/api/saves/:playerId` | 删除云存档 |
| GET | `/api/leaderboard` | 获取排行榜 Top 20 |
| POST | `/api/leaderboard` | 提交分数到排行榜 |

## 构建

```bash
npm run build    # 输出到 dist/
npm run preview  # 预览构建产物
```

## 技术栈

- **前端**: Vue 3 · Pinia · Vue Router · Tailwind CSS · GSAP
- **后端**: Express · lowdb · cors
- **开发**: Vite · nodemon · concurrently
