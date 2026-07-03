<script setup>
import { computed } from 'vue';
import { useCharacterStore } from '../../../stores/characterStore';

const emit = defineEmits(['close']);
const characterStore = useCharacterStore();

const inventory = computed(() => characterStore.character?.inventory ?? []);
const grouped = computed(() => {
  const map = { key: [], weapon: [], consumable: [] };
  inventory.value.forEach(item => {
    const t = item.type || 'key';
    if (!map[t]) map[t] = [];
    map[t].push(item);
  });
  return map;
});

const typeLabels = {
  key: '关键道具',
  weapon: '武器装备',
  consumable: '消耗品'
};

function use(item) {
  if (!item.usable) return;
  characterStore.useItem(item.id);
}

function typeName(type) {
  return typeLabels[type] || '其它';
}
</script>

<template>
  <div
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    @click.self="emit('close')"
  >
    <div class="bg-bg-panel border border-color-border rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-gothic text-accent text-xl">物品栏</h3>
        <button @click="emit('close')" class="text-text-secondary hover:text-accent text-xl">✕</button>
      </div>

      <div v-if="inventory.length === 0" class="text-center text-text-secondary py-8">
        包裹空空如也...
      </div>

      <div v-else class="space-y-4">
        <div v-for="(items, type) in grouped" :key="type">
          <div v-if="items.length" class="text-text-secondary text-xs uppercase tracking-wider mb-2">
            {{ typeName(type) }}
          </div>
          <div class="space-y-2">
            <div
              v-for="item in items"
              :key="item.id"
              class="flex items-center gap-3 p-3 bg-bg-dark rounded-lg border border-color-border"
            >
              <span class="text-2xl">{{ item.icon || '📦' }}</span>
              <div class="flex-1 min-w-0">
                <div class="text-text-primary text-sm font-bold flex items-center gap-2">
                  {{ item.name }}
                  <span v-if="item.quantity > 1" class="text-text-secondary text-xs">×{{ item.quantity }}</span>
                </div>
                <div class="text-text-secondary text-xs">{{ item.description }}</div>
              </div>
              <button
                v-if="item.usable"
                @click="use(item)"
                class="px-3 py-1 bg-accent text-primary text-xs rounded hover:bg-yellow-500 transition-colors"
              >
                使用
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 text-center">
        <button
          @click="emit('close')"
          class="px-6 py-2 text-text-secondary hover:text-accent font-ui"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>
