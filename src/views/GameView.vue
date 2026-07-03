<template>
  <div class="min-h-screen bg-bg-dark flex flex-col">
    <!-- 顶部状态栏 -->
    <div class="bg-bg-panel border-b border-color-border p-4">
      <div class="max-w-4xl mx-auto flex justify-between items-center">
        <button
          @click="handleBack"
          class="text-text-secondary hover:text-accent transition-colors font-ui"
        >
          ← 暂停
        </button>
        <h2 class="font-gothic text-text-accent">
          {{ gameStore.currentScenario?.title || '游戏' }}
        </h2>
        <div class="flex gap-3">
          <button
            @click="handleManualSave"
            class="text-text-secondary hover:text-accent transition-colors font-ui"
          >
            存档
          </button>
          <button
            @click="openInventory"
            class="text-text-secondary hover:text-accent transition-colors font-ui"
          >
            物品({{ inventoryCount }})
          </button>
        </div>
      </div>
    </div>

    <!-- 游戏主区域 -->
    <div class="flex-1 flex items-center justify-center p-8">
      <NarrativeBox
        v-if="currentScene"
        :scene="currentScene"
        :bonusInfo="gameStore.bonusInfo"
        @complete="handleSceneComplete"
        @choice="handleChoice"
      />

      <div v-else class="text-center">
        <p class="font-body text-text-secondary text-lg">场景加载中...</p>
      </div>
    </div>

    <!-- 角色状态 -->
    <div class="bg-bg-panel border-t border-color-border p-4">
      <div class="max-w-4xl mx-auto">
        <CharacterStatus :compact="true" />
      </div>
    </div>

    <!-- 技能检定弹窗 -->
    <div
      v-if="skillCheck.visible"
      class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      @click.self="closeSkillCheck"
    >
      <div class="bg-bg-panel border border-color-border rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <h3 class="font-gothic text-2xl text-accent mb-6">
          {{ getAttrName(skillCheck.info?.attributeName) }}检定
        </h3>

        <!-- 掷骰中 -->
        <div v-if="skillCheck.info && !skillCheck.result" class="space-y-4">
          <div class="text-text-secondary text-sm">
            <p>需求 DC: {{ skillCheck.info.dc }}</p>
            <p>属性: {{ skillCheck.info.baseValue }}<span v-if="skillCheck.info.backgroundBonus"> (+背景 {{ skillCheck.info.backgroundBonus }})</span></p>
          </div>
          <div class="text-6xl font-gothic text-accent animate-bounce">
            🎲
          </div>
          <p class="text-text-primary">掷骰中...</p>
        </div>

        <!-- 检定结果 -->
        <div v-else-if="skillCheck.result" class="space-y-4">
          <div
            :class="[
              'text-6xl font-gothic mb-2',
              skillCheck.result.success ? 'text-accent' : 'text-secondary'
            ]"
          >
            {{ skillCheck.result.success ? '成功!' : '失败...' }}
          </div>

          <div class="text-text-secondary text-sm">
            <p>
              掷骰 {{ skillCheck.result.value }}
              + 属性 {{ skillCheck.result.attributeValue }}
              = <span class="text-text-primary font-bold">{{ skillCheck.result.total }}</span>
              <span class="ml-2">/ DC {{ skillCheck.result.dc }}</span>
            </p>
            <p v-if="skillCheck.result.isCritical" class="text-accent mt-1">⚡ 暴击！</p>
            <p v-else-if="skillCheck.result.isFumble" class="text-secondary mt-1">💀 大失败！</p>
          </div>

          <p class="text-text-primary text-sm">{{ skillCheck.result.message }}</p>

          <div v-if="skillCheck.result.reward" class="bg-accent/10 border border-accent/30 rounded-lg p-3">
            <div class="flex items-center gap-3">
              <span class="text-3xl">{{ skillCheck.result.reward.icon }}</span>
              <div class="text-left">
                <div class="text-accent font-bold">{{ skillCheck.result.reward.name }}</div>
                <div class="text-text-secondary text-xs">{{ skillCheck.result.reward.description }}</div>
              </div>
            </div>
            <div v-if="skillCheck.result.bonusXP" class="mt-2 text-text-accent text-sm">
              ✨ 获得 {{ skillCheck.result.bonusXP }} 经验值
            </div>
          </div>

          <div v-if="!skillCheck.result.success && skillCheck.result.penalty" class="bg-secondary/10 border border-secondary/30 rounded-lg p-3">
            <div class="text-secondary font-bold">💔 {{ skillCheck.result.penalty.description }}</div>
          </div>

          <button
            @click="finishSkillCheck"
            class="mt-2 px-6 py-3 bg-bg-dark border border-color-border rounded-lg text-text-primary hover:border-accent transition-all"
          >
            继续
          </button>
        </div>
      </div>
    </div>

    <!-- 物品栏弹窗 -->
    <InventoryModal v-if="showInventory" @close="showInventory = false" />

    <!-- 结算/结局页 -->
    <div
      v-if="gameStore.isEnding"
      class="fixed inset-0 bg-black/85 flex items-center justify-center z-50"
    >
      <div class="bg-bg-panel border border-color-border rounded-lg p-8 max-w-lg w-full mx-4">
        <h2
          :class="[
            'font-gothic text-4xl mb-4 text-center',
            gameStore.gamePhase === 'VICTORY' ? 'text-accent' : 'text-secondary'
          ]"
        >
          {{ gameStore.gamePhase === 'VICTORY' ? '真相大白' : '游戏结束' }}
        </h2>
        <p class="text-text-secondary text-center mb-6">
          {{ gameStore.gamePhase === 'VICTORY'
            ? '你揭开了圣玛丽医院背后的秘密。'
            : '你倒在了黑暗之中...' }}
        </p>

        <div class="space-y-2 text-sm mb-6 bg-bg-dark p-4 rounded-lg border border-color-border">
          <div class="flex justify-between"><span class="text-text-secondary">角色</span><span class="text-text-primary">{{ characterStore.character?.name }}</span></div>
          <div class="flex justify-between"><span class="text-text-secondary">等级</span><span class="text-accent">Lv.{{ characterStore.level }}</span></div>
          <div class="flex justify-between"><span class="text-text-secondary">探索场景</span><span class="text-text-primary">{{ gameStore.stats.scenesVisited }}</span></div>
          <div class="flex justify-between"><span class="text-text-secondary">收集线索</span><span class="text-text-primary">{{ gameStore.collectedClues.length }}</span></div>
          <div class="flex justify-between"><span class="text-text-secondary">战斗胜利</span><span class="text-color-success">{{ gameStore.stats.combatsWon }}</span></div>
          <div class="flex justify-between"><span class="text-text-secondary">技能检定通过</span><span class="text-text-primary">{{ gameStore.stats.skillChecksPassed }}</span></div>
          <div class="flex justify-between"><span class="text-text-secondary">最终得分</span><span class="text-accent font-bold">{{ finalScore }}</span></div>
        </div>

        <div class="flex gap-3">
          <Button variant="secondary" class="flex-1" @click="handleReturnHome">回到主菜单</Button>
          <Button variant="primary" class="flex-1" @click="handleRestart">重新开始</Button>
        </div>

        <div class="mt-4">
          <button
            v-if="!scoreSubmitted"
            @click="submitScore"
            class="w-full px-4 py-2 text-center text-accent border border-accent/30 rounded hover:bg-accent/10 transition-colors font-ui"
            :disabled="scoreSubmitting"
          >
            {{ scoreSubmitting ? '提交中...' : '🏆 提交分数到排行榜' }}
          </button>
          <div v-else-if="scoreResult" class="text-center text-text-secondary text-sm">
            {{ scoreResult }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore, GAME_PHASE } from '../stores/gameStore';
