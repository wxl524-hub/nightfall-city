<template>
  <div class="min-h-screen bg-bg-dark p-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="font-gothic text-4xl text-accent text-center mb-8">
        存档管理
      </h1>

      <!-- 自动存档 -->
      <div v-if="autoSaveMeta" class="mb-6">
        <div class="text-text-secondary text-xs uppercase tracking-wider mb-2">自动存档</div>
        <div class="bg-bg-panel border border-accent/40 rounded-lg p-4 flex justify-between items-center">
          <div>
            <h3 class="font-gothic text-text-primary">{{ autoSaveMeta.characterName }}</h3>
            <p class="text-sm text-text-secondary">
              Lv.{{ autoSaveMeta.level }} · {{ getClassName(autoSaveMeta.characterClass) }}
            </p>
            <p class="text-xs text-text-secondary/70 mt-1">{{ formatDate(autoSaveMeta.timestamp) }}</p>
          </div>
          <div class="flex gap-2">
            <Button variant="primary" size="sm" @click="loadAutoSave">加载</Button>
          </div>
        </div>
      </div>

      <!-- 手动存档 -->
      <div class="mb-4 flex justify-between items-center">
        <div class="text-text-secondary text-xs uppercase tracking-wider">手动存档</div>
        <Button variant="secondary" size="sm" @click="createManualSave" :disabled="!hasCharacter">
          {{ hasCharacter ? '保存当前进度' : '进入游戏后可存档' }}
        </Button>
      </div>

      <div class="space-y-3 mb-8">
        <div
          v-for="save in saves"
          :key="save.id"
          class="bg-bg-panel border border-color-border rounded-lg p-4 hover:border-accent transition-all"
        >
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="font-gothic text-text-primary">{{ save.characterName }}</h3>
              <p class="text-sm text-text-secondary">
                Lv.{{ save.level }} · {{ getClassName(save.characterClass) }}
              </p>
            </div>
            <span class="text-sm text-text-secondary">
              {{ formatDate(save.timestamp) }}
            </span>
          </div>
          <div class="flex gap-2 mt-4">
            <Button variant="primary" size="sm" @click="loadSave(save.id)">加载</Button>
            <Button variant="danger" size="sm" @click="deleteSave(save.id)">删除</Button>
          </div>
        </div>

        <div v-if="saves.length === 0 && !autoSaveMeta" class="text-center text-text-secondary py-8">
          暂无存档
        </div>
      </div>

      <div class="text-center">
        <Button variant="ghost" @click="goBack">返回</Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCharacterStore } from '../stores/characterStore';
import { useGameStore } from '../stores/gameStore';
import { saveService } from '../services/SaveService';
import Button from '../components/ui/Button.vue';

const router = useRouter();
const characterStore = useCharacterStore();
const gameStore = useGameStore();
const saves = ref([]);
const autoSaveMeta = ref(null);

const hasCharacter = computed(() => !!characterStore.character && !!gameStore.currentScenarioId);

onMounted(async () => {
  await refresh();
});

async function refresh() {
  saves.value = (await saveService.getAllSaves()).filter(s => s.id !== 'autosave');
  const auto = await saveService.getAutoSave();
  if (auto) {
    autoSaveMeta.value = saveService.toMetadata(auto);
    autoSaveMeta.value.id = 'autosave';
  } else {
    autoSaveMeta.value = null;
  }
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString('zh-CN');
}

function getClassName(cls) {
  const map = {
    investigator: '调查员',
    medium: '灵媒师',
    mage: '法师',
    hunter: '猎人'
  };
  return map[cls] || '未知';
}

async function loadSave(saveId) {
  try {
    const saveData = await saveService.load(saveId);
    characterStore.setCharacter(saveData.character);
    gameStore.loadFromSave(saveData);
    router.push('/game');
  } catch (error) {
    alert('加载失败: ' + error.message);
  }
}

async function loadAutoSave() {
  const saveData = await saveService.getAutoSave();
  if (!saveData) {
    alert('自动存档不存在');
    return;
  }
  characterStore.setCharacter(saveData.character);
  gameStore.loadFromSave(saveData);
  router.push('/game');
}

async function deleteSave(saveId) {
  if (!confirm('确定要删除这个存档吗?')) return;
  await saveService.deleteSave(saveId);
  await refresh();
}

// 创建一个手动存档槽位
async function createManualSave() {
  try {
    const saveData = {
      id: 'save-' + Date.now(),
      timestamp: Date.now(),
      character: characterStore.character,
      currentScenarioId: gameStore.currentScenarioId,
      currentChapterIndex: gameStore.currentChapterIndex,
      currentSceneId: gameStore.currentSceneId,
      sceneHistory: gameStore.sceneHistory,
      collectedClues: gameStore.collectedClues,
      collectedItems: gameStore.collectedItems,
      stats: gameStore.stats,
      bonusInfo: gameStore.bonusInfo,
      gameVersion: saveService.GAME_VERSION
    };
    await saveService.save(saveData);
    await refresh();
  } catch (error) {
    alert('存档失败: ' + error.message);
  }
}

function goBack() {
  router.back();
}
</script>
