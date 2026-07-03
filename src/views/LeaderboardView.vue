<template>
  <div class="min-h-screen bg-bg-dark p-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="font-gothic text-4xl text-accent text-center mb-2">
        排行榜
      </h1>
      <p class="text-text-secondary text-sm text-center mb-8">
        <span v-if="!online" class="text-secondary">⚠ 后端未连接（{{ reason }}）</span>
        <span v-else-if="entries.length === 0">尚无记录，去创造第一个传说吧</span>
        <span v-else>共 {{ entries.length }} 位调查员的战绩</span>
      </p>

      <div class="space-y-2 mb-8">
        <div
          v-for="(entry, idx) in entries"
          :key="entry.playerId + idx"
          :class="[
            'bg-bg-panel border rounded-lg p-4 flex items-center gap-4',
            isMe(entry.playerId) ? 'border-accent' : 'border-color-border'
          ]"
        >
          <div :class="['font-gothic text-2xl w-10 text-center', rankColor(idx)]">
            {{ idx + 1 }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-text-primary font-bold truncate">
              {{ entry.playerName }}
              <span v-if="isMe(entry.playerId)" class="text-accent text-xs">（你）</span>
            </div>
            <div class="text-text-secondary text-xs flex gap-3">
              <span>Lv.{{ entry.level }}</span>
              <span>{{ entry.victory ? '🏆 通关' : '💀 陨落' }}</span>
              <span>{{ formatDate(entry.createdAt) }}</span>
            </div>
          </div>
          <div class="text-accent font-gothic text-xl whitespace-nowrap">
            {{ entry.score }}
          </div>
        </div>
      </div>

      <div class="text-center">
        <Button variant="ghost" @click="goBack">返回</Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { cloudSync } from '../services/CloudSyncService';
import Button from '../components/ui/Button.vue';

const router = useRouter();
const entries = ref([]);
const online = ref(false);
const reason = ref('检查中...');

onMounted(async () => {
  online.value = await cloudSync.isOnline();
  if (!online.value) {
    reason.value = '请先启动后端 npm run server';
    return;
  }
  entries.value = await cloudSync.fetchLeaderboard();
});

function isMe(playerId) {
  return playerId === cloudSync.getPlayerId();
}

function rankColor(idx) {
  if (idx === 0) return 'text-yellow-400';
  if (idx === 1) return 'text-gray-300';
  if (idx === 2) return 'text-orange-400';
  return 'text-text-secondary';
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('zh-CN');
}

function goBack() {
  router.push('/');
}
</script>
