<template>
  <div class="min-h-screen bg-bg-dark flex flex-col">
    <!-- 战斗头部 -->
    <div class="bg-primary border-b border-secondary p-4">
      <div class="max-w-4xl mx-auto flex justify-between items-center">
        <h1 class="font-gothic text-2xl text-accent">战斗</h1>
        <span class="font-ui text-text-secondary">回合 {{ combatStore.turn }}</span>
      </div>
    </div>

    <!-- 战斗区域 -->
    <div ref="battleArea" class="flex-1 flex flex-col md:flex-row p-4 md:p-8 gap-4 md:gap-8">
      <!-- 玩家状态 -->
      <div class="md:w-1/3">
        <div class="bg-bg-panel border border-color-border rounded-lg p-4 gothic-border">
          <h3 class="font-gothic text-text-accent mb-4">{{ combatStore.player?.name || '玩家' }}</h3>

          <div class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-text-secondary">生命值</span>
              <span class="text-text-primary">{{ combatStore.player?.hp || 0 }} / {{ combatStore.player?.maxHp || 0 }}</span>
            </div>
            <div class="h-4 bg-bg-dark rounded-full overflow-hidden">
              <div
                :class="['h-full transition-all duration-300', playerHpPercent < 30 ? 'bg-gradient-to-r from-red-600 to-red-400 animate-pulse' : 'bg-gradient-to-r from-secondary to-red-500']"
                :style="{ width: `${playerHpPercent}%` }"
              />
            </div>
          </div>

          <div class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-text-secondary">San值</span>
              <span class="text-text-primary">{{ combatStore.player?.san || 0 }} / {{ combatStore.player?.maxSan || 0 }}</span>
            </div>
            <div class="h-4 bg-bg-dark rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300"
                :style="{ width: `${playerSanPercent}%` }"
              />
            </div>
          </div>

          <div class="text-sm text-text-secondary space-y-1">
            <div>攻击: {{ combatStore.player?.attributes?.strength || 0 }}</div>
            <div>敏捷: {{ combatStore.player?.attributes?.agility || 0 }}</div>
            <div>等级: Lv.{{ combatStore.player?.level || 1 }}</div>
          </div>

          <!-- 激活效果 -->
          <div v-if="activeEffects.length" class="mt-3 pt-3 border-t border-color-border">
            <div class="text-xs text-text-secondary mb-1">激活状态</div>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="(eff, idx) in activeEffects"
                :key="idx"
                class="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded"
              >
                {{ effectLabel(eff) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 敌人状态 -->
      <div class="md:w-1/3">
        <div class="bg-bg-panel border border-secondary rounded-lg p-4 gothic-border">
          <h3 class="font-gothic text-secondary mb-4">敌人</h3>

          <div v-for="enemy in combatStore.enemies" :key="enemy.id" class="mb-4 last:mb-0">
            <div class="flex justify-between items-center mb-1">
              <span :class="['text-text-primary font-ui', enemy.hp <= 0 ? 'line-through opacity-40' : '']">
                {{ enemy.name }}
              </span>
              <span class="text-sm text-text-secondary">{{ enemy.hp }} / {{ enemy.maxHp }}</span>
            </div>
            <div class="h-3 bg-bg-dark rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-secondary to-red-500 transition-all duration-300"
                :style="{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }"
              />
            </div>
            <div class="text-sm text-text-secondary mt-2 flex gap-3">
              <span>攻击: {{ enemy.attack || 0 }}</span>
              <span>防御: {{ enemy.defense || 0 }}</span>
              <span v-if="enemy.stunned" class="text-accent">[定身]</span>
            </div>
          </div>

          <div v-if="combatStore.aliveEnemies.length === 0" class="text-center text-color-success py-4">
            所有敌人已被击败
          </div>
        </div>
      </div>

      <!-- 战斗日志 -->
      <div class="md:w-1/3">
        <div class="bg-bg-panel border border-color-border rounded-lg p-4 h-full max-h-64 overflow-y-auto">
          <h3 class="font-gothic text-text-accent mb-3">战斗日志</h3>
          <div class="space-y-2 text-sm">
            <div
              v-for="entry in combatStore.log"
              :key="entry.id"
              class="border-b border-color-border/50 pb-2 last:border-0"
            >
              <span :class="getLogColor(entry.result)">{{ entry.actor }}</span>
              {{ entry.action }}
              <span v-if="entry.target"> → {{ entry.target }}</span>
              <span v-if="entry.damage" class="text-secondary"> ({{ entry.damage }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="bg-bg-panel border-t border-color-border p-4">
      <div class="max-w-3xl mx-auto">
        <div v-if="combatStore.isPlayerTurn" class="flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="lg" @click="handleAttack">攻击</Button>
          <Button variant="secondary" size="lg" @click="handleDefend">防御</Button>
          <Button
            v-for="skill in availableSkills"
            :key="skill.id"
            :variant="skill.currentCooldown > 0 || !canUseSkill(skill) ? 'ghost' : 'secondary'"
            size="lg"
            @click="handleUseSkill(skill.id)"
            :disabled="skill.currentCooldown > 0 || !canUseSkill(skill)"
            class="relative"
          >
            {{ skill.name }}
            <span v-if="skill.currentCooldown > 0" class="absolute -top-2 -right-2 bg-secondary text-xs px-2 py-0.5 rounded-full">
              {{ skill.currentCooldown }}
            </span>
          </Button>
          <Button variant="secondary" size="lg" @click="toggleItemPanel" :disabled="!hasItems">
            物品({{ itemCount }})
          </Button>
        </div>
        <div v-else class="text-center">
          <span class="text-text-secondary font-ui animate-pulse">敌人回合...</span>
        </div>

        <!-- 技能选择确认框 -->
        <div v-if="selectedSkill" class="mt-4 p-4 bg-primary/50 rounded-lg border border-accent">
          <div class="flex justify-between items-start mb-3">
            <div>
              <div class="font-gothic text-accent text-lg">{{ selectedSkill.name }}</div>
              <div class="text-text-secondary text-sm mt-1">{{ selectedSkill.description }}</div>
            </div>
            <button @click="selectedSkill = null" class="text-text-secondary hover:text-accent transition-colors">✕</button>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div class="bg-bg-dark p-2 rounded">
              <span class="text-text-secondary">San值消耗:</span>
              <span class="text-purple-400 ml-2 font-bold">{{ selectedSkill.sanCost }}</span>
            </div>
            <div class="bg-bg-dark p-2 rounded">
              <span class="text-text-secondary">冷却时间:</span>
              <span class="text-accent ml-2 font-bold">{{ selectedSkill.cooldown }} 回合</span>
            </div>
          </div>
          <div class="flex gap-3">
            <Button variant="primary" @click="confirmUseSkill" :disabled="!canUseSkill(selectedSkill)">使用技能</Button>
            <Button variant="secondary" @click="selectedSkill = null">取消</Button>
          </div>
        </div>

        <!-- 物品面板 -->
        <div v-if="showItemPanel" class="mt-4 p-4 bg-primary/50 rounded-lg border border-accent">
          <div class="flex justify-between items-center mb-3">
            <div class="font-gothic text-accent">使用物品</div>
            <button @click="showItemPanel = false" class="text-text-secondary hover:text-accent">✕</button>
          </div>
          <div v-if="usableItems.length === 0" class="text-text-secondary text-sm">没有可使用的物品</div>
          <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <button
              v-for="item in usableItems"
              :key="item.id"
              @click="handleUseItem(item.id)"
              class="p-2 bg-bg-dark border border-color-border rounded hover:border-accent text-left transition-colors"
            >
              <div class="text-sm text-text-primary">{{ item.icon }} {{ item.name }}</div>
              <div class="text-xs text-text-secondary">×{{ item.quantity }}</div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 战斗结果 -->
    <div
      v-if="combatStore.phase === 'VICTORY' || combatStore.phase === 'DEFEAT'"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    >
      <div class="bg-bg-panel border border-color-border rounded-lg p-8 text-center max-w-md w-full mx-4">
        <h2 :class="['font-gothic text-4xl mb-4', combatStore.phase === 'VICTORY' ? 'text-accent' : 'text-secondary']">
          {{ combatStore.phase === 'VICTORY' ? '胜利!' : '失败...' }}
        </h2>
        <div v-if="combatStore.resultInfo" class="text-text-secondary mb-6 space-y-1">
          <p v-if="combatStore.resultInfo.victory">你击败了敌人!</p>
          <p v-if="combatStore.resultInfo.victory && combatStore.resultInfo.expGained">
            ✨ 获得 {{ combatStore.resultInfo.expGained }} 经验值
          </p>
          <p v-if="combatStore.resultInfo.victory && combatStore.resultInfo.healAmount">
            💚 恢复 {{ combatStore.resultInfo.healAmount }} 生命值
          </p>
          <p v-if="!combatStore.resultInfo.victory">你被击败了...</p>
        </div>
        <Button variant="primary" @click="handleEndCombat">
          {{ combatStore.phase === 'VICTORY' ? '继续' : '回到主菜单' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useCombatStore } from '../stores/combatStore';
import { useCharacterStore } from '../stores/characterStore';
import { useGameStore, GAME_PHASE } from '../stores/gameStore';
import { audioManager } from '../services/AudioManager';
import Button from '../components/ui/Button.vue';

const router = useRouter();
const combatStore = useCombatStore();
const characterStore = useCharacterStore();
const gameStore = useGameStore();

const selectedSkill = ref(null);
const showItemPanel = ref(false);
const battleArea = ref(null);
const reducedMotion = ref(false);

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
});

const playerHpPercent = computed(() => {
  if (!combatStore.player) return 0;
  return (combatStore.player.hp / combatStore.player.maxHp) * 100;
});

const playerSanPercent = computed(() => {
  if (!combatStore.player) return 0;
  return (combatStore.player.san / combatStore.player.maxSan) * 100;
});

const availableSkills = computed(() => combatStore.player?.skills || []);

const usableItems = computed(() =>
  (characterStore.character?.inventory || []).filter(i => i.usable)
);

const hasItems = computed(() => usableItems.value.length > 0);
const itemCount = computed(
  () => characterStore.character?.inventory?.reduce((s, i) => s + (i.quantity || 1), 0) ?? 0
);

const activeEffects = computed(() => combatStore.player?.activeEffects || []);

function canUseSkill(skill) {
  return (characterStore.currentSan ?? 0) >= skill.sanCost;
}

function getLogColor(result) {
  switch (result) {
    case 'critical': return 'text-accent font-bold';
    case 'hit': return 'text-text-primary';
    case 'miss': return 'text-text-secondary';
    case 'heal': return 'text-color-success';
    default: return 'text-text-primary';
  }
}

function effectLabel(eff) {
  switch (eff.type) {
    case 'damage_bonus': return `伤害+${Math.round((eff.value - 1) * 100)}%`;
    case 'damage_reduction': return `减伤${Math.round(eff.value * 100)}%`;
    default: return eff.type;
  }
}

function handleAttack() {
  audioManager.playHit();
  combatStore.playerAttack();
}

function handleDefend() {
  audioManager.playClick();
  combatStore.playerDefend();
}

function handleUseSkill(skillId) {
  const skill = availableSkills.value.find(s => s.id === skillId);
  if (skill) selectedSkill.value = skill;
}

function confirmUseSkill() {
  if (selectedSkill.value) {
    combatStore.playerUseSkill(selectedSkill.value.id);
    selectedSkill.value = null;
  }
}

function toggleItemPanel() {
  showItemPanel.value = !showItemPanel.value;
}

function handleUseItem(itemId) {
  combatStore.playerUseItem(itemId);
  showItemPanel.value = false;
}

function handleEndCombat() {
  const wasVictory = combatStore.phase === 'VICTORY';

  if (wasVictory) {
    // 胜利：如果有 nextSceneId，推进场景；否则返回原场景
    const nextSceneId = combatStore.nextSceneId;
    combatStore.resetCombat();
    gameStore.setGamePhase(GAME_PHASE.PLAYING);
    if (nextSceneId) {
      gameStore.loadScene(nextSceneId);
    }
    router.push('/game');
  } else {
    // 失败：回到主菜单，角色满血
    if (characterStore.character) {
      characterStore.character.hp = characterStore.maxHp;
      characterStore.character.san = characterStore.maxSan;
    }
    combatStore.resetCombat();
    router.push('/');
  }
}

// ===== 音效：战斗结果 =====
watch(
  () => combatStore.phase,
  (phase) => {
    if (phase === 'VICTORY') {
      audioManager.playVictory();
    } else if (phase === 'DEFEAT') {
      audioManager.playDefeat();
    } else if (phase === 'ENEMY_TURN') {
      // 敌人回合开始
    }
  }
);

// ===== 音效 + 抖动：玩家受击（监听 player.hp 下降）=====
let lastPlayerHp = null;
watch(
  () => combatStore.player?.hp,
  (hp) => {
    if (hp == null || lastPlayerHp == null) {
      lastPlayerHp = hp;
      return;
    }
    if (hp < lastPlayerHp) {
      audioManager.playDamage();
      shakeArea();
    }
    lastPlayerHp = hp;
  }
);

function shakeArea() {
  if (reducedMotion.value || !battleArea.value) return;
  import('gsap').then(({ gsap }) => {
    gsap.fromTo(
      battleArea.value,
      { x: -8 },
      { x: 0, duration: 0.35, ease: 'elastic.out(1, 0.3)' }
    );
  });
}

// ===== 音效：敌人受击 / 暴击 / 未命中（监听日志最新条目）=====
watch(
  () => combatStore.log.length,
  (len) => {
    if (len === 0) return;
    const last = combatStore.log[len - 1];
    // 仅对玩家造成的攻击/技能结果播放（actor 是玩家）
    if (last.actor === combatStore.player?.name) {
      if (last.result === 'critical') audioManager.playCritical();
      else if (last.result === 'hit') audioManager.playHit();
      else if (last.result === 'miss') audioManager.playMiss();
      else if (last.result === 'heal') audioManager.playHeal();
    }
  }
);
</script>