import { useCombatStore } from '../stores/combatStore';
import { useCharacterStore } from '../stores/characterStore';
import { useSkillCheck } from '../composables/useSkillCheck';
import { resolveEnemies } from '../data/enemies';
import { getItem } from '../data/items';
import { saveService } from '../services/SaveService';
import { cloudSync } from '../services/CloudSyncService';
import { audioManager } from '../services/AudioManager';
import NarrativeBox from '../components/game/Narrative/NarrativeBox.vue';
import CharacterStatus from '../components/game/common/CharacterStatus.vue';
import InventoryModal from '../components/game/common/InventoryModal.vue';
import Button from '../components/ui/Button.vue';

const router = useRouter();
const gameStore = useGameStore();
const combatStore = useCombatStore();
const characterStore = useCharacterStore();
const { performCheckAnimated } = useSkillCheck();

const currentScene = computed(() => gameStore.currentScene);
const inventoryCount = computed(
  () => characterStore.character?.inventory?.reduce((s, i) => s + (i.quantity || 1), 0) ?? 0
);

const showInventory = ref(false);

// 技能检定弹窗状态
const skillCheck = ref({
  visible: false,
  info: null,
  result: null,
  pendingChoice: null
});

// ===== 属性名映射 =====
function getAttrName(attr) {
  const names = {
    strength: '力量',
    agility: '敏捷',
    intelligence: '智力',
    perception: '感知',
    charisma: '魅力',
    willpower: '意志'
  };
  return names[attr] || attr;
}

