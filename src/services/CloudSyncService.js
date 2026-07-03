// 云端同步服务：存档云端备份 + 排行榜
// 本地优先，后端不可达时静默回退，不影响游戏
import { nanoid } from 'nanoid';

const PLAYER_ID_KEY = 'nightfall_player_id';
const DEFAULT_TIMEOUT = 5000;

// API 基地址：开发环境走 Vite proxy（同源 /api），生产环境用 VITE_API_BASE
function getBaseUrl() {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE.replace(/\/$/, '');
  }
  // 同源（dev proxy 或部署在同域名下）
  return '';
}

class CloudSyncService {
  constructor() {
    this._online = null; // 缓存：null=未知 true/false
  }

  // ===== 玩家 ID（持久化于 localStorage）=====
  getPlayerId() {
    let id = localStorage.getItem(PLAYER_ID_KEY);
    if (!id) {
      id = nanoid(12);
      localStorage.setItem(PLAYER_ID_KEY, id);
    }
    return id;
  }

  // ===== 后端连通性 =====
  async isOnline() {
    if (this._online !== null) return this._online;
    try {
      const res = await this._fetch('/api/health', { method: 'GET' });
      this._online = !!res?.ok;
    } catch {
      this._online = false;
    }
    return this._online;
  }

  async _fetch(pathname, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeout ?? DEFAULT_TIMEOUT);
    try {
      const res = await fetch(getBaseUrl() + pathname, {
        method: options.method || 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  // ===== 云存档 =====
  async fetchSave() {
    if (!(await this.isOnline())) return null;
    try {
      const res = await this._fetch(`/api/saves/${this.getPlayerId()}`);
      if (res?.ok) return res.save;
      return null;
    } catch {
      return null;
    }
  }

  async pushSave(saveData) {
    if (!(await this.isOnline())) return false;
    try {
      const res = await this._fetch(`/api/saves/${this.getPlayerId()}`, {
        method: 'POST',
        body: { ...saveData, playerId: this.getPlayerId() }
      });
      return !!res?.ok;
    } catch {
      return false;
    }
  }

  async deleteSave() {
    if (!(await this.isOnline())) return false;
    try {
      const res = await this._fetch(`/api/saves/${this.getPlayerId()}`, { method: 'DELETE' });
      return !!res?.ok;
    } catch {
      return false;
    }
  }

  // ===== 排行榜 =====
  async fetchLeaderboard() {
    if (!(await this.isOnline())) return [];
    try {
      const res = await this._fetch('/api/leaderboard');
      return res?.ok ? res.entries : [];
    } catch {
      return [];
    }
  }

  async submitScore({ playerName, score, level, victory }) {
    if (!(await this.isOnline())) return null;
    try {
      const res = await this._fetch('/api/leaderboard', {
        method: 'POST',
        body: {
          playerId: this.getPlayerId(),
          playerName,
          score,
          level,
          victory
        }
      });
      if (res?.ok) return { rank: res.rank, entry: res.entry };
      return null;
    } catch {
      return null;
    }
  }
}

export const cloudSync = new CloudSyncService();
