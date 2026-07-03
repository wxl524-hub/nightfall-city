<script setup>
import { computed } from 'vue';

const props = defineProps({
  current: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['hp', 'mp', 'exp', 'default'].includes(value)
  },
  showLabel: Boolean,
  animate: {
    type: Boolean,
    default: true
  }
});

const percentage = computed(() => {
  return Math.min(100, Math.max(0, (props.current / props.max) * 100));
});
</script>

<template>
  <div class="progress-bar-container">
    <div class="flex justify-between text-sm mb-1" v-if="showLabel">
      <span class="text-text-secondary">{{ current }} / {{ max }}</span>
    </div>
    <div class="h-3 bg-bg-dark rounded-full overflow-hidden border border-color-border">
      <div
        :class="[
          'h-full transition-all duration-500',
          {
            'bg-gradient-to-r from-secondary to-red-500': variant === 'hp',
            'bg-gradient-to-r from-color-mana to-purple-500': variant === 'mp',
            'bg-gradient-to-r from-accent to-yellow-400': variant === 'exp',
            'bg-gradient-to-r from-color-success to-green-400': variant === 'default'
          }
        ]"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>