// ===== 顶部操作 =====
function handleBack() {
  // 暂停：回主菜单（不结束当前进度，自动存档保留）
  autoSave();
  router.push('/');
}

function handleManualSave() {
  autoSave();
  alert('已存档（自动存档槽位）');
}

function openInventory() {
  showInventory.value = true;
}

// ===== 场景流转 =====
function handleSceneComplete() {
  const scene = currentScene.value;
  if (!scene) return;

  // 处理场景级触发事件（如无选项场景直接触发战斗）
  if (scene.triggerEvent) {
    handleTriggerEvent(scene.triggerEvent);
  }
}

function handleChoice(choice) {
  const scene = currentScene.value;
  if (!scene) return;

  // 需要技能检定的选项
  if (choice.requirement) {
    skillCheck.value = {
      visible: true,
      info: null,
      result: null,
      pendingChoice: choice
    };
    runSkillCheck(choice);
    return;
  }

  // 背景专属选项：直接进入
  proceedToScene(choice);
}

async function runSkillCheck(choice) {
  const result = await performCheckAnimated(choice.requirement);

  const info = {
    attributeName: result.attributeName,
    baseValue: result.baseValue,
    backgroundBonus: result.backgroundBonus,
    dc: result.dc
  };

  skillCheck.value.info = info;

  let resultPayload;
  if (result.success) {
    let bonusXP = 10;
    let reward = null;
    let message = '检定成功！你顺利完成了行动。';

    if (result.isCritical) {
      bonusXP = 20;
      message = '出色的表现！你完美地完成了行动。';
    }

    // 给予经验
    characterStore.gainExperience(bonusXP);

    resultPayload = {
      success: true,
      message,
      bonusXP,
      reward,
      value: result.value,
      attributeValue: result.attributeValue,
      total: result.total,
      dc: result.dc,
      isCritical: result.isCritical,
      isFumble: result.isFumble
    };
  } else {
    // 失败惩罚
    const damage = result.isFumble ? 5 : 2;
    characterStore.takeDamage(damage);

    const message = result.isFumble
      ? '糟糕！行动出现了严重失误。'
      : '检定失败，你未能达到预期效果。';

    resultPayload = {
      success: false,
      message,
      penalty: { type: 'damage', amount: damage, description: `受到 ${damage} 点伤害` },
      value: result.value,
      attributeValue: result.attributeValue,
      total: result.total,
      dc: result.dc,
      isCritical: result.isCritical,
      isFumble: result.isFumble
    };

    // 失败：检查角色是否死亡
    if (characterStore.currentHp <= 0) {
      gameStore.loseGame();
    }
  }

  skillCheck.value.result = resultPayload;

  // 检定结果音效
  if (result.success) {
    audioManager.playCheckSuccess();
  } else {
    audioManager.playCheckFail();
    if (result.isFumble) audioManager.playDamage();
  }
}

function finishSkillCheck() {
  const choice = skillCheck.value.pendingChoice;
  const result = skillCheck.value.result;

  closeSkillCheck();

  if (!choice) return;

  // 检定通过 → 进入目标场景；失败则留在原场景
  if (result?.success) {
    proceedToScene(choice);
  }
}

function closeSkillCheck() {
  skillCheck.value = {
    visible: false,
    info: null,
    result: null,
    pendingChoice: null
  };
}

function proceedToScene(choice) {
  const scene = currentScene.value;

  // 发放当前场景进入前的奖励（部分场景写在 bonus 字段，进入时给）
  // 注意：bonus 一般在「进入该场景后」立即生效，因此放在 loadScene 后由 watch 处理

  gameStore.makeChoice(choice, characterStore.character?.background);
  autoSave();
}

// ===== 场景切换后处理：bonus / triggerEvent / bonusInfo =====
watch(
  () => gameStore.currentSceneId,
  (newId, oldId) => {
    applySceneEffects();
    // 场景切换音效（跳过首次进入）
    if (oldId && newId !== oldId) {
      audioManager.playSceneTransition();
    }
  }
);

onMounted(() => {
  applySceneEffects();
});

