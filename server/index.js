// 暗夜都市 — 轻量后端
// 云端存档 + 排行榜
// 使用 Express + lowdb（纯 JS JSON 存储，无需原生编译）
import express from 'express';
import cors from 'cors';
import { JSONFilePreset } from 'lowdb/node';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

// ===== lowdb 初始化 =====
const defaultData = {
  // 云存档：playerId -> saveData
  saves: {},
  // 排行榜：[{ playerId, playerName, score, level, victory, createdAt }]
  leaderboard: []
};

const dbFile = path.join(__dirname, 'db.json');
const db = await JSONFilePreset(dbFile, defaultData);
await db.read();
// 确保结构存在
db.data ||= defaultData;
db.data.saves ||= {};
db.data.leaderboard ||= [];
await db.write();

// ===== Express =====
const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// 简单日志
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ===== 健康检查 =====
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'nightfall-city', version: '1.1.0', time: Date.now() });
});

// ===== 云存档 =====
// 获取玩家存档
app.get('/api/saves/:playerId', (req, res) => {
  const { playerId } = req.params;
  const save = db.data.saves[playerId];
  if (!save) {
    return res.status(404).json({ ok: false, code: 'SAVE_NOT_FOUND' });
  }
  res.json({ ok: true, save });
});

// 保存（写入或覆盖）
app.post('/api/saves/:playerId', async (req, res) => {
  const { playerId } = req.params;
  const saveData = req.body;
  if (!saveData || !saveData.character) {
    return res.status(400).json({ ok: false, code: 'INVALID_SAVE' });
  }

  const payload = {
    ...saveData,
    playerId,
    updatedAt: Date.now()
  };

  db.data.saves[playerId] = payload;
  await db.write();
  res.json({ ok: true, updatedAt: payload.updatedAt });
});

// 删除
app.delete('/api/saves/:playerId', async (req, res) => {
  const { playerId } = req.params;
  delete db.data.saves[playerId];
  await db.write();
  res.json({ ok: true });
});

// ===== 排行榜 =====
const MAX_LEADERBOARD = 50;

// 获取排行榜（默认前 20，分数倒序）
app.get('/api/leaderboard', (_req, res) => {
  const sorted = [...db.data.leaderboard]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
  res.json({ ok: true, entries: sorted });
});

// 提交分数
app.post('/api/leaderboard', async (req, res) => {
  const { playerId, playerName, score, level, victory } = req.body || {};

  if (
    typeof playerId !== 'string' ||
    typeof score !== 'number' ||
    !playerName
  ) {
    return res.status(400).json({ ok: false, code: 'INVALID_ENTRY' });
  }

  const entry = {
    playerId,
    playerName: String(playerName).slice(0, 30),
    score: Math.max(0, Math.floor(score)),
    level: Math.max(1, Math.floor(level || 1)),
    victory: !!victory,
    createdAt: Date.now()
  };

  // 同玩家保留最高分
  const existingIdx = db.data.leaderboard.findIndex(e => e.playerId === playerId);
  if (existingIdx !== -1) {
    if (entry.score > db.data.leaderboard[existingIdx].score) {
      db.data.leaderboard[existingIdx] = entry;
    }
  } else {
    db.data.leaderboard.push(entry);
  }

  // 只保留前 N
  db.data.leaderboard = db.data.leaderboard
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_LEADERBOARD);
  await db.write();

  // 计算当前名次
  const rank = db.data.leaderboard
    .sort((a, b) => b.score - a.score)
    .findIndex(e => e.playerId === playerId) + 1;

  res.json({ ok: true, rank, entry });
});

// ===== 启动 =====
app.listen(PORT, () => {
  console.log(`🌙 暗夜都市后端已启动: http://localhost:${PORT}`);
  console.log(`   存档数据文件: ${dbFile}`);
});
