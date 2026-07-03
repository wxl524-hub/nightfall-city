<template>
  <div class="min-h-screen bg-bg-dark p-8">
    <div class="max-w-3xl mx-auto">
      <h1 class="font-gothic text-4xl text-accent text-center mb-8">
        选择剧本
      </h1>

      <div class="grid gap-6">
        <div
          v-for="scenario in scenarios"
          :key="scenario.id"
          class="bg-bg-panel border border-color-border rounded-lg p-6 hover:border-accent transition-all duration-300 cursor-pointer"
          @click="selectScenario(scenario)"
        >
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h2 class="font-gothic text-2xl text-text-primary mb-1">{{ scenario.title }}</h2>
              <p class="text-text-secondary text-sm">{{ scenario.description }}</p>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded text-sm font-ui whitespace-nowrap ml-3',
                difficultyClass(scenario.difficulty)
              ]"
            >
              {{ getDifficultyText(scenario.difficulty) }}
            </span>
          </div>
          <div class="text-text-secondary text-sm">
            <span>章节: {{ scenario.chapters?.length || 0 }}</span>
            <span class="mx-2">·</span>
            <span>难度: {{ getDifficultyText(scenario.difficulty) }}</span>
          </div>
        </div>
      </div>

      <div class="mt-8 text-center">
        <Button variant="ghost" @click="goBack">
          返回
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/gameStore';
import { getScenario } from '../data/scenarios';
import Button from '../components/ui/Button.vue';

const router = useRouter();
const gameStore = useGameStore();

// 从真实剧本数据派生列表
const scenarios = ref(
  Object.values({ 'the-abandoned-hospital': getScenario('the-abandoned-hospital') })
    .filter(Boolean)
    .map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      difficulty: s.difficulty,
      chapters: s.chapters
    }))
);

function getDifficultyText(difficulty) {
  const texts = {
    easy: '简单',
    normal: '普通',
    hard: '困难',
    nightmare: '噩梦'
  };
  return texts[difficulty] || '普通';
}

function difficultyClass(difficulty) {
  return {
    easy: 'bg-color-success text-white',
    normal: 'bg-accent text-primary',
    hard: 'bg-secondary text-white',
    nightmare: 'bg-red-900 text-white'
  }[difficulty] || 'bg-accent text-primary';
}

function selectScenario(scenario) {
  gameStore.loadScenario(scenario.id);
  router.push('/game');
}

function goBack() {
  router.push('/create');
}
</script>
