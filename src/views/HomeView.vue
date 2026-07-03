<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-bg-dark relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
    </div>

    <!-- 主标题 -->
    <div class="relative z-10 text-center animate-fade-in">
      <h1 class="font-gothic text-6xl md:text-8xl text-accent mb-4 tracking-wider">
        暗夜都市
      </h1>
      <p class="font-body text-2xl text-text-secondary mb-2">
        Nightfall City
      </p>
      <p class="font-ui text-lg text-text-secondary/70 mb-12">
        都市奇幻 TRPG 网页游戏
      </p>
    </div>

    <!-- 菜单按钮 -->
    <div class="relative z-10 flex flex-col gap-4 mt-8 w-full max-w-xs">
      <Button variant="primary" size="lg" @click="handleStartNewGame">
        开始新游戏
      </Button>

      <Button v-if="hasSave" variant="secondary" size="lg" @click="handleContinue">
        继续游戏
      </Button>

      <Button variant="ghost" size="md" @click="handleOpenSaves">
        存档管理
      </Button>

      <Button variant="ghost" size="md" @click="handleAbout">
        关于游戏
      </Button>

      <Button variant="ghost" size="md" @click="router.push('/leaderboard')">
        排行榜
      </Button>
    </div>

    <!-- 底部信息 -->
    <div class="absolute bottom-8 text-center">
      <p class="font-ui text-sm text-text-secondary/50">
        D&D 风格 · 都市奇幻 · 暗黑哥特
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/gameStore';
import { useCharacterStore } from '../stores/characterStore';
import { useCombatStore } from '../stores/combatStore';
import { saveService } from '../services/SaveService';
import Button from '../components/ui/Button.vue';

const router = useRouter();
const gameStore = useGameStore();
const characterStore = useCharacterStore();
const combatStore = useCombatStore();
const hasSave = ref(false);

onMounted(async () => {
  hasSave.value = await saveService.hasAutoSave();
});

function handleStartNewGame() {
  characterStore.resetCharacter();
  combatStore.resetCombat();
  gameStore.startNewGame();
  router.push('/create');
}

async function handleContinue() {
  const saveData = await saveService.getAutoSave();
  if (!saveData) {
    alert('没有可用的存档');
    return;
  }
  loadSave(saveData);
}

function handleOpenSaves() {
  router.push('/save');
}

function handleAbout() {
  alert('暗夜都市 v1.1.0\n都市奇幻 TRPG 网页游戏\n基于 D&D 掷骰判定系统\n\n调查、战斗、揭开圣玛丽医院的秘密。');
}

// 加载存档到各 store 并跳转
function loadSave(saveData) {
  characterStore.setCharacter(saveData.character);
  gameStore.loadFromSave(saveData);
  router.push('/game');
}
</script>
