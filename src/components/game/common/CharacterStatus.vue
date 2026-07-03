<script setup>
import { useCharacterStore } from '../../../stores/characterStore';

defineProps({
  compact: Boolean
});

const characterStore = useCharacterStore();

function getClassName(className) {
  const classMap = {
    investigator: '调查员',
    medium: '灵媒师',
    mage: '法师',
    hunter: '猎人'
  };
  return classMap[className] || '未知';
}

function getAttrName(attr) {
  const attrMap = {
    strength: '力量',
    agility: '敏捷',
    intelligence: '智力',
    perception: '感知',
    charisma: '魅力',
    willpower: '意志'
  };
  return attrMap[attr] || attr;
}
</script>

<template>
  <div :class="[
    'bg-bg-panel rounded-lg border border-color-border p-4 gothic-border',
    compact ? 'flex items-center gap-4' : 'flex flex-col gap-3'
  ]">
    <div :class="['flex items-center gap-3', compact ? '' : 'justify-center']">
      <div class="w-12 h-12 rounded-full bg-primary border-2 border-accent flex items-center justify-center">
        <span class="font-gothic text-accent text-xl">
          {{ characterStore.character?.name?.charAt(0) || '?' }}
        </span>
      </div>
      <div>
        <h3 class="font-gothic text-text-primary">{{ characterStore.character?.name || '未创建角色' }}</h3>
        <p class="text-text-secondary text-sm">
          {{ getClassName(characterStore.character?.class) }}
        </p>
      </div>
    </div>
    
    <div :class="['w-full space-y-3', compact ? 'flex-1' : '']">
      <div>
        <div class="flex justify-between text-sm mb-1">
          <span class="text-text-secondary">生命值</span>
          <span class="text-text-primary">
            {{ characterStore.currentHp }} / {{ characterStore.maxHp }}
          </span>
        </div>
        <div class="h-3 bg-bg-dark rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-secondary to-red-500 transition-all duration-500"
            :style="{ width: `${characterStore.hpPercentage}%` }"
          />
        </div>
      </div>
      
      <div>
        <div class="flex justify-between text-sm mb-1">
          <span class="text-text-secondary">San值</span>
          <span :class="['text-text-primary', characterStore.isInsane ? 'text-red-500 font-bold animate-pulse' : '']">
            {{ characterStore.currentSan }} / {{ characterStore.maxSan }}
            <span v-if="characterStore.isInsane" class="text-xs">💀 理智崩溃</span>
          </span>
        </div>
        <div class="h-2 bg-bg-dark rounded-full overflow-hidden">
          <div
            :class="['h-full transition-all duration-500', characterStore.isInsane ? 'bg-gradient-to-r from-red-600 to-red-400 animate-pulse' : 'bg-gradient-to-r from-purple-600 to-purple-400']"
            :style="{ width: `${characterStore.sanPercentage}%` }"
          />
        </div>
      </div>
      
      <div>
        <div class="flex justify-between text-sm mb-1">
          <span class="text-text-secondary">经验值</span>
          <span class="text-accent">
            Lv.{{ characterStore.level }} - {{ characterStore.experience }} / {{ characterStore.expToNextLevel }}
          </span>
        </div>
        <div class="h-2 bg-bg-dark rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-accent to-yellow-400 transition-all duration-500"
            :style="{ width: `${characterStore.expPercentage}%` }"
          />
        </div>
      </div>
    </div>
    
    <div v-if="!compact" class="grid grid-cols-3 gap-2 w-full">
      <div
        v-for="(value, key) in characterStore.character?.attributes"
        :key="key"
        class="text-center"
      >
        <div class="text-text-accent font-gothic text-lg">{{ value }}</div>
        <div class="text-text-secondary text-xs uppercase">{{ getAttrName(key) }}</div>
      </div>
    </div>
  </div>
</template>