function applySceneEffects() {
  const scene = currentScene.value;
  if (!scene) return;

  // 线索提示
  if (scene.bonusInfo) {
    gameStore.setBonusInfo(scene.bonusInfo);
  }

  // 场景奖励：道具 / 临时增益
  if (scene.bonus) {
    handleSceneBonus(scene.bonus);
  }

  // 场景直接触发战斗（如 scene-3a 被附身的女人）
  if (scene.triggerEvent && scene.options?.length === 0) {
    handleTriggerEvent(scene.triggerEvent);
  }
}

function handleSceneBonus(bonus) {
  switch (bonus.type) {
    case 'item': {
      const item = getItem(bonus.itemId);
      if (item) {
        characterStore.addItem(item);
        gameStore.addCollectedItem(bonus.itemId);
      }
      break;
    }
    case 'temporary_buff': {
      // 临时增益（如驱魔师的意志+3）
      if (!characterStore.character.activeEffects) {
        characterStore.character.activeEffects = [];
      }
      characterStore.character.activeEffects.push({
        type: 'attribute_bonus',
        attribute: bonus.attribute,
        value: bonus.value,
        duration: bonus.duration || 'combat'
      });
      if (bonus.attribute && characterStore.character.attributes[bonus.attribute] != null) {
        characterStore.character.attributes[bonus.attribute] += bonus.value;
      }
      break;
    }
  }
}

function handleTriggerEvent(event) {
  switch (event.type) {
    case 'combat': {
      const enemyList = resolveEnemies(event.enemy);
      const returnSceneId = gameStore.currentSceneId;
      const nextSceneId = event.nextSceneId ?? null;
      combatStore.startCombat(enemyList, { returnSceneId, nextSceneId });
      gameStore.setGamePhase(GAME_PHASE.COMBAT);
      router.push('/battle');
      break;
    }
    case 'skill_check':
      gameStore.setGamePhase(GAME_PHASE.SKILL_CHECK);
      break;
  }
}

// ===== 自动存档 =====
function autoSave() {
  if (!characterStore.character || !gameStore.currentScenarioId) return;
  saveService.autoSave(
    characterStore.character,
    gameStore.currentScenarioId,
    gameStore.currentChapterIndex,
    gameStore.currentSceneId,
    {
      sceneHistory: gameStore.sceneHistory,
      collectedClues: gameStore.collectedClues,
      collectedItems: gameStore.collectedItems,
      stats: gameStore.stats,
      bonusInfo: gameStore.bonusInfo
    }
  );
}

// ===== 结算得分 =====
const finalScore = computed(() => {
  if (!characterStore.character) return 0;
  const base = characterStore.level * 100;
  const clueBonus = gameStore.collectedClues.length * 30;
  const combatBonus = gameStore.stats.combatsWon * 50;
  const checkBonus = gameStore.stats.skillChecksPassed * 15;
  const victoryBonus = gameStore.gamePhase === GAME_PHASE.VICTORY ? 500 : 0;
  return base + clueBonus + combatBonus + checkBonus + victoryBonus;
});

// ===== 结局处理 =====
function handleReturnHome() {
  autoSave();
  router.push('/');
}

function handleRestart() {
  gameStore.resetGame();
  characterStore.resetCharacter();
  combatStore.resetCombat();
  router.push('/create');
}

// 从战斗胜利返回时，标记战斗结果
watch(
  () => gameStore.gamePhase,
  (phase) => {
    if (phase === GAME_PHASE.PLAYING && combatStore.resultInfo) {
      gameStore.recordCombatResult(combatStore.resultInfo.victory);
    }
  }
);

// ===== 排行榜提交 =====
const scoreSubmitted = ref(false);
const scoreSubmitting = ref(false);
const scoreResult = ref('');

// ===== 升级音效：监听角色等级提升 =====
let lastLevel = characterStore.level;
watch(
  () => characterStore.level,
  (lvl) => {
    if (lvl > lastLevel) {
      audioManager.playLevelUp();
    }
    lastLevel = lvl;
  }
);

async function submitScore() {
  scoreSubmitting.value = true;
  try {
    const res = await cloudSync.submitScore({
      playerName: characterStore.character?.name || '无名',
      score: finalScore.value,
      level: characterStore.level,
      victory: gameStore.gamePhase === GAME_PHASE.VICTORY
    });
    if (res) {
      scoreSubmitted.value = true;
      scoreResult.value = `提交成功！排名 #${res.rank}`;
    } else {
      scoreResult.value = '后端未连接，提交失败';
    }
  } catch {
    scoreResult.value = '提交失败';
  } finally {
    scoreSubmitting.value = false;
  }
}
</script>
