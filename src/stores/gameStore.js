import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getScenario,
  getScene,
  getAvailableOptions
} from '../data/scenarios';

export const GAME_PHASE = {
  TITLE: 'TITLE',
  CHARACTER_CREATE: 'CHARACTER_CREATE',
  SCENARIO_SELECT: 'SCENARIO_SELECT',
  PLAYING: 'PLAYING',
  COMBAT: 'COMBAT',
  SKILL_CHECK: 'SKILL_CHECK',
  VICTORY: 'VICTORY',
  GAME_OVER: 'GAME_OVER'
};

export const useGameStore = defineStore('game', () => {
  // ===== State =====
  const gamePhase = ref(GAME_PHASE.TITLE);
  const currentScenarioId = ref(null);
  const currentChapterIndex = ref(0);
  const currentSceneId = ref(null);
  const sceneHistory = ref([]);
  const bonusInfo = ref(null);
  const collectedClues = ref([]); // 已收集线索文案
  const collectedItems = ref([]); // 已获得道具 id
  const stats = ref({
    scenesVisited: 0,
    skillChecksPassed: 0,
    skillChecksFailed: 0,
    combatsWon: 0,
    combatsLost: 0,
    startTime: null,
    endTime: null
  });

  // ===== Getters =====
  const currentScenario = computed(() => getScenario(currentScenarioId.value));

  const currentChapter = computed(() => {
    if (!currentScenario.value) return null;
    return currentScenario.value.chapters[currentChapterIndex.value];
  });

  const currentScene = computed(() => {
    if (!currentScenarioId.value || !currentSceneId.value) return null;
    return getScene(currentScenarioId.value, currentSceneId.value);
  });

  const availableOptions = computed(() => {
    if (!currentScene.value) return [];
    return getAvailableOptions(currentScene.value, null);
  });

  const isEnding = computed(
    () => gamePhase.value === GAME_PHASE.VICTORY || gamePhase.value === GAME_PHASE.GAME_OVER
  );

  // ===== Actions =====
  function startNewGame() {
    gamePhase.value = GAME_PHASE.CHARACTER_CREATE;
  }

  function loadScenario(scenarioId) {
    currentScenarioId.value = scenarioId;
    currentChapterIndex.value = 0;
    currentSceneId.value = 'scene-1';
    sceneHistory.value = [];
    bonusInfo.value = null;
    collectedClues.value = [];
    collectedItems.value = [];
    stats.value = {
      scenesVisited: 1,
      skillChecksPassed: 0,
      skillChecksFailed: 0,
      combatsWon: 0,
      combatsLost: 0,
      startTime: Date.now(),
      endTime: null
    };
    gamePhase.value = GAME_PHASE.PLAYING;
  }

  function loadScene(sceneId) {
    if (currentSceneId.value) {
      sceneHistory.value.push(currentSceneId.value);
    }
    currentSceneId.value = sceneId;
    bonusInfo.value = null;
    stats.value.scenesVisited++;
  }

  function setBonusInfo(info) {
    bonusInfo.value = info;
    if (info) {
      addClue(info);
    }
  }

  function addClue(text) {
    if (text && !collectedClues.value.includes(text)) {
      collectedClues.value.push(text);
    }
  }

  function addCollectedItem(itemId) {
    if (itemId && !collectedItems.value.includes(itemId)) {
      collectedItems.value.push(itemId);
    }
  }

  function makeChoice(choice, characterBackground) {
    if (!choice) return;
    const filteredOptions = getAvailableOptions(currentScene.value, characterBackground);
    const isValidOption = filteredOptions.find(opt => opt.id === choice.id);

    if (!isValidOption) return;

    // 切换场景
    loadScene(choice.nextSceneId);
  }

  function goBack() {
    const prevSceneId = sceneHistory.value.pop();
    if (prevSceneId) {
      currentSceneId.value = prevSceneId;
      bonusInfo.value = null;
    }
  }

  function triggerEvent(event) {
    switch (event.type) {
      case 'combat':
        gamePhase.value = GAME_PHASE.COMBAT;
        break;
      case 'skill_check':
        gamePhase.value = GAME_PHASE.SKILL_CHECK;
        break;
    }
  }

  function endChapter() {
    if (currentChapterIndex.value < (currentScenario.value?.chapters?.length ?? 1) - 1) {
      currentChapterIndex.value++;
    } else {
      winGame();
    }
  }

  function winGame() {
    gamePhase.value = GAME_PHASE.VICTORY;
    stats.value.endTime = Date.now();
  }

  function loseGame() {
    gamePhase.value = GAME_PHASE.GAME_OVER;
    stats.value.endTime = Date.now();
  }

  function endGame() {
    gamePhase.value = GAME_PHASE.GAME_OVER;
    stats.value.endTime = Date.now();
  }

  function setGamePhase(phase) {
    gamePhase.value = phase;
  }

  // 战斗结果回调
  function recordCombatResult(won) {
    if (won) stats.value.combatsWon++;
    else stats.value.combatsLost++;
  }

  function recordSkillCheck(passed) {
    if (passed) stats.value.skillChecksPassed++;
    else stats.value.skillChecksFailed++;
  }

  function resetGame() {
    gamePhase.value = GAME_PHASE.TITLE;
    currentScenarioId.value = null;
    currentChapterIndex.value = 0;
    currentSceneId.value = null;
    sceneHistory.value = [];
    bonusInfo.value = null;
    collectedClues.value = [];
    collectedItems.value = [];
    stats.value = {
      scenesVisited: 0,
      skillChecksPassed: 0,
      skillChecksFailed: 0,
      combatsWon: 0,
      combatsLost: 0,
      startTime: null,
      endTime: null
    };
  }

  /**
   * 从存档数据恢复游戏状态（不含角色，角色由 characterStore.setCharacter 处理）
   */
  function loadFromSave(saveData) {
    if (!saveData) return;
    currentScenarioId.value = saveData.currentScenarioId;
    currentChapterIndex.value = saveData.currentChapterIndex ?? saveData.currentChapterId ?? 0;
    currentSceneId.value = saveData.currentSceneId;
    sceneHistory.value = saveData.sceneHistory || [];
    collectedClues.value = saveData.collectedClues || [];
    collectedItems.value = saveData.collectedItems || [];
    bonusInfo.value = saveData.bonusInfo || null;
    if (saveData.stats) stats.value = saveData.stats;
    gamePhase.value = GAME_PHASE.PLAYING;
  }

  return {
    gamePhase,
    currentScenarioId,
    currentChapterIndex,
    currentSceneId,
    sceneHistory,
    bonusInfo,
    collectedClues,
    collectedItems,
    stats,
    currentScenario,
    currentChapter,
    currentScene,
    availableOptions,
    isEnding,
    startNewGame,
    loadScenario,
    loadScene,
    setBonusInfo,
    addClue,
    addCollectedItem,
    makeChoice,
    goBack,
    triggerEvent,
    endChapter,
    winGame,
    loseGame,
    endGame,
    setGamePhase,
    recordCombatResult,
    recordSkillCheck,
    resetGame,
    loadFromSave
  };
});
