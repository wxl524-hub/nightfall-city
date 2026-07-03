import { cloudSync } from './CloudSyncService';

class SaveService {
  constructor() {
    this.STORAGE_KEY = 'nightfall_save';
    this.MAX_SAVES = 10;
    this.AUTO_SAVE_KEY = 'nightfall_autosave';
    this.GAME_VERSION = '1.1.0';
    this._cloudPending = false;
  }

  /**
   * 命名槽位存档
   */
  async save(saveData) {
    const saves = await this.getAllSaves();

    // 同 id 覆盖
    const existingIdx = saves.findIndex(s => s.id === saveData.id);
    if (existingIdx !== -1) {
      saves[existingIdx] = this.toMetadata(saveData);
    } else {
      if (saves.length >= this.MAX_SAVES) {
        throw new SaveError('存档已满，请先删除旧存档', 'STORAGE_FULL');
      }
      saves.push(this.toMetadata(saveData));
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saves));
    localStorage.setItem(`nightfall_save_${saveData.id}`, JSON.stringify(saveData));
  }

  async load(saveId) {
    const data = localStorage.getItem(`nightfall_save_${saveId}`);
    if (!data) {
      throw new SaveError('存档不存在', 'SAVE_NOT_FOUND');
    }

    const saveData = JSON.parse(data);

    if (saveData.gameVersion && !this.isVersionCompatible(saveData.gameVersion)) {
      throw new SaveError('存档版本不兼容', 'VERSION_MISMATCH');
    }

    return saveData;
  }

  async getAllSaves() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    try {
      const list = JSON.parse(data);
      // 按时间倒序
      return list.sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  }

  async deleteSave(saveId) {
    const saves = await this.getAllSaves();
    const filtered = saves.filter(s => s.id !== saveId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    localStorage.removeItem(`nightfall_save_${saveId}`);
  }

  /**
   * 自动存档（每次切场景调用）
   * @param {Object} character 角色数据
   * @param {string} scenarioId
   * @param {number} chapterIndex
   * @param {string} sceneId
   * @param {Object} extra { sceneHistory, collectedClues, collectedItems, stats, bonusInfo }
   */
  async autoSave(character, scenarioId, chapterIndex, sceneId, extra = {}) {
    const saveData = {
      id: 'autosave',
      timestamp: Date.now(),
      character,
      currentScenarioId: scenarioId,
      currentChapterId: chapterIndex,
      currentChapterIndex: chapterIndex,
      currentSceneId: sceneId,
      sceneHistory: extra.sceneHistory || [],
      collectedClues: extra.collectedClues || [],
      collectedItems: extra.collectedItems || [],
      stats: extra.stats || null,
      bonusInfo: extra.bonusInfo || null,
      scenarioProgress: {
        chapterIndex: chapterIndex,
        completedScenes: [],
        collectedClues: extra.collectedClues || [],
        choices: []
      },
      gameVersion: this.GAME_VERSION
    };

    localStorage.setItem(this.AUTO_SAVE_KEY, JSON.stringify(saveData));

    // 后端可达时，异步备份到云端（非阻塞，失败静默）
    this._pushToCloud(saveData).catch(() => {});

    return saveData;
  }

  async _pushToCloud(saveData) {
    // 简单去抖：避免短时间高频推送
    if (this._cloudPending) return;
    this._cloudPending = true;
    try {
      await cloudSync.pushSave({
        ...saveData,
        gameVersion: this.GAME_VERSION
      });
    } finally {
      this._cloudPending = false;
    }
  }

  // 从云端拉取存档（若比本地新），返回 saveData 或 null
  async fetchCloudSave() {
    return await cloudSync.fetchSave();
  }

  async hasAutoSave() {
    const data = await this.getAutoSave();
    return data !== null;
  }

  async getAutoSave() {
    const data = localStorage.getItem(this.AUTO_SAVE_KEY);
    if (!data) return null;

    try {
      const saveData = JSON.parse(data);
      if (saveData.gameVersion && !this.isVersionCompatible(saveData.gameVersion)) {
        localStorage.removeItem(this.AUTO_SAVE_KEY);
        return null;
      }
      return saveData;
    } catch {
      return null;
    }
  }

  isVersionCompatible(version) {
    // 主版本兼容（1.x 互通，旧 1.0.0 自动迁移）
    const major = String(version).split('.')[0];
    return major === '1';
  }

  toMetadata(saveData) {
    return {
      id: saveData.id,
      timestamp: saveData.timestamp,
      characterName: saveData.character?.name || '未知',
      characterClass: saveData.character?.class,
      level: saveData.character?.level || 1,
      scenarioId: saveData.currentScenarioId,
      scenarioTitle: '',
      sceneId: saveData.currentSceneId,
      chapterIndex: saveData.currentChapterIndex ?? saveData.scenarioProgress?.chapterIndex ?? 0,
      gameVersion: saveData.gameVersion
    };
  }
}

class SaveError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'SaveError';
    this.code = code;
  }
}

export const saveService = new SaveService();
export { SaveError };
